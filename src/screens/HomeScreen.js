import React, { useEffect, useState, useContext } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  FlatList,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import API_URL from "../config";

import BalanceCard from "../components/BalanceCard";
import GrupoItem from "../components/GrupoItem";
import CrearGrupoModal from "../components/CrearGrupoModal";
import EditarGrupoModal from "../components/EditarGrupoModal";

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [balance, setBalance] = useState(0);
  const [totalAFavor, setTotalAFavor] = useState(0);
  const [totalAdeudado, setTotalAdeudado] = useState(0);

  // Modal Crear
  const [modalCrearVisible, setModalCrearVisible] = useState(false);
  const [nombreGrupo, setNombreGrupo] = useState("");
  const [imagenGrupo, setImagenGrupo] = useState("");

  // Modal Editar
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [grupoIdEdit, setGrupoIdEdit] = useState(null);
  const [nombreGrupoEdit, setNombreGrupoEdit] = useState("");
  const [imagenGrupoEdit, setImagenGrupoEdit] = useState("");

  useEffect(() => {
    obtenerGrupos();
    obtenerBalance();
  }, []);

  const obtenerGrupos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/grupos`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setGrupos(response.data);
    } catch (error) {
      Alert.alert("Error", "No se pudieron obtener los grupos.");
    } finally {
      setLoading(false);
    }
  };

  const obtenerBalance = async () => {
    try {
      const response = await axios.get(`${API_URL}/balance`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const { balance, total_a_favor, total_adeudado } = response.data;
      setBalance(balance);
      setTotalAFavor(total_a_favor);
      setTotalAdeudado(total_adeudado);
    } catch (error) {
      console.error("Error obteniendo balance:", error);
    }
  };

  const crearGrupo = async () => {
    try {
      if (!nombreGrupo.trim()) {
        Alert.alert("Error", "El nombre del grupo es obligatorio");
        return;
      }

      const response = await axios.post(
        `${API_URL}/grupos`,
        { nombre: nombreGrupo, imagen: imagenGrupo },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setGrupos([...grupos, response.data]);
      setModalCrearVisible(false);
      setNombreGrupo("");
      setImagenGrupo("");
      obtenerBalance();
      Alert.alert("Éxito", "Grupo creado correctamente");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo crear el grupo");
    }
  };

  const eliminarGrupo = async (id) => {
    try {
      await axios.delete(`${API_URL}/grupos/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      obtenerGrupos();
      obtenerBalance();
      Alert.alert("Éxito", "Grupo eliminado correctamente");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo eliminar el grupo.");
    }
  };

  const confirmarEliminarGrupo = async (id) => {
    try {
      const resumen = await axios.get(`${API_URL}/deudas/resumen/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const tieneDeudas = resumen.data.length > 0;

      Alert.alert(
        "Eliminar Grupo",
        tieneDeudas
          ? "Este grupo tiene deudas pendientes. ¿Deseas eliminarlo y liquidarlas?"
          : "¿Estás seguro que deseas eliminar este grupo?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Eliminar", style: "destructive", onPress: () => eliminarGrupo(id) },
        ]
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo verificar las deudas.");
    }
  };

  const abrirModalEditarGrupo = (grupo) => {
    setGrupoIdEdit(grupo.id);
    setNombreGrupoEdit(grupo.nombre);
    setImagenGrupoEdit(grupo.imagen || "");
    setModalEditarVisible(true);
  };

  const editarGrupo = async () => {
    try {
      if (!nombreGrupoEdit.trim()) {
        Alert.alert("Error", "El nombre del grupo es obligatorio");
        return;
      }

      await axios.put(
        `${API_URL}/grupos/${grupoIdEdit}`,
        { nombre: nombreGrupoEdit, imagen: imagenGrupoEdit },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setModalEditarVisible(false);
      obtenerGrupos();
      obtenerBalance();
      Alert.alert("Éxito", "Grupo actualizado");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo editar el grupo.");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await obtenerGrupos();
    await obtenerBalance();
    setRefreshing(false);
  };

  const irADetalleGrupo = (grupoId) => {
    navigation.navigate("GrupoDetalle", { grupoId });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Bienvenido</Text>
          <Text style={styles.nombreUsuario}>{user.nombreCompleto}</Text>
          <Text style={styles.userPlan}>Basic</Text>
        </View>
        <Image
          source={{
            uri:
              user?.imagen_perfil ||
              "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
          }}
          style={styles.avatar}
        />
      </View>

      {/* Balance */}
      <BalanceCard
        balance={balance}
        totalAFavor={totalAFavor}
        totalAdeudado={totalAdeudado}
      />

      {/* Botón Nuevo Grupo */}
      <TouchableOpacity style={styles.botonNuevoGrupo} onPress={() => setModalCrearVisible(true)}>
        <Text style={styles.textoBotonNuevoGrupo}>+ Nuevo Grupo</Text>
      </TouchableOpacity>


      {/* Título sección */}
      <Text style={styles.sectionTitle}>Grupos</Text>

      {/* Lista de grupos */}
      <FlatList
        data={grupos}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <GrupoItem
            grupo={item}
            onPress={irADetalleGrupo}
            onEditar={abrirModalEditarGrupo}
            onEliminar={confirmarEliminarGrupo}
          />
        )}
      />

      {/* Modal Crear */}
      <CrearGrupoModal
        visible={modalCrearVisible}
        onClose={() => setModalCrearVisible(false)}
        onCreate={crearGrupo}
        nombreGrupo={nombreGrupo}
        imagenGrupo={imagenGrupo}
        setNombreGrupo={setNombreGrupo}
        setImagenGrupo={setImagenGrupo}
      />

      {/* Modal Editar */}
      <EditarGrupoModal
        visible={modalEditarVisible}
        onClose={() => setModalEditarVisible(false)}
        onSave={editarGrupo}
        nombreGrupo={nombreGrupoEdit}
        imagenGrupo={imagenGrupoEdit}
        setNombreGrupo={setNombreGrupoEdit}
        setImagenGrupo={setImagenGrupoEdit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  welcome: { fontSize: 16, color: "#666" },
  nombreUsuario: { fontSize: 20, fontWeight: "bold" },
  userPlan: { fontSize: 14, color: "#888" },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  nuevoGrupo: {
    backgroundColor: "#2a5298",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  nuevoGrupoTexto: {
    fontSize: 16,
    color: "#007aff",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 4,
  },
  botonNuevoGrupo: {
    backgroundColor: "#2a5298",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  textoBotonNuevoGrupo: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

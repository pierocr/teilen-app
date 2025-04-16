import React, { useEffect, useState, useContext } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import API_URL from "../config";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as Progress from "react-native-progress";

import BalanceCard from "../components/BalanceCard";
import GrupoItem from "../components/GrupoItem";
import CrearGrupoModal from "../components/CrearGrupoModal";
import EditarGrupoModal from "../components/EditarGrupoModal";
import InfoModal from "../components/InfoModal";

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [balance, setBalance] = useState(0);
  const progresoPago =
    totalAdeudado + totalAFavor > 0
      ? totalAFavor / (totalAdeudado + totalAFavor)
      : 0;
  const [totalAFavor, setTotalAFavor] = useState(0);
  const [totalAdeudado, setTotalAdeudado] = useState(0);

  const [modalCrearVisible, setModalCrearVisible] = useState(false);
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [modalInfoVisible, setModalInfoVisible] = useState(false);

  const [nombreGrupo, setNombreGrupo] = useState("");
  const [imagenGrupo, setImagenGrupo] = useState("");
  const [grupoIdEdit, setGrupoIdEdit] = useState(null);
  const [nombreGrupoEdit, setNombreGrupoEdit] = useState("");
  const [imagenGrupoEdit, setImagenGrupoEdit] = useState("");

  useEffect(() => {
    if (!modalCrearVisible) {
      setLoading(true);
      cargarDatos();
    }
  }, [modalCrearVisible]);

  const cargarDatos = async () => {
    setLoading(true);
    await Promise.all([obtenerGrupos(), obtenerBalance()]);
    setLoading(false);
  };

  const obtenerGrupos = async () => {
    try {
      const response = await axios.get(`${API_URL}/grupos`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const gruposOrdenados = response.data.sort((a, b) => b.id - a.id);
      setGrupos(gruposOrdenados);
    } catch (error) {
      Alert.alert("Error", "No se pudieron obtener los grupos.");
    }
  };

  const obtenerBalance = async () => {
    try {
      const response = await axios.get(`${API_URL}/usuarios/resumen`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const { total_a_favor, total_adeudado, total_por_cobrar } = response.data;
      const balanceCalculado = (total_por_cobrar || 0) - (total_adeudado || 0);
      setBalance(balanceCalculado);
      setTotalAFavor(total_a_favor);
      setTotalAdeudado(total_adeudado);
    } catch (error) {
      console.error("Error obteniendo balance:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarDatos();
    setRefreshing(false);
  };

  const crearGrupo = async () => {
    if (!nombreGrupo.trim()) {
      Alert.alert("Error", "El nombre del grupo es obligatorio");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/grupos`,
        { nombre: nombreGrupo, imagen: imagenGrupo },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setModalCrearVisible(false);
      setNombreGrupo("");
      setImagenGrupo("");
      await cargarDatos();
      Alert.alert("Éxito", "Grupo creado correctamente");
    } catch {
      Alert.alert("Error", "No se pudo crear el grupo");
    }
  };

  const eliminarGrupo = async (id) => {
    try {
      await axios.delete(`${API_URL}/grupos/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      await cargarDatos();
      Alert.alert("Éxito", "Grupo eliminado correctamente");
    } catch {
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
          {
            text: "Eliminar",
            style: "destructive",
            onPress: () => eliminarGrupo(id),
          },
        ]
      );
    } catch {
      Alert.alert("Error", "No se pudo verificar las deudas.");
    }
  };

  const abrirModalEditarGrupo = (grupo) => {
    setGrupoIdEdit(grupo.id);
    setNombreGrupoEdit(grupo.nombre);
    setImagenGrupoEdit(grupo.imagen || "");
    setModalEditarVisible(true);
  };

  const editarGrupo = async (nuevoNombre, nuevaImagen, grupoId) => {
    try {
      await axios.put(
        `${API_URL}/grupos/${grupoId}`,
        { nombre: nuevoNombre, imagen: nuevaImagen },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setModalEditarVisible(false);
      await cargarDatos();
      Alert.alert("Éxito", "Grupo actualizado");
    } catch (error) {
      console.error("❌ Error al editar grupo:", error);
      Alert.alert("Error", "No se pudo editar el grupo.");
    }
  };

  const irADetalleGrupo = (grupoId, grupoNombre, grupoImagen) => {
    navigation.navigate("GrupoDetalle", { grupoId, grupoNombre, grupoImagen });
  };  

  return (
    <SafeAreaView style={styles.container}>
      {/* Header usuario */}
      <View style={styles.header}>
      {/* Avatar a la izquierda */}
      <TouchableOpacity onPress={() => navigation.navigate("Cuenta")}>
        <Image
          source={{
            uri:
              user?.imagen_perfil ||
              "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
          }}
          style={styles.avatar}
        />
      </TouchableOpacity>

      {/* Texto "Hola Piero Alonso" en el centro (o justificado a la izquierda) */}
      <View style={styles.userInfo}>
        <Text style={styles.greeting}>
          Hola, <Text style={styles.nombreUsuario}>{user?.nombreCompleto || "Usuario"}</Text>
        </Text>
      </View>

      {/* Ícono de notificaciones a la derecha */}
      <TouchableOpacity onPress={() => console.log("Notificaciones")}>
        <Ionicons name="notifications-outline" size={22} color="#666" />
      </TouchableOpacity>
    </View>

      <BalanceCard
        balance={balance}
        totalAFavor={totalAFavor}
        totalAdeudado={totalAdeudado}
      />

      <View style={styles.estadoResumen}>
        <Ionicons
          name={
            balance === 0
              ? "checkmark-circle-outline"
              : balance > 0
              ? "happy-outline"
              : "trending-down-outline"
          }
          size={20}
          color={balance === 0 ? "green" : balance > 0 ? "#4CAF50" : "#e53935"}
          style={{ marginRight: 6 }}
        />
        <Text style={styles.estadoTexto}>
          {balance === 0
            ? "¡Todas tus deudas están saldadas! 🎉"
            : balance > 0
            ? "¡Estás en positivo! Tus amigos te deben dinero 😎"
            : "Aún tienes deudas por saldar, ¡tú puedes!"}
        </Text>
      </View>
      {/* <View style={styles.progressContainer}>
  <Text style={styles.progressLabel}>Progreso de pagos:</Text>
  <Progress.Bar
    progress={progresoPago}
    width={null}
    height={10}
    borderRadius={8}
    color="#4CAF50"
    unfilledColor="#E0E0E0"
    borderWidth={0}
  />
  <Text style={styles.progressTexto}>
    {Math.round(progresoPago * 100)}% del total está saldado
  </Text>
</View> */}

      {/* Encabezado de Grupos */}
      <View style={styles.headerGrupos}>
        <View style={styles.tituloGrupos}>
          <Text style={styles.sectionTitle}>Grupos</Text>
          <TouchableOpacity onPress={() => setModalInfoVisible(true)}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#2a5298"
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.botonNuevoGrupo}
          onPress={() => setModalCrearVisible(true)}
        >
          <View style={styles.contenidoBoton}>
            <Ionicons
              name="add-circle-outline"
              size={18}
              color="#fff"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.textoBotonNuevoGrupo}>Nuevo Grupo</Text>
          </View>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#999" />
          <Text style={{ marginTop: 10 }}>Cargando grupos...</Text>
        </View>
      ) : (
        <FlatList
          data={grupos}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
<GrupoItem
  grupo={item}
  onPress={() => irADetalleGrupo(item.id, item.nombre, item.imagen)}
  onEditar={abrirModalEditarGrupo}
  onEliminar={confirmarEliminarGrupo}
/>

          )}
        />
      )}

      {/* Modales */}
      <CrearGrupoModal
        visible={modalCrearVisible}
        onClose={() => setModalCrearVisible(false)}
        nombreGrupo={nombreGrupo}
        imagenGrupo={imagenGrupo}
        setNombreGrupo={setNombreGrupo}
        setImagenGrupo={setImagenGrupo}
      />

      <EditarGrupoModal
        visible={modalEditarVisible}
        onClose={() => setModalEditarVisible(false)}
        onSave={editarGrupo}
        nombreGrupo={nombreGrupoEdit}
        imagenGrupo={imagenGrupoEdit}
        setNombreGrupo={setNombreGrupoEdit}
        setImagenGrupo={setImagenGrupoEdit}
        grupoId={grupoIdEdit}
      />

      <InfoModal
        visible={modalInfoVisible}
        onClose={() => setModalInfoVisible(false)}
        title="¿Qué son los grupos?"
        description="Los grupos te permiten organizar gastos compartidos con amigos, familia o compañeros de trabajo. Puedes añadir participantes, registrar gastos y dividirlos fácilmente."
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
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  saludo: {
    fontSize: 14,
    color: "#888",
  },
  nombreUsuario: {
    fontSize: 25,
    fontWeight: "bold",
  },
  subtextoUsuario: {
    fontSize: 13,
    color: "#999",
  },
  headerGrupos: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 10,
  },
  tituloGrupos: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  botonNuevoGrupo: {
    backgroundColor: "#2a5298",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  contenidoBoton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  textoBotonNuevoGrupo: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  estadoResumen: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6F4EA",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  estadoTexto: {
    fontSize: 14,
    color: "#2a6e3f",
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  progressTexto: {
    marginTop: 6,
    fontSize: 13,
    color: "#444",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    elevation: 0, // pequeña sombra, opcional
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  nameContainer: {
    marginLeft: 12,
  },
  nombreUsuario: {
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  greeting: {
    fontSize: 20,
    color: "#333",
  },
});

// HomeScreen.js
import React, { useEffect, useState, useContext } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Button,
  Platform,
  TextInput,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import API_URL from "../config";

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  // Lista de grupos
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Nuevo estado para el balance
  const [balance, setBalance] = useState(0);
  const [totalAFavor, setTotalAFavor] = useState(0);
  const [totalAdeudado, setTotalAdeudado] = useState(0);

  // ============= Crear Grupo =============
  const [modalCrearVisible, setModalCrearVisible] = useState(false);
  const [nombreGrupo, setNombreGrupo] = useState("");
  const [imagenGrupo, setImagenGrupo] = useState("");

  // ============= Editar Grupo =============
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [grupoIdEdit, setGrupoIdEdit] = useState(null);
  const [nombreGrupoEdit, setNombreGrupoEdit] = useState("");
  const [imagenGrupoEdit, setImagenGrupoEdit] = useState("");

  // Obtener los grupos
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

  // Obtener el balance (ejemplo)
  const obtenerBalance = async () => {
    try {
      const resp = await axios.get(`${API_URL}/balance`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const { balance, total_a_favor, total_adeudado } = resp.data;
      setBalance(balance);
      setTotalAFavor(total_a_favor);
      setTotalAdeudado(total_adeudado);
    } catch (error) {
      // si falla, deja en 0
      console.error("Error obteniendo balance:", error);
    }
  };

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await obtenerGrupos();
    await obtenerBalance();
    setRefreshing(false);
  };

  useEffect(() => {
    obtenerGrupos();
    obtenerBalance();
  }, []);

  // Crear Grupo
  const crearGrupo = async () => {
    try {
      if (!nombreGrupo.trim()) {
        Alert.alert("Error", "El nombre del grupo es obligatorio");
        return;
      }

      const response = await axios.post(
        `${API_URL}/grupos`,
        {
          nombre: nombreGrupo,
          imagen: imagenGrupo,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setGrupos([...grupos, response.data]);
      setNombreGrupo("");
      setImagenGrupo("");
      setModalCrearVisible(false);

      Alert.alert("Éxito", "Grupo creado correctamente");
      // También podrías volver a pedir el balance si lo deseas
      obtenerBalance();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo crear el grupo");
    }
  };

  // Confirmar Eliminar Grupo
  const confirmarEliminarGrupo = async (grupoId) => {
    try {
      // Revisar si hay deudas
      const resumenResp = await axios.get(
        `${API_URL}/deudas/resumen/${grupoId}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      const hayDeudas = resumenResp.data.length > 0;

      Alert.alert(
        "Eliminar Grupo",
        hayDeudas
          ? "Este grupo tiene deudas pendientes. ¿Deseas eliminarlo y liquidar todas las deudas?"
          : "¿Estás seguro que deseas eliminar este grupo?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: () => eliminarGrupo(grupoId),
          },
        ]
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo verificar las deudas del grupo.");
    }
  };

  // Eliminar Grupo
  const eliminarGrupo = async (grupoId) => {
    try {
      await axios.delete(`${API_URL}/grupos/${grupoId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      Alert.alert("Éxito", "Grupo eliminado correctamente");
      obtenerGrupos();
      obtenerBalance();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo eliminar el grupo.");
    }
  };

  // Abrir modal para Editar Grupo
  const abrirModalEditarGrupo = (grupo) => {
    setGrupoIdEdit(grupo.id);
    setNombreGrupoEdit(grupo.nombre);
    setImagenGrupoEdit(grupo.imagen || "");
    setModalEditarVisible(true);
  };

  // Editar Grupo
  const editarGrupo = async () => {
    try {
      if (!nombreGrupoEdit.trim()) {
        Alert.alert("Error", "El nombre del grupo es obligatorio");
        return;
      }

      await axios.put(
        `${API_URL}/grupos/${grupoIdEdit}`,
        {
          nombre: nombreGrupoEdit,
          imagen: imagenGrupoEdit,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      Alert.alert("Éxito", "Grupo actualizado");
      setModalEditarVisible(false);
      obtenerGrupos();
      obtenerBalance();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo editar el grupo.");
    }
  };

  // Nombre del usuario
  const userName = user?.nombre || "Usuario";

  // Formatear numeros con separador de miles
  const formatNumber = (n) => {
    return new Intl.NumberFormat("es-CL", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(n);
  };

  const balanceString = formatNumber(balance);
  const aFavorString = formatNumber(totalAFavor);
  const adeudadoString = formatNumber(totalAdeudado);

  // Texto extra creativo
  let balanceLabel = "";
  if (balance > 0) {
    balanceLabel = `Te deben $${balanceString}`;
  } else if (balance < 0) {
    balanceLabel = `Debes $${formatNumber(Math.abs(balance))}`;
  } else {
    balanceLabel = "Estás en cero, ¡felicidades!";
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header (datos de usuario) */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.welcome}>Bienvenido</Text>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userPlan}>Basic</Text>
        </View>
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
          }}
          style={styles.avatar}
        />
      </View>

      {/* Tarjeta de Balance con info creativa */}
      <LinearGradient colors={["#24C6DC", "#514A9D"]} style={styles.balanceCard}>
        <Text style={styles.balanceAmount}>{balanceLabel}</Text>
        <Text style={styles.balanceSecondary}>
          A favor: ${aFavorString} | Adeudado: ${adeudadoString}
        </Text>
      </LinearGradient>

      {/* Botón para CREAR Grupo */}
      <Button title="Nuevo Grupo" onPress={() => setModalCrearVisible(true)} />

      {/* Listado de grupos */}
      <Text style={styles.sectionTitle}>Grupos</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={grupos}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <View style={styles.groupItemContainer}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("GrupoDetalle", { grupoId: item.id })
                }
                style={styles.groupItem}
              >
                <Image
                  source={{
                    uri:
                      item.imagen ||
                      "https://cdn-icons-png.flaticon.com/512/3207/3207611.png",
                  }}
                  style={styles.groupImage}
                />
                <View style={styles.groupInfo}>
                  <Text style={styles.groupName}>{item.nombre}</Text>
                  <Text style={styles.groupTotal}>
                    Total: CLP {item.total || 0}
                  </Text>
                </View>
              </TouchableOpacity>
              {/* Botones Editar / Eliminar */}
              <Button
                title="Editar"
                onPress={() => abrirModalEditarGrupo(item)}
              />
              <Button
                title="Eliminar"
                color="red"
                onPress={() => confirmarEliminarGrupo(item.id)}
              />
            </View>
          )}
        />
      )}

      {/* Modal CREAR Grupo */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalCrearVisible}
        onRequestClose={() => setModalCrearVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Crear nuevo grupo</Text>

            <TextInput
              placeholder="Nombre del grupo"
              style={styles.input}
              value={nombreGrupo}
              onChangeText={setNombreGrupo}
            />
            <TextInput
              placeholder="URL de imagen (opcional)"
              style={styles.input}
              value={imagenGrupo}
              onChangeText={setImagenGrupo}
            />

            <Button title="Crear" onPress={crearGrupo} />
            <Button
              title="Cancelar"
              color="red"
              onPress={() => setModalCrearVisible(false)}
            />
          </View>
        </View>
      </Modal>

      {/* Modal EDITAR Grupo */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalEditarVisible}
        onRequestClose={() => setModalEditarVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Editar grupo</Text>
            <TextInput
              placeholder="Nombre del grupo"
              style={styles.input}
              value={nombreGrupoEdit}
              onChangeText={setNombreGrupoEdit}
            />
            <TextInput
              placeholder="URL de imagen (opcional)"
              style={styles.input}
              value={imagenGrupoEdit}
              onChangeText={setImagenGrupoEdit}
            />

            <Button title="Guardar" onPress={editarGrupo} />
            <Button
              title="Cancelar"
              color="red"
              onPress={() => setModalEditarVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ================== ESTILOS ==================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
   //paddingTop: Platform.OS === "android" ? 45 : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  userInfo: {},
  welcome: { fontSize: 16, color: "#666" },
  userName: { fontSize: 20, fontWeight: "bold" },
  userPlan: { fontSize: 14, color: "#888" },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  balanceCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  balanceSecondary: {
    fontSize: 16,
    color: "#fff",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 4,
  },
  groupItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 10,
  },
  groupItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  groupImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  groupInfo: {
    flexDirection: "column",
  },
  groupName: {
    fontSize: 16,
    fontWeight: "600",
  },
  groupTotal: {
    fontSize: 14,
    color: "green",
  },
  // Modales
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
  modalContainer: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    borderColor: "#ccc",
  },
});

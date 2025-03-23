import React, { useEffect, useState, useContext } from "react";
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
  TextInput,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import API_URL from "../config";

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  // ====== ESTADOS ======
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [balance, setBalance] = useState(0);
  const [totalAFavor, setTotalAFavor] = useState(0);
  const [totalAdeudado, setTotalAdeudado] = useState(0);

  const [modalCrearVisible, setModalCrearVisible] = useState(false);
  const [nombreGrupo, setNombreGrupo] = useState("");
  const [imagenGrupo, setImagenGrupo] = useState("");

  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [grupoIdEdit, setGrupoIdEdit] = useState(null);
  const [nombreGrupoEdit, setNombreGrupoEdit] = useState("");
  const [imagenGrupoEdit, setImagenGrupoEdit] = useState("");

  // ====== EFECTOS AL INICIO ======
  useEffect(() => {
    obtenerGrupos();
    obtenerBalance();
  }, []);

  // ====== FUNCIONES BACKEND ======
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
      const resp = await axios.get(`${API_URL}/balance`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const { balance, total_a_favor, total_adeudado } = resp.data;
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
      setNombreGrupo("");
      setImagenGrupo("");
      setModalCrearVisible(false);

      Alert.alert("Éxito", "Grupo creado correctamente");
      obtenerBalance(); // Actualizar balance
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo crear el grupo");
    }
  };

  const confirmarEliminarGrupo = async (grupoId) => {
    try {
      // Revisar si hay deudas
      const resumenResp = await axios.get(`${API_URL}/deudas/resumen/${grupoId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
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

      Alert.alert("Éxito", "Grupo actualizado");
      setModalEditarVisible(false);
      obtenerGrupos();
      obtenerBalance();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo editar el grupo.");
    }
  };

  // ====== FUNCIONES DE UI ======
  const onRefresh = async () => {
    setRefreshing(true);
    await obtenerGrupos();
    await obtenerBalance();
    setRefreshing(false);
  };

  const userName = user?.nombre || "Usuario";

  // ====== FORMATEAR BALANCE ======
  const formatNumber = (num) =>
    new Intl.NumberFormat("es-CL", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(num);

  const balanceString = formatNumber(balance);
  const aFavorString = formatNumber(totalAFavor);
  const adeudadoString = formatNumber(totalAdeudado);

  // Texto creativo de balance
  let balanceLabel = "";
  if (balance > 0) {
    balanceLabel = `Te deben $${balanceString}`;
  } else if (balance < 0) {
    balanceLabel = `Debes $${formatNumber(Math.abs(balance))}`;
  } else {
    balanceLabel = "Estás en cero, ¡felicidades!";
  }

  // ====== RENDER ======
  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.welcome}>Bienvenido</Text>
          <Text style={styles.nombreUsuario}>{user.nombreCompleto}</Text>
          <Text style={styles.userPlan}>Basic</Text>
        </View>
        <TouchableOpacity>
  <Image
    source={{
      uri:
        user?.imagen_perfil ||
        "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    }}
    style={styles.avatar}
  />
</TouchableOpacity>
      </View>

      {/* Tarjeta de Balance */}
      <LinearGradient colors={["#24C6DC", "#514A9D"]} style={styles.balanceCard}>
        <Text style={styles.balanceAmount}>{balanceLabel}</Text>
        <Text style={styles.balanceSecondary}>
          A favor: ${aFavorString} | Adeudado: ${adeudadoString}
        </Text>
      </LinearGradient>

      {/* Botón Nuevo Grupo */}
      <TouchableOpacity
        style={styles.newGroupButton}
        onPress={() => setModalCrearVisible(true)}
      >
        <Text style={styles.newGroupButtonText}>Nuevo Grupo</Text>
      </TouchableOpacity>

      {/* Título de Sección */}
      <Text style={styles.sectionTitle}>Grupos</Text>

      {/* Lista de Grupos */}
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
                    Total: ${Math.round(item.total || 0).toLocaleString("es-CL")}
                  </Text>

                  <Text style={styles.debtText}>
                    Debes: ${Math.round(item.monto_adeudado || 0).toLocaleString("es-CL")}
                  </Text>
                </View>
            </TouchableOpacity>
            {/* Botones Editar y Eliminar */}
            <TouchableOpacity
              style={[styles.actionButton, { marginRight: 8 }]}
              onPress={() => abrirModalEditarGrupo(item)}
            >
              <Text style={styles.actionText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#FF3B30" }]}
              onPress={() => confirmarEliminarGrupo(item.id)}
            >
              <Text style={[styles.actionText, { color: "#fff" }]}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* MODAL CREAR GRUPO */}
      <Modal
        transparent
        visible={modalCrearVisible}
        animationType="slide"
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
            <TouchableOpacity style={styles.confirmButton} onPress={crearGrupo}>
              <Text style={styles.confirmButtonText}>Crear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: "red" }]}
              onPress={() => setModalCrearVisible(false)}
            >
              <Text style={styles.confirmButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL EDITAR GRUPO */}
      <Modal
        transparent
        visible={modalEditarVisible}
        animationType="slide"
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

            <TouchableOpacity style={styles.confirmButton} onPress={editarGrupo}>
              <Text style={styles.confirmButtonText}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: "red" }]}
              onPress={() => setModalEditarVisible(false)}
            >
              <Text style={styles.confirmButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ====== ESTILOS ======
const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
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
  avatar: { width: 50, height: 50, borderRadius: 25 },
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
  balanceSecondary: { fontSize: 16, color: "#fff" },
  newGroupButton: {
    backgroundColor: "#eee",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  newGroupButtonText: {
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
  groupItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
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
  actionButton: {
    backgroundColor: "#eee",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionText: {
    fontSize: 14,
    color: "#007aff",
    fontWeight: "600",
  },
  // MODALES
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
  },
  debtText: {
    color: "#E53935", // rojo suave
    fontSize: 14,
    marginTop: 2,
  },  
  confirmButton: {
    backgroundColor: "#007aff",
    padding: 10,
    borderRadius: 6,
    marginTop: 5,
    alignItems: "center",
  },
  confirmButtonText: { color: "#fff", fontWeight: "600" },
});

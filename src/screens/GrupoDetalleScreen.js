import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Switch,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import API_URL from "../config";
import { Ionicons } from "@expo/vector-icons"; // Asegúrate de instalarlo con `expo install react-native-vector-icons`

const iconosCategorias = {
  comida: "fast-food-outline",
  transporte: "car-outline",
  entretenimiento: "film-outline",
  compras: "cart-outline",
  otros: "help-circle-outline",
};

export default function GrupoDetalleScreen({ route, navigation }) {
  const { grupoId, grupoNombre = "Grupo" } = route.params;
  const { user } = useContext(AuthContext);
  const usuarioActual = user?.id; // Asegurar que `user` exista antes de acceder a `id`

  const [gastos, setGastos] = useState([]);
  const [deudas, setDeudas] = useState([]);
  const [participantes, setParticipantes] = useState([]); // 📌 Nuevo estado para los participantes
  const [loading, setLoading] = useState(true);
  const [mostrarSoloMisDeudas, setMostrarSoloMisDeudas] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // 📌 ESTADO PARA PULL-TO-REFRESH


  useEffect(() => {
    obtenerDatosGrupo();
    obtenerParticipantes();
    navigation.setOptions({ title: "Detalle" });

    // 📌 Se ejecuta al volver a la pantalla para refrescar los datos
    const unsubscribe = navigation.addListener("focus", async () => {
      await obtenerDatosGrupo();
      await obtenerParticipantes();
    });

    return unsubscribe;
  }, [navigation]);
  const formatearMonto = (monto) => {
    return `$${new Intl.NumberFormat("es-CL", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(monto)}`;
  };

  const obtenerDatosGrupo = async () => {
    try {
      setLoading(true);

      const responseGastos = await axios.get(`${API_URL}/gastos/${grupoId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setGastos(responseGastos.data || []);

      const responseDeudas = await axios.get(
        `${API_URL}/deudas/desglose/${grupoId}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      setDeudas(
        Array.isArray(responseDeudas.data.resultado)
          ? responseDeudas.data.resultado
          : []
      );
    } catch (error) {
      console.error("❌ Error obteniendo datos del grupo:", error);
      Alert.alert("Error", "No se pudieron obtener los datos.");
    } finally {
      setLoading(false);
    }
  };

  const obtenerParticipantes = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/grupos/${grupoId}/participantes`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      setParticipantes(response.data || []);
    } catch (error) {
      console.error("❌ Error obteniendo participantes:", error);
      Alert.alert("Error", "No se pudieron cargar los participantes.");
    }
  };

  // 📌 Función para Pull-to-Refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await obtenerParticipantes(); // 📌 Ahora actualiza los participantes también
    await obtenerDatosGrupo();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {typeof grupoNombre === "string" ? grupoNombre : "Grupo"}
      </Text>

      <TouchableOpacity
        style={styles.addParticipantButton}
        onPress={() => navigation.navigate("AgregarParticipante", { grupoId })}
      >
        <Text style={styles.addParticipantText}>+ Agregar Participante</Text>
      </TouchableOpacity>

      {/* Lista de Participantes */}
      <Text style={styles.subtitle}>Participantes</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={participantes}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <View style={styles.participantItem}>
              <Text>
                {item.nombre} ({item.correo})
              </Text>
            </View>
          )}
        />
      )}

      {/* Filtro para ver solo mis deudas */}
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Mostrar solo mis deudas</Text>
        <Switch
          value={mostrarSoloMisDeudas}
          onValueChange={() => setMostrarSoloMisDeudas(!mostrarSoloMisDeudas)}
        />
      </View>

      {/* Lista de gastos */}
      <Text style={styles.subtitle}>Gastos</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={gastos}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => {
            if (!usuarioActual) return null;

            const esPagador = item.pagado_por === usuarioActual;
            const textoEstado = esPagador
              ? "Tú pagaste"
              : `Debes ${formatearMonto(item.monto)}`;
            const colorTexto = esPagador ? "green" : "red";

            return (
              <View
                style={[
                  styles.gastoItem,
                  esPagador ? styles.gastoPagado : styles.gastoDeuda,
                ]}
              >
                <Ionicons
                  name={
                    iconosCategorias[item.categoria] || "help-circle-outline"
                  }
                  size={24}
                  color="#555"
                  style={styles.icono}
                />
                <View>
                  <Text>
                    {item.descripcion}: {formatearMonto(item.monto)}
                  </Text>
                  <Text style={styles.pagador}>
                    Pagado por: {item.pagado_por_nombre}
                  </Text>
                  <Text style={{ color: colorTexto, fontWeight: "bold" }}>
                    {textoEstado}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Desglose de deudas */}
      <Text style={styles.subtitle}>Deudas</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={
            Array.isArray(deudas)
              ? deudas.filter(
                  (d) => !mostrarSoloMisDeudas || d.deudor_id === user.id
                )
              : []
          }
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.deudaItem}>
              <Text style={styles.deudaTexto}>
                {item.deudor_nombre} → {item.acreedor_nombre}:{" "}
                <Text style={styles.monto}>
                  {formatearMonto(item.monto_total)}
                </Text>
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 5,
  },
  participantItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  switchLabel: { flex: 1, fontSize: 16 },
  gastoItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  pagador: { fontSize: 14, color: "#666" },
  deudaItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  deudaTexto: { fontSize: 16 },
  monto: { fontWeight: "bold", color: "red" },
  pagarButton: { backgroundColor: "green", padding: 5, borderRadius: 5 },
  pagarText: { color: "#fff", fontWeight: "bold" },
  addParticipantButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  addParticipantText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  gastoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  gastoInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  icono: {
    marginRight: 10, // Espaciado entre el ícono y el texto
  },
  pagador: {
    fontSize: 12,
    color: "gray",
  },
  gastoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  gastoPagado: {
    backgroundColor: "#e5ffe5", // Verde claro para gastos pagados por el usuario
  },
  gastoDeuda: {
    backgroundColor: "#ffe5e5", // Rojo claro si el usuario debe
  },
  icono: {
    marginRight: 10,
  },
  pagador: {
    fontSize: 12,
    color: "gray",
  },
});

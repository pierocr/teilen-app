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
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import API_URL from "../config";
import { Ionicons } from "@expo/vector-icons";

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
  const usuarioActual = user?.id;

  const [gastos, setGastos] = useState([]);
  const [deudas, setDeudas] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarSoloMisDeudas, setMostrarSoloMisDeudas] = useState(false);

  useEffect(() => {
    obtenerDatosGrupo();
    obtenerParticipantes();
    navigation.setOptions({ title: "Detalle" });
  }, []);

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

      const responseDeudas = await axios.get(`${API_URL}/deudas/desglose/${grupoId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setDeudas(Array.isArray(responseDeudas.data.resultado) ? responseDeudas.data.resultado : []);
    } catch (error) {
      console.error("❌ Error obteniendo datos del grupo:", error);
      Alert.alert("Error", "No se pudieron obtener los datos.");
    } finally {
      setLoading(false);
    }
  };

  const obtenerParticipantes = async () => {
    try {
      const response = await axios.get(`${API_URL}/grupos/${grupoId}/participantes`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setParticipantes(response.data || []);
    } catch (error) {
      console.error("❌ Error obteniendo participantes:", error);
      Alert.alert("Error", "No se pudieron cargar los participantes.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{grupoNombre}</Text>

      <TouchableOpacity
        style={styles.agregarButton}
        onPress={() => navigation.navigate("AgregarParticipante", { grupoId })}
      >
        <Text style={styles.agregarText}>+ Agregar Participante</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Participantes</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={participantes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.participantName}>{item.nombre}</Text>
              <Text style={styles.participantEmail}>{item.correo}</Text>
            </View>
          )}
        />
      )}

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Mostrar solo mis deudas</Text>
        <Switch
          value={mostrarSoloMisDeudas}
          onValueChange={() => setMostrarSoloMisDeudas(!mostrarSoloMisDeudas)}
        />
      </View>

      <Text style={styles.sectionTitle}>Gastos</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={gastos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            if (!usuarioActual) return null;
            const esPagador = item.pagado_por === usuarioActual;
            const textoEstado = esPagador
              ? "Tú pagaste"
              : `Debes ${formatearMonto(item.monto)}`;
            const colorTexto = esPagador ? "#1b873e" : "#d11a2a";

            return (
              <View
                style={[
                  styles.card,
                  { backgroundColor: esPagador ? "#f2fef3" : "#fef2f2" },
                ]}
              >
                <View style={styles.row}>
                  <Ionicons
                    name={iconosCategorias[item.categoria] || "help-circle-outline"}
                    size={24}
                    color="#555"
                    style={{ marginRight: 10 }}
                  />
                  <View>
                    <Text style={styles.descripcion}>
                      {item.descripcion}: {formatearMonto(item.monto)}
                    </Text>
                    <Text style={styles.pagadoPor}>
                      Pagado por: {item.pagado_por_nombre}
                    </Text>
                    <Text style={[styles.estadoTexto, { color: colorTexto }]}>
                      {textoEstado}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      <Text style={styles.sectionTitle}>Deudas</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={
            Array.isArray(deudas)
              ? deudas.filter((d) => !mostrarSoloMisDeudas || d.deudor_id === user.id)
              : []
          }
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.deudaTexto}>
                {item.deudor_nombre} → {item.acreedor_nombre}:{" "}
                <Text style={styles.monto}>{formatearMonto(item.monto_total)}</Text>
              </Text>
            </View>
          )}
        />
      )}
      <TouchableOpacity
  style={styles.fab}
  onPress={() =>
    navigation.navigate("CrearGasto", {
      grupoId,
      grupoNombre,
      participantes,
    })
  }
>
  <Ionicons name="add" size={28} color="#fff" />
</TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
    color: "#333",
  },
  agregarButton: {
    backgroundColor: "#2a5298",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  agregarText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
    color: "#444",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  descripcion: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  pagadoPor: {
    fontSize: 13,
    color: "#777",
  },
  estadoTexto: {
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 4,
  },
  deudaTexto: {
    fontSize: 15,
    color: "#333",
  },
  monto: {
    color: "#d11a2a",
    fontWeight: "600",
  },
  participantName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  participantEmail: {
    fontSize: 13,
    color: "#777",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  switchLabel: {
    flex: 1,
    fontSize: 15,
    color: "#444",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#2a5298",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
});

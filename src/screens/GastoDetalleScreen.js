// Vista de detalle con monto en verde cuando está pagado
import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import API_URL from "../config";
import { monto } from "../utils/format";

const GastoDetalleScreen = ({ route }) => {
  const { gastoId } = route.params;
  const { user } = useContext(AuthContext);

  const [gasto, setGasto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagos, setPagos] = useState({});

  useEffect(() => {
    obtenerDetalle();
  }, []);

  const obtenerDetalle = async () => {
    try {
      const res = await axios.get(`${API_URL}/gastos/${gastoId}/detalle`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setGasto(res.data);
      const pagosIniciales = {};
      res.data.deudas.forEach((d) => {
        pagosIniciales[d.id_usuario] = false;
      });
      setPagos(pagosIniciales);
    } catch (error) {
      console.error("❌ Error al obtener detalle:", error);
      Alert.alert("Error", "No se pudo cargar el detalle del gasto.");
    } finally {
      setLoading(false);
    }
  };

  const togglePago = (id) => {
    if (id === user.id) {
      setPagos((prev) => ({ ...prev, [id]: !prev[id] }));
    }
  };

  const calcularDeuda = (montoBase, id, tipo) => {
    if (tipo === "deuda" && pagos[id]) return 0;
    return montoBase;
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  }

  if (!gasto) {
    return <Text style={{ textAlign: "center", marginTop: 40 }}>Gasto no encontrado</Text>;
  }

  const totalPagado = gasto.deudas.reduce((acc, d) => {
    if (d.tipo === "deuda" && pagos[d.id_usuario]) {
      return acc + d.monto;
    }
    return acc;
  }, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{gasto.descripcion}</Text>
      <Text style={styles.subtitulo}>Pagado por: {gasto.pagado_por.nombre}</Text>
      <Text style={styles.monto}>Total: {monto(gasto.monto)}</Text>

      <View style={styles.estadoRow}>
        <Text style={styles.estadoLabel}>Pagado:</Text>
        <Text style={styles.estadoValor}>{monto(totalPagado)}</Text>
      </View>

      <Text style={styles.seccion}>Participantes</Text>
      <View style={styles.headerRow}>
        <Text style={[styles.headerText, { flex: 1 }]}>Nombre</Text>
        <Text style={[styles.headerText, { width: 80, textAlign: "center" }]}>Monto</Text>
        <Text style={[styles.headerText, { width: 60, textAlign: "center" }]}>Pagado</Text>
      </View>

      <FlatList
        data={gasto.deudas}
        keyExtractor={(item) => item.id_usuario.toString()}
        renderItem={({ item }) => {
          const pagado = pagos[item.id_usuario];
          const deuda = calcularDeuda(item.monto, item.id_usuario, item.tipo);
          const esDeuda = item.tipo === "deuda";

          return (
            <View style={styles.participante}>
              <Text style={styles.nombre}>{item.nombre_usuario}</Text>
              <Text
                style={{
                  color: deuda === 0 ? "green" : esDeuda ? "red" : "green",
                  fontWeight: "bold",
                  width: 80,
                  textAlign: "center",
                }}
              >
                {deuda === 0 ? "$0" : `${esDeuda ? "- " : "+ "}${monto(deuda)}`}
              </Text>
              <TouchableOpacity
                disabled={item.id_usuario !== user.id || !esDeuda}
                onPress={() => togglePago(item.id_usuario)}
              >
                <Text style={[styles.check, { opacity: item.id_usuario === user.id ? 1 : 0.3 }]}> 
                  {pagado ? "✅" : "⬜️"}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
      <Text style={styles.ayuda}>* Solo puedes marcar tu deuda como pagada</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    flex: 1,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
  },
  subtitulo: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },
  monto: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 20,
  },
  estadoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  estadoLabel: {
    fontSize: 14,
    color: "#555",
  },
  estadoValor: {
    fontSize: 14,
    color: "green",
    fontWeight: "bold",
  },
  seccion: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 4,
  },
  headerRow: {
    flexDirection: "row",
    marginBottom: 4,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 13,
    color: "#333",
  },
  participante: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  nombre: {
    flex: 1,
    fontSize: 16,
  },
  check: {
    fontSize: 22,
    width: 60,
    textAlign: "center",
  },
  ayuda: {
    fontSize: 12,
    color: "#888",
    marginTop: 10,
    textAlign: "center",
  },
});

export default GastoDetalleScreen;
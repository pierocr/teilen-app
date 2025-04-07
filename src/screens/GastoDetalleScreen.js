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
import * as Progress from 'react-native-progress';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from "react-native";


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
        pagosIniciales[d.id_usuario] = d.pagado;
      });
      setPagos(pagosIniciales);
    } catch (error) {
      console.error("❌ Error al obtener detalle:", error);
      Alert.alert("Error", "No se pudo cargar el detalle del gasto.");
    } finally {
      setLoading(false);
    }
  };

  const togglePago = async (id) => {
    if (id !== user.id) return;
  
    const nuevoEstado = !pagos[id];
    setPagos((prev) => ({ ...prev, [id]: nuevoEstado }));
  
    try {
      await axios.put(`${API_URL}/gastos/${gastoId}/pago`, {
        pagado: nuevoEstado
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
    } catch (error) {
      console.error("❌ Error al guardar el pago:", error);
      Alert.alert("Error", "No se pudo guardar el estado de pago.");
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
  const calcularTotalPagado = () => {
    return gasto.deudas.reduce((acc, d) => {
      const monto = Number(d.monto) || 0;
      if (d.tipo === "deuda" && pagos[d.id_usuario]) {
        return acc + monto;
      }
      return acc;
    }, 0);
  };
  
  const calcularTotalRestante = () => {
    return gasto.deudas.reduce((acc, d) => {
      const monto = Number(d.monto) || 0;
      if (d.tipo === "deuda" && !pagos[d.id_usuario]) {
        return acc + monto;
      }
      return acc;
    }, 0);
  };

  const calcularProgreso = () => {
    const pagado = calcularTotalPagado();
    return gasto.monto > 0 ? pagado / gasto.monto : 0;
  };
  

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#2a8873", "#1b6db2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.encabezado}
      >
        <Text style={styles.titulo}>{gasto.descripcion}</Text>
        <Text style={styles.subtitulo}>Pagado por: {gasto.pagado_por.nombre}</Text>
        <Text style={styles.total}>Total: {monto(gasto.monto)}</Text>
      </LinearGradient>
  
      <View style={styles.estadoRow}>
        <Text style={styles.estadoLabel}>Pagado por participantes:</Text>
        <Text style={styles.estadoValor}>{monto(calcularTotalPagado())}</Text>
      </View>
  
      <View style={styles.estadoRow}>
        <Text style={styles.estadoLabel}>Restante por pagar:</Text>
        <Text style={[styles.estadoValor, { color: "red" }]}> {monto(calcularTotalRestante())}
        </Text>
      </View>


  
      {/* <Text style={styles.seccion}>Participantes</Text> */}
  
      <View style={styles.headerRow}>
        <Text style={[styles.headerText, { flex: 1 }]}>Nombre</Text>
        <Text style={[styles.headerText, { width: 80, textAlign: "center" }]}>Monto</Text>
        <Text style={[styles.headerText, { width: 60, textAlign: "center" }]}>Pagado</Text>
      </View>
  
      <FlatList
        data={gasto.deudas}
        keyExtractor={(item) => item.id_usuario.toString()}
        renderItem={({ item }) => {
          const esDeuda = item.tipo === "deuda";
          const pagado = pagos[item.id_usuario];
          const deudaActual = calcularDeuda(item.monto, item.id_usuario, item.tipo);
          const color = pagado ? "green" : esDeuda ? "red" : "green";
        
          return (
            <View style={styles.participante}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    source={{
                      uri:
                        item.imagen_perfil ||
                        "https://cdn-icons-png.flaticon.com/512/847/847969.png",
                    }}
                    style={styles.avatar}
                  />
                  {/* Nombre y fecha */}
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.nombre}>{item.nombre_usuario}</Text>
                    {pagado && item.fecha_pago && (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.labelFecha}>Pagado el </Text>
                        <Text style={styles.fechaPago}>
                          {new Date(item.fecha_pago).toLocaleDateString("es-CL")}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
        
              {/* Monto */}
              <Text
                style={{
                  color,
                  fontWeight: "bold",
                  width: 80,
                  textAlign: "center",
                }}
              >
                {deudaActual === 0
                  ? "$0"
                  : `${item.tipo === "deuda" ? "- " : "+ "}${monto(deudaActual)}`}
              </Text>
        
              {/* Check de pagado */}
              <TouchableOpacity
                disabled={item.id_usuario !== user.id || !esDeuda}
                onPress={() => togglePago(item.id_usuario)}
              >
                <Text
                  style={[
                    styles.check,
                    { opacity: item.id_usuario === user.id ? 1 : 0.3 },
                  ]}
                >
                  {pagado ? "✅" : "⬜️"}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}        
      />
      <View style={{ alignItems: "center", marginVertical: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>
          Progreso de pago
        </Text>

        <Progress.Circle
          progress={calcularProgreso()}
          size={100}
          thickness={10}
          showsText={true}
          formatText={() => `${Math.round(calcularProgreso() * 100)}%`}
          color="#2ecc71"
          unfilledColor="#eee"
          borderWidth={0}
        />
      </View>
  
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
    fontSize: 22,
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
  progresoContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  encabezado: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    alignItems: "center",
    marginBottom: 15,
    opacity: 1
  },
  titulo: {
    fontSize: 25,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  subtitulo: {
    fontSize: 14,
    color: "#e9fdf7",
    marginBottom: 6,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  total: {
    fontSize: 25,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },  
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ccc",
  },
  fechaPago: {
    fontSize: 10
  },
  labelFecha: {
    fontSize: 10
  }
});

export default GastoDetalleScreen;
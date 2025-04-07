// GrupoDetalleScreen.js
import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import API_URL from "../config";
import { Ionicons } from "@expo/vector-icons";
import GastoItem from "../components/GastoItem";
import ResumenGrupo from "../components/ResumenGrupo";
import { useFocusEffect } from "@react-navigation/native";

const GrupoDetalleScreen = ({ route, navigation }) => {
  const { grupoId, grupoNombre = "Grupo" } = route.params;
  const { user } = useContext(AuthContext);

  const [gastos, setGastos] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      title: grupoNombre,
      headerBackTitleVisible: false,
      headerBackTitle: "", // fuerza que no haya texto
      headerBackImage: () => (
        <Ionicons
          name="chevron-back"
          size={26}
          color="#2a5298"
          style={{ marginLeft: 8 }}
        />
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("ConfiguracionGrupo", { grupoId })}
          style={{ marginRight: 16 }}
        >
          <Ionicons name="settings-outline" size={22} color="#555" />
        </TouchableOpacity>
      ),
    });
  }, []);
  
  
  useFocusEffect(
    React.useCallback(() => {
      obtenerDatosGrupo();
      obtenerParticipantes();
      obtenerResumenGrupo();
    }, [])
  );

  const obtenerDatosGrupo = async () => {
    try {
      setLoading(true);
      const responseGastos = await axios.get(`${API_URL}/gastos/${grupoId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      const gastosProcesados = responseGastos.data.map((g) => {
        let label = "Sin participación";
        let color = "gray";
        if (g.relacion_usuario === "a_favor") {
          label = `Te deben CLP${g.monto_usuario.toLocaleString()}`;
          color = "green";
        } else if (g.relacion_usuario === "debes") {
          label = `Debes CLP${g.monto_usuario.toLocaleString()}`;
          color = "red";
        }
        return {
          ...g,
          pagado_por: g.pagado_por?.nombre || "Desconocido",
          relacion_label: label,
          relacion_color: color,
        };
      });

      setGastos(gastosProcesados);
    } catch (error) {
      console.error("❌ Error obteniendo datos del grupo:", error);
      Alert.alert("Error", "No se pudieron obtener los datos.");
    } finally {
      setLoading(false);
    }
  };

  const obtenerParticipantes = async () => {
    try {
      const res = await axios.get(`${API_URL}/grupos/${grupoId}/participantes`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setParticipantes(res.data);
    } catch (error) {
      console.error("❌ Error obteniendo participantes:", error);
      Alert.alert("Error", "No se pudieron cargar los participantes del grupo.");
    }
  };

  const obtenerResumenGrupo = async () => {
    try {
      const res = await axios.get(`${API_URL}/grupos/${grupoId}/resumen`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setResumen(res.data);
    } catch (error) {
      console.error("❌ Error obteniendo resumen del grupo:", error);
    }
  };

  const porcentajePagado = resumen && resumen.total_gastado > 0
    ? resumen.total_pagado / resumen.total_gastado
    : 0;

  return (
    <View style={styles.container}>

      {resumen && (
        <ResumenGrupo
          deudaRestante={resumen.total_adeudado}
          porcentajePagado={porcentajePagado}
          totalGastado={resumen.total_gastado}
          totalPagado={resumen.total_pagado}
        />

      )}

      <Text style={styles.sectionTitle}>Gastos</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={gastos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <GastoItem
              id={item.id}
              descripcion={item.descripcion}
              monto={item.monto}
              imagen={item.imagen}
              fecha={item.fecha}
              pagado_por={{ nombre: item.pagado_por.split(" ")[0] || "Desconocido" }}
              relacion_usuario={item.relacion_usuario}
              monto_usuario={item.monto_usuario}
              relacion_label={item.relacion_label}
              relacion_color={item.relacion_color}
            />
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2a2a2a",
  },
  configIcon: {
    padding: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
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

export default GrupoDetalleScreen;

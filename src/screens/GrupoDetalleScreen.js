// GrupoDetalleScreen.js
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
import GastoItem from "../components/GastoItem";
import { useFocusEffect } from "@react-navigation/native";

const GrupoDetalleScreen = ({ route, navigation }) => {
  const { grupoId, grupoNombre = "Grupo" } = route.params;
  const { user } = useContext(AuthContext);

  const [gastos, setGastos] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarSoloMisDeudas, setMostrarSoloMisDeudas] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: grupoNombre });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      obtenerDatosGrupo();
      obtenerParticipantes();
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

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.agregarButton}
        onPress={() => navigation.navigate("AgregarParticipante", { grupoId })}
      >
        <Text style={styles.agregarText}>+ Participante</Text>
      </TouchableOpacity>

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
          data={gastos.filter((g) => !mostrarSoloMisDeudas || g.relacion_usuario === "debes")}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <GastoItem
              id={item.id} // ✅ Aquí está el fix
              descripcion={item.descripcion}
              monto={item.monto}
              imagen={item.imagen}
              fecha={item.fecha}
              pagado_por={{ nombre: item.pagado_por }}
              relacion_usuario={item.relacion_usuario}
              monto_usuario={item.monto_usuario}
              relacion_label={item.relacion_label}
              relacion_color={item.relacion_color}
            />
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  agregarButton: {
    backgroundColor: "#2a5298",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  agregarText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 8,
    color: "#444",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
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

export default GrupoDetalleScreen;

// GrupoDetalleScreen.js
import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableOpacity,
  Image,           // (NUEVO) Para mostrar avatares
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
  const [modalVisible, setModalVisible] = useState(false);

  // --------------------------------------
  // Configurar header y boton de settings
  // --------------------------------------
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
  }, [grupoNombre, grupoId, navigation]);

  // -----------------------------------------
  // Refrescar datos cuando la pantalla enfoca
  // -----------------------------------------
  useFocusEffect(
    React.useCallback(() => {
      obtenerDatosGrupo();
      obtenerParticipantes();
      obtenerResumenGrupo();
    }, [])
  );

  // -----------------------------------
  // 1. Obtener lista de gastos del grupo
  // -----------------------------------
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

  // ---------------------------------------------------
  // 2. Obtener participantes (para mostrar sus avatares)
  // ---------------------------------------------------
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

  // ----------------------------------------------
  // 3. Obtener resumen financiero del grupo
  // ----------------------------------------------
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

  // ------------------------------------------------------
  // 4. Calcular porcentaje pagado para mostrar en Resumen
  // ------------------------------------------------------
  const porcentajePagado =
    resumen && resumen.total_gastado > 0
      ? resumen.total_pagado / resumen.total_gastado
      : 0;

  // ----------------------------------------------
  // RENDER
  // ----------------------------------------------
  return (
    <View style={styles.container}>

      {/* 4.1 Resumen del grupo */}
      {resumen && (
        <ResumenGrupo
          deudaRestante={resumen.total_adeudado}
          porcentajePagado={porcentajePagado}
          totalGastado={resumen.total_gastado}
          totalPagado={resumen.total_pagado}
        />
      )}

      {/* (NUEVO) Sección de participantes */}
      {participantes.length > 0 ? (
  <View style={styles.headerRow}>
    <Text style={styles.sectionTitle}>Gastos</Text>

    <TouchableOpacity onPress={() => setModalVisible(true)}>
      <View style={styles.avatarRow}>
        {participantes.map((item) => (
          <Image
            key={item.id}
            source={
              item.imagen_perfil
                ? { uri: item.imagen_perfil }
                : require("../assets/avatar.png")
            }
            style={styles.avatar}
          />
        ))}
      </View>
    </TouchableOpacity>
  </View>
) : (
  <>
    <Text style={styles.sectionTitle}>Gastos</Text>
    <Text style={styles.noParticipants}>No hay participantes en este grupo</Text>
  </>
)}

      {/* 4.3 Lista de gastos */}
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
              pagado_por={{
                nombre: item.pagado_por.split(" ")[0] || "Desconocido",
              }}
              relacion_usuario={item.relacion_usuario}
              monto_usuario={item.monto_usuario}
              relacion_label={item.relacion_label}
              relacion_color={item.relacion_color}
            />
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

<View style={styles.botonesContainer}>
      {/* Botón para añadir participantes */}
      <TouchableOpacity
        style={styles.boton}
        onPress={() =>
          navigation.navigate("AgregarParticipante", {
            grupoId,
            participantesActuales: participantes,
          })
        }
      >
        <Text style={styles.botonTexto}>Añadir Participante</Text>
      </TouchableOpacity>

      {/* Botón para añadir gastos */}
      <TouchableOpacity
        style={styles.boton}
        onPress={() =>
          navigation.navigate("CrearGasto", {
            grupoId,
            grupoNombre,
            participantes,
          })
        }
      >
        <Text style={styles.botonTexto}>Añadir Gasto</Text>
      </TouchableOpacity>
    </View>
    {/* ➕ Modal para ver lista completa de participantes */}
    <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Participantes</Text>
            <FlatList
              data={participantes}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.participantItem}>
                  <Image
                    source={
                      item.imagen_perfil
                        ? { uri: item.imagen_perfil }
                        : require("../assets/avatar.png")
                    }
                    style={styles.listAvatar}
                  />
                  <Text style={{ marginLeft: 10 }}>{item.nombre}</Text>
                </View>
              )}
            />
            <TouchableOpacity
              style={styles.cerrarBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cerrarBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
    
  );
};

// ----------------------------------------------
// ESTILOS
// ----------------------------------------------
const styles = StyleSheet.create({
  // Contenedor general
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },

  // Header (nombre del grupo y engranaje)
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

  // Participantes (mini avatares en resumen)
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: 6,
    backgroundColor: "#ccc",
  },
  noParticipants: {
    fontStyle: "italic",
    color: "#888",
    marginVertical: 10,
    marginBottom: 16,
  },

  // Título de secciones
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },

  // Botones inferiores
  botonesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  boton: {
    backgroundColor: "#2a5298",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 0.48,
    alignItems: "center",
  },
  botonTexto: {
    fontWeight: "600",
    color: "#fff",
  },

  // FAB
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

  // Modal de participantes
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  participantItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  listAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  cerrarBtn: {
    backgroundColor: "#2a5298",
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
    marginTop: 8,
  },
  cerrarBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default GrupoDetalleScreen;

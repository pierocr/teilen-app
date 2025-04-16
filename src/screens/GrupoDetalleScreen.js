// GrupoDetalleScreen.js
import React, { useEffect, useState, useContext } from "react";
import {
  View,
  SafeAreaView,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableOpacity,
  Image,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import API_URL from "../config";
import { Ionicons } from "@expo/vector-icons";
import GastoItem from "../components/GastoItem";
import ResumenGrupo from "../components/ResumenGrupo";
import { useFocusEffect } from "@react-navigation/native";
import ResumenPersonalGrupo from "../components/ResumenPersonalGrupo";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const GrupoDetalleScreen = ({ route, navigation }) => {
  // Se espera que se envíe grupoImagen desde la navegación; si no, se usa un valor por defecto.
  const { grupoId, grupoNombre = "Grupo", grupoImagen } = route.params;
  const { user } = useContext(AuthContext);

  const [gastos, setGastos] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // --------------------------------------
  // Configurar header con imagen de grupo custom
  // --------------------------------------
  useEffect(() => {
    navigation.setOptions({
      headerShown: false, // Ocultamos el header de navegación estándar para usar nuestro custom.
    });
  }, [grupoNombre, grupoId, navigation]);

  // -----------------------------------------
  // Refrescar datos cuando la pantalla se enfoca
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
  // 2. Obtener participantes del grupo
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

  // ---------------------------------------------------
  // 3. Obtener resumen financiero del grupo
  // ---------------------------------------------------
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
  // Calcular porcentaje pagado para mostrar en Resumen
  // ------------------------------------------------------
  const porcentajePagado =
    resumen && resumen.total_gastado > 0
      ? resumen.total_pagado / resumen.total_gastado
      : 0;

  // ----------------------------------------------
  // Render del componente
  // ----------------------------------------------
  return (
    <View style={[styles.container, { paddingTop: 40 }]}>
      {/* Header custom con cover image */}
      <View style={headerStyles.header}>
        {/* Agregamos log justo antes de la imagen */}
        <Image
          source={
            grupoImagen
              ? { uri: grupoImagen }
              : require("../assets/image.png")
          }
          style={headerStyles.coverImage}
          resizeMode="cover"
        />
        <View style={headerStyles.overlayGradient} />
        <View style={headerStyles.headerContent}>
          <Text style={headerStyles.groupName}>{grupoNombre}</Text>
          <TouchableOpacity
            style={headerStyles.configButton}
            onPress={() =>
              navigation.navigate("ConfiguracionGrupo", { grupoId, grupoNombre, grupoImagen })
            }
          >
            <Ionicons name="settings-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Resumen financiero (opcional si ResumenGrupo se utiliza) */}
      {resumen && (
  <ResumenPersonalGrupo
    totalAdeudadoUsuario={resumen.total_adeudado_usuario}
    detallesDeuda={resumen.detalles_deuda}
  />
)}


      {/* Sección de participantes: Se muestran los mini avatares */}
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
                  style={styles.avatarSmall}
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

      {/* Lista de gastos */}
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
      icono={item.icono}               // Se añade aquí
      recurrente={item.recurrente}     // Se añade aquí
      fecha={item.fecha || item.creado_en}
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

      {/* Botones inferiores */}
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

      {/* Modal para ver lista completa de participantes */}
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
                  <Text style={styles.participantName}>{item.nombre}</Text>
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

const headerStyles = StyleSheet.create({
  header: {
    height: 120,
    position: "relative",
    marginBottom: 16,
  },
  coverImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  overlayGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 12,
  },
  headerContent: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  groupName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  configButton: {
    padding: 6,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 20,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarSmall: {
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
  participantName: {
    marginLeft: 10,
    fontSize: 16,
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

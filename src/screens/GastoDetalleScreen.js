import React, { useEffect, useState, useContext,useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import * as Progress from "react-native-progress";
import axios from "axios";
import { monto as formatearMonto } from "../utils/format";
import { useFocusEffect } from "@react-navigation/native";

import { AuthContext } from "../context/AuthContext";
import API_URL from "../config";
import { monto } from "../utils/format";

const GastoDetalleScreen = ({ route, navigation }) => {
  const { gastoId } = route.params;
  const { user } = useContext(AuthContext);

  const [gasto, setGasto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagos, setPagos] = useState({});

  // Estado para modal edición, imagen, etc.
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [nuevoMonto, setNuevoMonto] = useState("");
  const [newMonto, setNewMonto] = useState("");
  const [gastoImageUri, setGastoImageUri] = useState(null);

  useEffect(() => {
    obtenerDetalle();
  }, []);

  useFocusEffect(
    useCallback(() => {
      obtenerDetalle(); // tu función para recargar el gasto desde el backend
    }, [])
  );  

  const obtenerDetalle = async () => {
    try {
      const res = await axios.get(`${API_URL}/gastos/${gastoId}/detalle`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setGasto(res.data);

      // Inicializar pagos
      const pagosIniciales = {};
      res.data.deudas.forEach((d) => {
        pagosIniciales[d.id_usuario] = d.pagado;
      });
      setPagos(pagosIniciales);

      // Si tu backend devuelve URL de imagen, puedes setearla
      // setGastoImageUri(res.data.foto_url);
    } catch (error) {
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
      await axios.put(
        `${API_URL}/gastos/${gastoId}/pago`,
        { pagado: nuevoEstado },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar el estado de pago.");
    }
  };

  // Cálculos
  const calcularTotalPagado = () => {
    return gasto.deudas.reduce((acc, d) => {
      const _monto = Number(d.monto) || 0;
      if (d.tipo === "deuda" && pagos[d.id_usuario]) {
        return acc + _monto;
      }
      return acc;
    }, 0);
  };
  const calcularTotalRestante = () => {
    return gasto.deudas.reduce((acc, d) => {
      const _monto = Number(d.monto) || 0;
      if (d.tipo === "deuda" && !pagos[d.id_usuario]) {
        return acc + _monto;
      }
      return acc;
    }, 0);
  };
  const calcularProgreso = () => {
    if (!gasto || !gasto.monto) return 0;
    return calcularTotalPagado() / gasto.monto;
  };

  // Manejo de imagen
  const handleAgregarImagen = async () => {
    // Solicitar permisos, etc.
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permisos denegados", "No se puede acceder a la galería");
      return;
    }
    // Seleccionar imagen
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.cancelled) {
      setGastoImageUri(result.uri);
      // Aquí subirías la imagen a tu backend si corresponde
    }
  };

  // Eliminar gasto
  const handleEliminarGasto = () => {
    console.log("👤 Usuario actual:", user.id);
    console.log("🧾 Creador del gasto:", gasto.creado_por?.id);

    if (gasto.creado_por?.id !== user.id) {
      return Alert.alert(
        "Acción no permitida",
        "Solo el creador del gasto puede eliminarlo."
      );
    }

    Alert.alert("Eliminar Gasto", "¿Estás seguro de que deseas eliminar este gasto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/gastos/${gasto.id}`, {
              headers: { Authorization: `Bearer ${user.token}` },
            });
            Alert.alert("Eliminado", "El gasto fue eliminado correctamente");
            navigation.goBack();
          } catch (error) {
            console.error("❌ Error al eliminar gasto:", error);
            Alert.alert("Error", "No se pudo eliminar el gasto");
          }
        },
        style: "destructive",
      },
    ]);
  };

  // Editar gasto
  const handleAbrirModalEdicion = () => {
    setNewMonto(gasto.monto?.toString() || "");
    setEditModalVisible(true);
  };
  const handleEditarGasto = async () => {
    const montoNumber = Number(nuevoMonto.replace(/[^\d]/g, ""));
  
    if (!montoNumber || isNaN(montoNumber)) {
      Alert.alert("Error", "Ingresa un número válido");
      return;
    }
  
    try {
      await axios.put(
        `${API_URL}/gastos/${gastoId}`,
        { monto: montoNumber },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
  
      setGasto({ ...gasto, monto: montoNumber });
      setEditModalVisible(false);
      Alert.alert("OK", "Monto actualizado");
    } catch (error) {
      console.error("❌ Error al actualizar gasto:", error);
    
      if (error.response) {
        console.error("📥 Respuesta del servidor:", error.response.data);
        console.error("📊 Código de estado:", error.response.status);
      }
    
      Alert.alert("Error", "No se pudo actualizar el gasto");
    }    
  };
  
  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" />;
  }

  if (!gasto) {
    return <Text style={{ marginTop: 40, textAlign: "center" }}>No encontrado</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Encabezado (gradient) */}
      <LinearGradient
        colors={["#2a8873", "#1b6db2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        {/* NUEVA estructura del header */}
        <View style={styles.headerContentRow}>
          {/* Texto del gasto */}
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>{gasto.descripcion}</Text>
            <Text style={styles.subtitle}>Pagado por: {gasto.pagado_por?.nombre}</Text>
            <Text style={styles.bigAmount}>Total: {monto(gasto.monto)}</Text>
          </View>

          {/* Imagen */}
          <TouchableOpacity
            onPress={handleAgregarImagen}
            style={styles.imageWrapper}
          >
            {gastoImageUri ? (
              <Image source={{ uri: gastoImageUri }} style={styles.gastoImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={{ fontSize: 11, color: "#666", textAlign: "center" }}>
                  Agregar{"\n"}foto
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Botón de opciones */}
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "Acciones",
                "",
                [
                  {
                    text: "Editar Gasto",
                    onPress: () => {
                      navigation.navigate("EditarGasto", {
                        gastoId: gasto.id,
                        grupoId: gasto.id_grupo, // asegúrate de tener esto disponible
                        grupoNombre: "",         // opcional
                        participantes: gasto.deudas?.map((d) => ({
                          id: d.id_usuario,
                          nombre: d.nombre_usuario,
                          imagen_perfil: d.imagen_perfil,
                        })) || [],
                      });
                    },
                  },                  
                  { text: "Agregar Imagen", onPress: handleAgregarImagen },
                  { text: "Eliminar Gasto", onPress: handleEliminarGasto, style: "destructive" },
                  { text: "Cancelar", style: "cancel" },
                ],
                { cancelable: true }
              );
            }}
            style={styles.optionsButton}
          >
            <Icon name="more-vert" size={24} color="#fff" />
          </TouchableOpacity>

        </View>
      </LinearGradient>


      {/* Sección de totales */}
      <View style={styles.statusContainer}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Pagado por participantes:</Text>
          <Text style={styles.statusValue}>{monto(calcularTotalPagado())}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Restante por pagar:</Text>
          <Text style={[styles.statusValue, { color: "red" }]}>
            {monto(calcularTotalRestante())}
          </Text>
        </View>
      </View>

      {/* Lista de deudas / participantes */}
      <View style={styles.tableHeaderRow}>
        <Text style={[styles.tableHeaderText, { flex: 1 }]}>Nombre</Text>
        <Text style={[styles.tableHeaderText, { width: 80, textAlign: "center" }]}>
          Monto
        </Text>
        <Text style={[styles.tableHeaderText, { width: 60, textAlign: "center" }]}>
          Pagado
        </Text>
      </View>

      <FlatList
        data={gasto.deudas}
        keyExtractor={(item) => item.id_usuario.toString()}
        renderItem={({ item }) => {
          const esDeuda = item.tipo === "deuda";
          const pagado = pagos[item.id_usuario];
          const color = pagado ? "green" : esDeuda ? "red" : "green";

          // Si ya pagó, su deuda es 0.
          const montoDeuda = pagado && esDeuda ? 0 : item.monto;

          return (
            <View style={styles.participantRow}>
              {/* Nombre / avatar */}
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={{
                    uri:
                      item.imagen_perfil ||
                      "https://cdn-icons-png.flaticon.com/512/847/847969.png",
                  }}
                  style={styles.avatar}
                />
                <Text style={styles.participantName}>{item.nombre_usuario}</Text>
              </View>
              {/* Monto */}
              <Text style={[styles.participantAmount, { color }]}>
                {montoDeuda === 0
                  ? "$0"
                  : `${esDeuda ? "- " : "+ "}${monto(montoDeuda)}`}
              </Text>
              {/* Pagado? */}
              <TouchableOpacity
                disabled={item.id_usuario !== user.id || !esDeuda}
                onPress={() => togglePago(item.id_usuario)}
              >
                <Text style={[styles.payCheck, { opacity: item.id_usuario === user.id ? 1 : 0.3 }]}>
                  {pagado ? "✅" : "⬜️"}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {/* Progreso */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressTitle}>Progreso de pago</Text>
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
        <Text style={styles.helpText}>
          * Solo puedes marcar tu deuda como pagada
        </Text>
      </View>

      {/* Modal edición */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Editar monto del gasto</Text>

            <Text style={styles.label}>Monto total</Text>

            <TextInput
              placeholder="$0"
              value={nuevoMonto ? formatearMonto(nuevoMonto) : ""}
              onChangeText={(text) => {
                // Eliminar todo excepto dígitos
                const soloNumeros = text.replace(/[^0-9]/g, "");
                setNuevoMonto(soloNumeros);
              }}
              keyboardType="numeric"
              style={styles.modalInput}
            />


            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#2ecc71" }]}
                onPress={handleEditarGasto}
              >
                <Text style={styles.modalButtonText}>Guardar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#aaa" }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerGradient: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  screenTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  topInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "#ddd",
    marginBottom: 4,
  },
  bigAmount: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  imageContainer: {
    width: 70,
    height: 70,
    marginLeft: 10,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#f3f3f3",
    justifyContent: "center",
    alignItems: "center",
  },
  gastoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  statusContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },
  statusLabel: {
    fontSize: 14,
    color: "#555",
  },
  statusValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "green",
  },
  tableHeaderRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  tableHeaderText: {
    fontWeight: "bold",
    fontSize: 13,
    color: "#333",
  },
  participantRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  participantName: {
    fontSize: 15,
    color: "#333",
  },
  participantAmount: {
    width: 80,
    fontWeight: "bold",
    textAlign: "center",
  },
  payCheck: {
    width: 60,
    textAlign: "center",
    fontSize: 20,
  },
  progressContainer: {
    alignItems: "center",
    marginVertical: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  helpText: {
    fontSize: 12,
    color: "#888",
    marginTop: 8,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalInput: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
  },
  modalButtonsRow: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  headerGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  headerContentRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerTextContainer: {
    flex: 1,
    justifyContent: "center",
  },

  imageWrapper: {
    width: 60,
    height: 60,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#f3f3f3",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },

  gastoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },

  optionsButton: {
    paddingLeft: 4,
    paddingRight: 4,
  },

});

export default GastoDetalleScreen;

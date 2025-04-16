import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  FlatList,
  Modal,
  Switch,
  Image,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_URL from "../config";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";

const availableIcons = [
  { id: "fast-food-outline", label: "Comida rápida" },
  { id: "restaurant-outline", label: "Restaurante" },
  { id: "cart-outline", label: "Carrito" },
  { id: "medkit-outline", label: "Botiquín" },
  { id: "water-outline", label: "Agua" },
  { id: "car-outline", label: "Auto" },
  { id: "home-outline", label: "Casa" },
  { id: "basket-outline", label: "Canasta" },
  { id: "film-outline", label: "Cine" },
  { id: "shirt-outline", label: "Ropa" },
  { id: "gift-outline", label: "Regalos" },
];

export default function CrearGastoScreen({ route, navigation }) {
  const { user } = useContext(AuthContext);
  const { grupoId, grupoNombre, participantes = [] } = route.params;
  const isDosPersonas = participantes.length === 2;

  const [descripcion, setDescripcion] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [monto, setMonto] = useState("");
  const [pagadoPor, setPagadoPor] = useState(null);
  const [modoDos, setModoDos] = useState("dividido");
  const [distribucion, setDistribucion] = useState("igual");
  const [montosPersonalizados, setMontosPersonalizados] = useState({});
  const [porcentajes, setPorcentajes] = useState({});
  const [nota, setNota] = useState("");
  const [gastoRecurrente, setGastoRecurrente] = useState(false);
  const [diaRecurrente, setDiaRecurrente] = useState("");

  // Control de modales
  const [modalIconVisible, setModalIconVisible] = useState(false);
  const [modalPagadoVisible, setModalPagadoVisible] = useState(false);

  const handleCambioMonto = (text) => {
    const soloNumeros = text.replace(/[^0-9]/g, "");
    const conFormato = soloNumeros.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setMonto(conFormato);
  };

  const handleGuardar = async () => {
    if (!descripcion || !monto || !pagadoPor) {
      return Alert.alert("Campos requeridos", "Completa todos los campos obligatorios");
    }
    const montoLimpio = parseInt(monto.replace(/\./g, ""), 10);
    if (isNaN(montoLimpio) || montoLimpio <= 0) {
      return Alert.alert("Monto inválido", "Ingresa un monto válido mayor a cero.");
    }
    try {
      const token = await AsyncStorage.getItem("token");

      const payload = {
        id_grupo: grupoId,
        descripcion,
        monto: montoLimpio,
        pagado_por: pagadoPor,
        id_usuarios: participantes.map((u) => u.id),
        icono: selectedIcon || null,
        nota,
        recurrente: gastoRecurrente,
      };
      if (gastoRecurrente) {
        payload.dia_recurrente = parseInt(diaRecurrente, 10);
      }

      if (isDosPersonas) {
        payload.distribucion = modoDos === "completo" ? "completo" : "igual";
      } else {
        payload.distribucion = distribucion;
      }

      if (distribucion === "personalizado") {
        const montosNumericos = Object.values(montosPersonalizados).map((m) =>
          parseInt(m.replace(/\./g, ""), 10)
        );
        const sumaMontos = montosNumericos.reduce((acc, val) => acc + val, 0);
        if (sumaMontos !== montoLimpio) {
          return Alert.alert(
            "❌ Montos personalizados inválidos",
            `La suma (${sumaMontos.toLocaleString()}) no coincide con el monto total (${montoLimpio.toLocaleString()})`
          );
        }
        payload.montos_personalizados = Object.fromEntries(
          Object.entries(montosPersonalizados).map(([id, valor]) => [
            id,
            parseInt(valor.replace(/\./g, ""), 10),
          ])
        );
      }
      if (distribucion === "porcentaje") {
        const porcentajeNumerico = Object.values(porcentajes).map((p) => parseInt(p, 10) || 0);
        const suma = porcentajeNumerico.reduce((acc, val) => acc + val, 0);
        if (suma !== 100) {
          return Alert.alert(
            "❌ Porcentajes inválidos",
            `La suma total debe ser 100%. Actualmente suma ${suma}%.`
          );
        }
        payload.montos_porcentuales = Object.fromEntries(
          Object.entries(porcentajes).map(([id, porcentaje]) => [
            id,
            Math.round((parseInt(porcentaje, 10) / 100) * montoLimpio),
          ])
        );
      }

      await axios.post(`${API_URL}/gastos`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert("Éxito", "Gasto creado correctamente");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", error.response?.data?.error || error.message);
    }
  };

  let otroParticipante = null;
  if (isDosPersonas) {
    otroParticipante = participantes.find((p) => p.id !== user.id);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.container}>
        {/* Título centrado */}

        {/* Icono y descripción */}
        <View style={styles.row}>
          <View style={styles.iconField}>
            <Text style={styles.label}>Icono</Text>
            <TouchableOpacity style={styles.iconDropdown} onPress={() => setModalIconVisible(true)}>
              <Ionicons
                name={selectedIcon || "help-circle-outline"}
                size={26}
                color={selectedIcon ? "#2a5298" : "#aaa"}
              />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              placeholder="Ej: Cena, Supermercado"
              value={descripcion}
              onChangeText={setDescripcion}
              style={styles.input}
            />
          </View>
        </View>

        {/* Modal Icono */}
        <Modal
          animationType="slide"
          transparent
          visible={modalIconVisible}
          onRequestClose={() => setModalIconVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Selecciona el icono del gasto</Text>
              <FlatList
                data={availableIcons}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.iconRow,
                      selectedIcon === item.id && styles.iconRowSelected,
                    ]}
                    onPress={() => {
                      setSelectedIcon(item.id);
                      setModalIconVisible(false);
                    }}
                  >
                    <Ionicons
                      name={item.id}
                      size={30}
                      color={selectedIcon === item.id ? "#2a5298" : "#666"}
                    />
                    <Text style={styles.iconLabel}>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalIconVisible(false)}>
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Monto total */}
        <Text style={styles.label}>Monto total</Text>
        <TextInput
          placeholder="$0"
          value={monto ? `$${monto}` : ""}
          onChangeText={handleCambioMonto}
          keyboardType="numeric"
          style={styles.input}
        />

        {/* ¿Quién pagó? */}
        <Text style={styles.label}>¿Quién pagó?</Text>
        <TouchableOpacity style={styles.dropdownField} onPress={() => setModalPagadoVisible(true)}>
          <Text style={styles.dropdownText}>
            {pagadoPor
              ? participantes.find((p) => p.id === pagadoPor)?.nombre || "Selecciona..."
              : "Selecciona..."}
          </Text>
          <Ionicons name="chevron-down-outline" size={20} color="#888" />
        </TouchableOpacity>

        {/* Modal Quien Pagó */}
        <Modal
          animationType="slide"
          transparent
          visible={modalPagadoVisible}
          onRequestClose={() => setModalPagadoVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Selecciona quién pagó</Text>
              <FlatList
                data={participantes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.itemRow}
                    onPress={() => {
                      setPagadoPor(item.id);
                      setModalPagadoVisible(false);
                    }}
                  >
                    {item.imagen_perfil ? (
                      <Image source={{ uri: item.imagen_perfil }} style={styles.profilePic} />
                    ) : (
                      <Ionicons name="person-circle-outline" size={30} color="#999" />
                    )}
                    <Text style={[styles.itemText, { marginLeft: 10 }]}>{item.nombre}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalPagadoVisible(false)}>
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* ¿Cómo registrar el gasto? */}
        {isDosPersonas ? (
          <>
            <Text style={styles.label}>¿Cómo registrar el gasto?</Text>
            <View style={styles.radioRow}>
              <TouchableOpacity
                style={[styles.radioOption, modoDos === "dividido" && styles.radioOptionSelected]}
                onPress={() => setModoDos("dividido")}
              >
                <Text>Dividido en partes iguales</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.radioOption, modoDos === "completo" && styles.radioOptionSelected]}
                onPress={() => setModoDos("completo")}
              >
                <Text>Monto completo</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.label}>¿Cómo registrar el gasto?</Text>
            <View style={styles.radioRow}>
              <TouchableOpacity
                style={[styles.radioOption, distribucion === "igual" && styles.radioOptionSelected]}
                onPress={() => setDistribucion("igual")}
              >
                <Text>Iguales</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.radioOption, distribucion === "personalizado" && styles.radioOptionSelected]}
                onPress={() => setDistribucion("personalizado")}
              >
                <Text>Personalizado</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.radioOption, distribucion === "porcentaje" && styles.radioOptionSelected]}
                onPress={() => setDistribucion("porcentaje")}
              >
                <Text>Porcentaje</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Campos adicionales según distribución */}
        {!isDosPersonas && distribucion === "personalizado" && (
          <View style={styles.inputGroup}>
            <Text style={styles.subLabel}>Ingrese los montos para cada participante:</Text>
            {participantes.map((p) => (
              <View key={p.id} style={styles.inputRow}>
                <Text style={styles.inputName}>{p.nombre}:</Text>
                <TextInput
                  placeholder="$0"
                  keyboardType="numeric"
                  style={styles.inputSmall}
                  value={montosPersonalizados[p.id] || ""}
                  onChangeText={(text) =>
                    setMontosPersonalizados((prev) => ({ ...prev, [p.id]: text }))
                  }
                />
              </View>
            ))}
          </View>
        )}
        {!isDosPersonas && distribucion === "porcentaje" && (
          <View style={styles.inputGroup}>
            <Text style={styles.subLabel}>Ingrese el porcentaje de cada participante (suma 100):</Text>
            {participantes.map((p) => (
              <View key={p.id} style={styles.inputRow}>
                <Text style={styles.inputName}>{p.nombre}:</Text>
                <TextInput
                  placeholder="0"
                  keyboardType="numeric"
                  style={styles.inputSmall}
                  value={porcentajes[p.id] || ""}
                  onChangeText={(text) =>
                    setPorcentajes((prev) => ({ ...prev, [p.id]: text }))
                  }
                />
              </View>
            ))}
          </View>
        )}

        {/* Nota y gasto recurrente */}
        <Text style={styles.label}>Nota (opcional)</Text>
        <TextInput
          placeholder="Agrega una nota adicional..."
          value={nota}
          onChangeText={setNota}
          style={styles.input}
        />

        <View style={[styles.recurrentContainer]}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={[styles.label, { marginRight: 6 }]}>¿Gasto recurrente?</Text>
            <Switch
              value={gastoRecurrente}
              onValueChange={setGastoRecurrente}
            />
          </View>
          {gastoRecurrente && (
            <TextInput
              placeholder="Día (1-31)"
              keyboardType="numeric"
              value={diaRecurrente}
              onChangeText={setDiaRecurrente}
              style={[styles.inputDay, { marginLeft: 10 }]}
              maxLength={2}
            />
          )}
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity style={styles.botonGuardar} onPress={handleGuardar}>
          <Text style={styles.textoGuardar}>Guardar gasto</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  iconField: {
    marginRight: 10,
    alignItems: "center",
  },
  iconDropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  dropdownField: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  radioRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 10,
  },
  radioOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  radioOptionSelected: {
    backgroundColor: "#cde2ff",
    borderColor: "#3a7",
  },
  inputGroup: {
    marginBottom: 12,
  },
  subLabel: {
    fontSize: 13,
    marginBottom: 6,
    color: "#555",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  inputName: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  inputSmall: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
  },
  recurrentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    alignItems: "center",
  },
  inputDay: {
    width: 120,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    textAlign: "center",
    float: "left",
  },
  botonGuardar: {
    backgroundColor: "#2a5298",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  textoGuardar: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  iconRowSelected: {
    backgroundColor: "#e0f0ff",
  },
  iconLabel: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  closeButton: {
    marginTop: 12,
    alignSelf: "center",
    padding: 8,
    backgroundColor: "#2a5298",
    borderRadius: 6,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
  profilePic: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
});

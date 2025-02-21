// GrupoDetalleScreen.js
import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Button,
  Modal,
  TextInput,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import API_URL from "../config";

export default function GrupoDetalleScreen({ route }) {
  const { grupoId } = route.params;
  const { user } = useContext(AuthContext);

  // Lista de gastos en el grupo
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============= Crear Gasto =============
  const [modalCrearVisible, setModalCrearVisible] = useState(false);
  const [montoNuevo, setMontoNuevo] = useState("");
  const [descNuevo, setDescNuevo] = useState("");

  // ============= Editar Gasto =============
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [gastoIdEdit, setGastoIdEdit] = useState(null);
  const [montoEdit, setMontoEdit] = useState("");
  const [descEdit, setDescEdit] = useState("");

  // Aquí asumiré que `user.id` y un usuario extra (id=2) son parte del grupo.
  const [usuariosGrupo, setUsuariosGrupo] = useState([user.id, 2]);

  useEffect(() => {
    obtenerGastos();
  }, []);

  const obtenerGastos = async () => {
    try {
      const response = await axios.get(`${API_URL}/gastos/${grupoId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setGastos(response.data);
    } catch (error) {
      console.error("❌ Error obteniendo gastos:", error);
      Alert.alert("Error", "No se pudieron obtener los gastos.");
    } finally {
      setLoading(false);
    }
  };

  // Crear Gasto
  const crearGasto = async () => {
    if (!montoNuevo.trim() || !descNuevo.trim()) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    try {
      const montoNumber = parseFloat(montoNuevo);
      if (isNaN(montoNumber) || montoNumber <= 0) {
        Alert.alert("Error", "El monto debe ser un número mayor a 0");
        return;
      }

      await axios.post(
        `${API_URL}/gastos`,
        {
          id_grupo: grupoId,
          monto: montoNumber,
          descripcion: descNuevo,
          pagado_por: user.id,
          id_usuarios: usuariosGrupo,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      Alert.alert("Éxito", "Gasto creado correctamente");
      setModalCrearVisible(false);
      setMontoNuevo("");
      setDescNuevo("");
      obtenerGastos();
    } catch (error) {
      console.error("❌ Error creando gasto:", error);
      Alert.alert("Error", "No se pudo crear el gasto");
    }
  };

  // Eliminar Gasto
  const confirmarEliminarGasto = (gastoId) => {
    Alert.alert(
      "Eliminar Gasto",
      "¿Estás seguro que deseas eliminar este gasto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => eliminarGasto(gastoId),
        },
      ]
    );
  };

  const eliminarGasto = async (gastoId) => {
    try {
      await axios.delete(`${API_URL}/gastos/${gastoId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      Alert.alert("Éxito", "Gasto eliminado");
      obtenerGastos();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo eliminar el gasto");
    }
  };

  // Editar Gasto
  const abrirModalEditar = (gasto) => {
    setGastoIdEdit(gasto.id);
    setMontoEdit(gasto.monto.toString());
    setDescEdit(gasto.descripcion);
    setModalEditarVisible(true);
  };

  const editarGasto = async () => {
    if (!montoEdit.trim() || !descEdit.trim()) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    try {
      const montoNumber = parseFloat(montoEdit);
      if (isNaN(montoNumber) || montoNumber <= 0) {
        Alert.alert("Error", "El monto debe ser mayor que 0");
        return;
      }

      await axios.put(
        `${API_URL}/gastos/${gastoIdEdit}`,
        {
          monto: montoNumber,
          descripcion: descEdit,
          pagado_por: user.id, // Por simplicidad, no cambia pagador
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      Alert.alert("Éxito", "Gasto editado");
      setModalEditarVisible(false);
      obtenerGastos();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo editar el gasto");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalle del Grupo #{grupoId}</Text>

      {/* Botón "Nuevo Gasto" con margen */}
      <View style={{ marginTop: 20 }}>
        <Button title="Nuevo Gasto" onPress={() => setModalCrearVisible(true)} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : gastos.length === 0 ? (
        <Text style={styles.noData}>No hay gastos en este grupo.</Text>
      ) : (
        <FlatList
          data={gastos}
          keyExtractor={(item) => item.id.toString()}
          style={{ marginTop: 10 }} // separa la lista de arriba
          renderItem={({ item }) => (
            <View style={styles.gastoItemContainer}>
              <Text style={styles.gastoItem}>
                {item.descripcion}: CLP {item.monto}
              </Text>
              <Button title="Editar" onPress={() => abrirModalEditar(item)} />
              <Button
                title="Eliminar"
                color="red"
                onPress={() => confirmarEliminarGasto(item.id)}
              />
            </View>
          )}
        />
      )}

      {/* Modal CREAR Gasto */}
      <Modal
        visible={modalCrearVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalCrearVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Nuevo Gasto</Text>

            <TextInput
              placeholder="Descripción"
              style={styles.input}
              value={descNuevo}
              onChangeText={setDescNuevo}
            />
            <TextInput
              placeholder="Monto"
              style={styles.input}
              keyboardType="numeric"
              value={montoNuevo}
              onChangeText={setMontoNuevo}
            />

            <Button title="Crear" onPress={crearGasto} />
            <Button
              title="Cancelar"
              onPress={() => setModalCrearVisible(false)}
              color="red"
            />
          </View>
        </View>
      </Modal>

      {/* Modal EDITAR Gasto */}
      <Modal
        visible={modalEditarVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalEditarVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Editar Gasto</Text>

            <TextInput
              placeholder="Descripción"
              style={styles.input}
              value={descEdit}
              onChangeText={setDescEdit}
            />
            <TextInput
              placeholder="Monto"
              style={styles.input}
              keyboardType="numeric"
              value={montoEdit}
              onChangeText={setMontoEdit}
            />

            <Button title="Guardar" onPress={editarGasto} />
            <Button
              title="Cancelar"
              onPress={() => setModalEditarVisible(false)}
              color="red"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  noData: { fontSize: 16, color: "gray", textAlign: "center", marginTop: 20 },
  gastoItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 5,
  },
  gastoItem: {
    flex: 1,
    fontSize: 16,
  },
  // Modales
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
  modalContainer: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    elevation: 5,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    borderColor: "#ccc",
  },
});

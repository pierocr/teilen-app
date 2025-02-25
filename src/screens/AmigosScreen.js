import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  StatusBar,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import API_URL from "../config";
import { debounce } from "lodash"; // 📌 Importar debounce

export default function AmigosScreen() {
  const { user } = useContext(AuthContext);
  const [amigos, setAmigos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerAmigos();
  }, []);

  const obtenerAmigos = async () => {
    try {
      const response = await axios.get(`${API_URL}/amigos`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setAmigos(response.data);
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los amigos.");
    } finally {
      setLoading(false);
    }
  };

  const buscarUsuarios = debounce(async (texto) => {
    if (texto.trim().length === 0) {
      setResultados([]);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/usuarios/buscar?q=${texto}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setResultados(response.data);
    } catch (error) {
      Alert.alert("Error", "No se pudieron buscar usuarios.");
    }
  }, 300); // 📌 Delay de 300ms para evitar peticiones excesivas

  const handleBusqueda = (texto) => {
    setBusqueda(texto);
    buscarUsuarios(texto); // 📌 Llamamos a la búsqueda en tiempo real
  };

  const agregarAmigo = async (amigo_id) => {
    try {
      await axios.post(
        `${API_URL}/amigos`,
        { amigo_id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      Alert.alert("Éxito", "Amigo agregado correctamente");
      obtenerAmigos();
    } catch (error) {
      Alert.alert("Error", "No se pudo agregar al amigo.");
    }
  };

  const eliminarAmigo = async (amigo_id) => {
    Alert.alert(
      "Eliminar Amigo",
      "¿Estás seguro de que quieres eliminar a este amigo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/amigos/${amigo_id}`, {
                headers: { Authorization: `Bearer ${user.token}` },
              });
              Alert.alert("Éxito", "Amigo eliminado correctamente");
              obtenerAmigos();
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar al amigo.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <Text style={styles.title}>Amigos</Text>

      {/* Barra de búsqueda */}
      <TextInput
        style={styles.input}
        placeholder="Buscar por nombre o correo..."
        placeholderTextColor="#888"
        onChangeText={handleBusqueda} // 📌 Búsqueda en tiempo real al escribir
        value={busqueda}
      />

      {/* Mostrar resultados de búsqueda en tiempo real */}
      {resultados.length > 0 && (
        <FlatList
          data={resultados}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Text>{item.nombre} ({item.correo})</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => agregarAmigo(item.id)}>
                <Text style={styles.addButtonText}>Agregar</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <Text style={styles.subtitle}>Tus Amigos</Text>
      {loading ? (
        <Text>Cargando...</Text>
      ) : amigos.length === 0 ? (
        <Text>No tienes amigos agregados.</Text>
      ) : (
        <FlatList
          data={amigos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <View>
                <Text>{item.nombre} ({item.correo})</Text>
                {item.le_debo > 0 && <Text style={{ color: "red" }}>Le debes: {item.le_debo} CLP</Text>}
                {item.me_debe > 0 && <Text style={{ color: "green" }}>Te debe: {item.me_debe} CLP</Text>}
              </View>
              <TouchableOpacity style={styles.deleteButton} onPress={() => eliminarAmigo(item.id)}>
                <Text style={styles.deleteButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 15 },
  subtitle: { fontSize: 18, fontWeight: "bold", marginTop: 20 },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    borderColor: "#ddd",
    color: "#000",
  },
  itemContainer: { flexDirection: "row", justifyContent: "space-between", padding: 10, borderBottomWidth: 1 },
  addButton: { backgroundColor: "#2ecc71", padding: 5, borderRadius: 5 },
  addButtonText: { color: "#fff", fontWeight: "bold" },
  deleteButton: { backgroundColor: "red", padding: 5, borderRadius: 5 },
  deleteButtonText: { color: "#fff", fontWeight: "bold" },
});

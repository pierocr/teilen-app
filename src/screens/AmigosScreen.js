import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import API_URL from "../config";

export default function AmigosScreen() {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();

  const [amigos, setAmigos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nuevoCorreo, setNuevoCorreo] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const obtenerAmigos = async () => {
    try {
      setLoading(true);
      const resp = await fetch(`${API_URL}/amigos`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await resp.json();
      setAmigos(data);
    } catch (error) {
      console.error("Error al obtener amigos:", error);
      Alert.alert("Error", "No se pudieron cargar los amigos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerAmigos();
  }, []);

  const agregarAmigo = async () => {
    if (!nuevoCorreo.trim()) {
      Alert.alert("Error", "Debes ingresar un correo válido.");
      return;
    }

    try {
      const resp = await fetch(`${API_URL}/amigos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ correo: nuevoCorreo }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        Alert.alert("Error", data.error || "No se pudo agregar el amigo.");
        return;
      }

      Alert.alert("Éxito", "Amigo agregado correctamente.");
      setNuevoCorreo("");
      obtenerAmigos();
    } catch (error) {
      console.error("Error al agregar amigo:", error);
      Alert.alert("Error", "No se pudo agregar el amigo.");
    }
  };

  const eliminarAmigo = async (idAmigo) => {
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
              const resp = await fetch(`${API_URL}/amigos/${idAmigo}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${user.token}`,
                },
              });

              if (!resp.ok) {
                Alert.alert("Error", "No se pudo eliminar el amigo.");
                return;
              }

              Alert.alert("Eliminado", "Amigo eliminado correctamente.");
              obtenerAmigos();
            } catch (error) {
              console.error("Error al eliminar amigo:", error);
              Alert.alert("Error", "No se pudo eliminar el amigo.");
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await obtenerAmigos();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.amigoItem}
      onPress={() => navigation.navigate("AmigoDetalle", { amigoId: item.id })}
    >
      <Image
        source={{
          uri: item.imagen_perfil || "https://cdn-icons-png.flaticon.com/512/847/847969.png",
        }}
        style={styles.avatar}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.nombre}>{item.nombre}</Text>
        <Text style={styles.correo}>{item.correo}</Text>
      </View>
      <TouchableOpacity
        style={styles.btnEliminar}
        onPress={() => eliminarAmigo(item.id)}
      >
        <Text style={styles.eliminarTexto}>Eliminar</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Text style={styles.title}>Amigos</Text>

      <View style={styles.agregarContainer}>
        <TextInput
          placeholder="Correo del amigo"
          style={styles.input}
          value={nuevoCorreo}
          onChangeText={setNuevoCorreo}
        />
        <TouchableOpacity style={styles.btnAgregar} onPress={agregarAmigo}>
          <Text style={styles.btnAgregarTexto}>Agregar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : amigos.length === 0 ? (
        <Text style={{ marginTop: 20 }}>No tienes amigos aún.</Text>
      ) : (
        <FlatList
          data={amigos}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={renderItem}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  agregarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
  },
  btnAgregar: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  btnAgregarTexto: {
    color: "#fff",
    fontWeight: "bold",
  },
  amigoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  nombre: {
    fontSize: 16,
    fontWeight: "600",
  },
  correo: {
    fontSize: 14,
    color: "#555",
  },
  btnEliminar: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  eliminarTexto: {
    color: "#fff",
    fontWeight: "bold",
  },
});

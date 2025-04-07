import React, { useContext, useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import API_URL from "../config";
import format from "../utils/format";

export default function CuentaScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerPerfil();
  }, []);

  const obtenerPerfil = async () => {
    try {
      setLoading(true);
      const resp = await axios.get(`${API_URL}/usuarios/perfil`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setPerfil(resp.data);
    } catch (error) {
      console.error("Error obteniendo perfil:", error);
      Alert.alert("Error", "No se pudo cargar la información del usuario.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#2a5298" />
      </SafeAreaView>
    );
  }

  if (!perfil) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Mi Cuenta</Text>
        <Text>No se encontró la información de usuario.</Text>
      </SafeAreaView>
    );
  }

  // Aquí usamos la imagen que viene de la BD.
  // Si no existe, mostramos un ícono genérico.
  const fotoPerfil =
    perfil.imagen_perfil ||
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  const telefono = perfil.telefono || "No especificado";
  const direccion = perfil.direccion || "No especificada";
  const fechaNacimiento = perfil.fecha_nacimiento
    ? format.soloFecha(perfil.fecha_nacimiento)
    : "No especificada";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Mi Cuenta</Text>

        {/* Mostramos siempre la foto proveniente de la BD (perfil.imagen_perfil). */}
        <Image
          source={{
            uri: fotoPerfil,
          }}
          style={styles.avatar}
        />

        <View style={styles.infoContainer}>
          <Dato label="Nombre" valor={perfil.nombre} />
          <Dato label="Correo" valor={perfil.correo} />
          <Dato label="Teléfono" valor={telefono} />
          <Dato label="Dirección" valor={direccion} />
          <Dato label="Fecha de nacimiento" valor={fechaNacimiento} />
        </View>

        {/* Botón para ir a la pantalla de editar cuenta */}
        <TouchableOpacity
          style={styles.btnEditar}
          onPress={() => navigation.navigate("EditarCuenta")}>
          <Text style={styles.btnEditarText}>Editar Cuenta</Text>
        </TouchableOpacity>

        {/* Botón para cerrar sesión */}
        <TouchableOpacity 
        style={styles.btnLogout} 
        onPress={logout}>
        <Text style={styles.btnLogoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>


      </ScrollView>
    </SafeAreaView>
  );
}

const Dato = ({ label, valor }) => (
  <View style={styles.datoRow}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.valor}>{valor}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scroll: { padding: 16, alignItems: "center" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#ccc",
  },
  infoContainer: {
    width: "100%",
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  datoRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  label: {
    fontWeight: "600",
    width: 150,
    color: "#444",
  },
  valor: {
    color: "#555",
    flex: 1,
  },
  btnLogout: {
    backgroundColor: "#FF3B30",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginBottom: 10,
  },
  btnLogoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  btnEditar: {
    backgroundColor: "#2a5298",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginVertical: 10,
  },
  btnEditarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

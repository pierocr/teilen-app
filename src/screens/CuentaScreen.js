import React, { useContext, useState, useEffect } from "react";
import {
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import API_URL from "../config";
import format from "../utils/format";

export default function CuentaScreen() {
  const { user, logout } = useContext(AuthContext);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerPerfil();
  }, []);

  const obtenerPerfil = async () => {
    try {
      setLoading(true);
      const resp = await axios.get(`${API_URL}/auth/perfil`, {
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

  const fotoPerfil =
    perfil.imagen_perfil || "https://cdn-icons-png.flaticon.com/512/847/847969.png";
  const telefono = perfil.telefono || "No especificado";
  const direccion = perfil.direccion || "No especificada";
  const fechaNacimiento = perfil.fecha_nacimiento
    ? format.soloFecha(perfil.fecha_nacimiento)
    : "No especificada";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Mi Cuenta</Text>

        <Image source={{ uri: fotoPerfil }} style={styles.avatar} />

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Nombre: </Text>{perfil.nombre}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Correo: </Text>{perfil.correo}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Teléfono: </Text>{telefono}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Dirección: </Text>{direccion}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Fecha de nacimiento: </Text>{fechaNacimiento}
          </Text>
        </View>

        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scroll: {
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 20,
  },
  infoContainer: {
    width: "100%",
    marginBottom: 30,
  },
  label: {
    fontWeight: "600",
    color: "#444",
  },
  infoText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: "#d11a2a",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

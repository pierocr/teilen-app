// CuentaScreen.js
import React, { useContext, useState, useEffect } from "react";
import { 
  Text, 
  Button, 
  StyleSheet, 
  Image, 
  ActivityIndicator,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import API_URL from "../config";

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
        <ActivityIndicator size="large" color="#0000ff" />
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

  const fotoPerfil = perfil.imagen_perfil || "https://cdn-icons-png.flaticon.com/512/847/847969.png";
  const telefono = perfil.telefono || "No especificado";
  const direccion = perfil.direccion || "No especificada";
  const fechaNacimiento = perfil.fecha_nacimiento 
    ? new Date(perfil.fecha_nacimiento).toLocaleDateString()
    : "No especificada";

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Mi Cuenta</Text>

      <Image source={{ uri: fotoPerfil }} style={styles.avatar} />

      <Text style={styles.infoText}>Nombre: {perfil.nombre}</Text>
      <Text style={styles.infoText}>Correo: {perfil.correo}</Text>
      <Text style={styles.infoText}>Teléfono: {telefono}</Text>
      <Text style={styles.infoText}>Dirección: {direccion}</Text>
      <Text style={styles.infoText}>Fecha de nacimiento: {fechaNacimiento}</Text>

      <Button
        title="Cerrar Sesión"
        onPress={() => logout()}
        color="red"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 20 
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
  },
});

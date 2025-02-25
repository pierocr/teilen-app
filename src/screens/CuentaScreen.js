import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import API_URL from "../config";
import QRCode from "react-native-qrcode-svg"; // 📌 Instala con: npm install react-native-qrcode-svg
import * as Linking from "expo-linking"; // 📌 Para abrir WhatsApp

export default function CuentaScreen() {
  const { user, logout } = useContext(AuthContext);
  const [enlace, setEnlace] = useState(null);
  const [loading, setLoading] = useState(false);

  const obtenerEnlaceInvitacion = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/usuarios/invitar`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setEnlace(response.data.enlace);
    } catch (error) {
      Alert.alert("Error", "No se pudo generar el enlace de invitación.");
    } finally {
      setLoading(false);
    }
  };

  const compartirEnlaceWhatsApp = () => {
    if (enlace) {
      const mensaje = `¡Únete a Teilen! Agrega a ${user.nombre}: ${enlace}`;
      const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
      Linking.openURL(url);
    } else {
      Alert.alert("Error", "Genera el enlace antes de compartirlo.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Cuenta</Text>
      <Image
        source={{ uri: "https://cdn-icons-png.flaticon.com/512/847/847969.png" }}
        style={styles.avatar}
      />
      <Text style={styles.nombre}>{user.nombre}</Text>
      <Text style={styles.correo}>{user.correo}</Text>

      <TouchableOpacity style={styles.button} onPress={obtenerEnlaceInvitacion}>
        <Text style={styles.buttonText}>Generar Código QR</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {enlace && (
        <View style={styles.qrContainer}>
          <QRCode value={enlace} size={150} />
          <Text style={styles.enlace}>{enlace}</Text>
        </View>
      )}

      <TouchableOpacity style={[styles.button, styles.whatsappButton]} onPress={compartirEnlaceWhatsApp}>
        <Text style={styles.buttonText}>Compartir en WhatsApp</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  nombre: { fontSize: 22, fontWeight: "bold", marginBottom: 5 },
  correo: { fontSize: 16, color: "#666", marginBottom: 10 },
  button: { backgroundColor: "#3498db", padding: 10, borderRadius: 5, marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  qrContainer: { alignItems: "center", marginTop: 20 },
  enlace: { fontSize: 14, color: "#444", marginTop: 10, textAlign: "center" },
  whatsappButton: { backgroundColor: "#25D366", marginTop: 20 },
  logoutButton: { marginTop: 30, backgroundColor: "#ff4444", padding: 10, borderRadius: 5 },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

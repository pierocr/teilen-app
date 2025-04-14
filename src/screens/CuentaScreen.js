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
import * as Updates from "expo-updates";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";



export default function CuentaScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      obtenerPerfil();
    });
    return unsubscribe;
  }, [navigation]);
  
  const verificarActualizacion = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        Alert.alert("Actualización disponible", "Se descargará e instalará la nueva versión.");
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      } else {
        Alert.alert("Todo está actualizado", "Ya tienes la última versión.");
      }
    } catch (error) {
      console.error("Error buscando actualización:", error);
      Alert.alert("Error", "No se pudo verificar actualizaciones.");
    }
  };


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

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Image source={{ uri: fotoPerfil }} style={styles.avatar} />
        </View>

        {/* Datos */}
        <View style={styles.card}>
          <TouchableOpacity
            onPress={() => navigation.navigate("EditarCuenta")}
            style={styles.editIcon}
          >
            <Ionicons name="settings-outline" size={22} color="#555" />
          </TouchableOpacity>

          <Dato label="Nombre" valor={perfil.nombre} />
          <Dato label="Correo" valor={perfil.correo} />
          <Dato label="Teléfono" valor={telefono} />
          <Dato label="Dirección" valor={direccion} />
          <Dato label="Fecha de nacimiento" valor={fechaNacimiento} />
        </View>

        {/* Ajustes y opciones */}
        <Text style={styles.subtitulo}>Opciones</Text>
        <View style={styles.boxOpciones}>
        <Opcion
  label="Mi código QR"
  icon="qr-code-outline"
  onPress={() => navigation.navigate("CodigoQR")}
/>

          <Opcion label="Teilen PRO – Próximamente" icon="diamond-outline" onPress={() => { }} />

          <Opcion label="Ajustes de notificación" icon="notifications-outline" onPress={() => { }} />

          <Opcion label="Evaluar Teilen" icon="star-outline" onPress={() => { }} />

          <Opcion
            label="Contacta con la asistencia de Teilen"
            icon="help-circle-outline"
            onPress={() => { }}
          />

          <Opcion
            label="Cerrar Sesión"
            icon="log-out-outline"
            onPress={logout}
            estiloExtra={{ color: "#FF3B30" }}
          />

        </View>

        {/* Pie de página legal */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Hecha con ❤️ y dedicación desde Chile</Text>
          <Text style={styles.footerText}>Derechos reservados de autor 2025 Teilen, Inc.</Text>

          <TouchableOpacity onPress={() => { }}>
            <Text style={styles.footerLink}>Política de privacidad</Text>
          </TouchableOpacity>

          <Text style={styles.footerVersion}>v1.12</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const Opcion = ({ label, icon, iconPack = Ionicons, onPress, estiloExtra }) => (
  <TouchableOpacity onPress={onPress} style={styles.opcion}>
    <View style={styles.opcionInner}>
      {React.createElement(iconPack, {
        name: icon,
        size: 20,
        color: "#444",
        style: { marginRight: 12 },
      })}
      <Text style={[styles.opcionText, estiloExtra]}>{label}</Text>
    </View>
  </TouchableOpacity>
);

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
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#2a5298",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#2a5298",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  boxOpciones: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 6,
    marginBottom: 30,
    marginTop: 10,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 1,
  },
  opcion: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  opcionText: {
    fontSize: 15,
    color: "#333",
  },
  footer: {
    alignItems: "center",
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
    textAlign: "center",
  },
  footerLink: {
    fontSize: 13,
    color: "#2a5298",
    marginTop: 8,
    fontWeight: "600",
  },
  footerVersion: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 4,
  },
  subtitulo: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
    alignSelf: "flex-start",
    marginBottom: 6,
    marginLeft: 10,
    marginTop: 10,
  },
  btnEditarCompacto: {
    alignSelf: "stretch",
    backgroundColor: "#2a5298",
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
    marginHorizontal: 10,
  },
  editIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  editIconText: {
    fontSize: 20,
  },
  opcionInner: {
    flexDirection: "row",
    alignItems: "center",
  },

});

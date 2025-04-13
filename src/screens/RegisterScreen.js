import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons"; // Para usar un ícono, si gustas
import API_URL from "../config";

export default function RegisterScreen({ navigation }) {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [correoValido, setCorreoValido] = useState(true);
  const [correoTocado, setCorreoTocado] = useState(false);
  const [password, setPassword] = useState("");

  const validarCorreo = (texto) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setCorreoValido(regex.test(texto));
  };

  const handleRegister = async () => {
    if (!nombre || !correo || !password) {
      Alert.alert("Campos requeridos", "Nombre, correo y contraseña son obligatorios.");
      return;
    }
    try {
      await axios.post(`${API_URL}/auth/register`, {
        nombre,
        correo,
        password,
      });
      Alert.alert("Éxito", "Usuario registrado. Ahora puedes iniciar sesión.");
      navigation.navigate("Login");
    } catch (error) {
      console.error(error.response?.data || error.message);
      Alert.alert(
        "Error",
        error.response?.data?.error || "No se pudo registrar el usuario"
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // ajusta según sea necesario
    >
      <LinearGradient colors={["#24C6DC", "#514A9D"]} style={styles.container}>
        {/* Botón “Volver” personalizado */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#2F80ED" />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
  
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.card}>
            <Image
              source={{ uri: "https://cdn-icons-png.flaticon.com/512/3177/3177440.png" }}
              style={styles.avatar}
            />
            <Text style={styles.title}>Crear Cuenta</Text>
  
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              onChangeText={setNombre}
            />
            <TextInput
              style={[
                styles.input,
                !correoValido && correoTocado ? styles.inputError : null,
              ]}
              placeholder="Correo"
              keyboardType="email-address"
              autoCapitalize="none"
              value={correo}
              onChangeText={(texto) => {
                setCorreo(texto.trim());
                if (correoTocado) {
                  validarCorreo(texto);
                }
              }}
              onBlur={() => {
                setCorreoTocado(true);
                validarCorreo(correo);
              }}
            />
            {!correoValido && correoTocado && (
              <Text style={styles.errorText}>Correo inválido</Text>
            )}
  
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              secureTextEntry
              onChangeText={setPassword}
            />
  
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Registrarse</Text>
            </TouchableOpacity>
  
            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              style={styles.registerLink}
            >
              <Text style={styles.registerText}>¿Ya tienes cuenta? Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 50, // Ajusta según tu gusto
    marginLeft: 20,
  },
  backText: {
    color: "#2F80ED",
    fontSize: 16,
    marginLeft: 8,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    marginTop: 30, // Para separarlo del botón de “Volver”
  },
  avatar: {
    width: 80,
    height: 80,
    marginBottom: 12,
    borderRadius: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#2F80ED",
  },
  input: {
    width: "100%",
    height: 44,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    alignSelf: "flex-start",
    marginBottom: 8,
    marginLeft: 4,
    fontSize: 12,
  },
  button: {
    backgroundColor: "#2F80ED",
    paddingVertical: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  registerLink: {
    marginTop: 16,
  },
  registerText: {
    color: "#2F80ED",
    fontWeight: "bold",
  },
  backButton: {
    position: "absolute",
    top: 50, // ajusta según si tienes SafeArea o no
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },
  backText: {
    color: "black",
    fontSize: 16,
    marginLeft: 4,
    fontWeight: "500",
  },
});

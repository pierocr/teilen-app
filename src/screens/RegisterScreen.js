import React, { useState, useRef, useEffect } from "react";
import {
  Animated,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import API_URL from "../config";

export default function RegisterScreen({ navigation }) {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [correoValido, setCorreoValido] = useState(true);
  const [correoTocado, setCorreoTocado] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [genero, setGenero] = useState("");
  const [pais, setPais] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Función de validación
const validarCorreo = (correo) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setCorreoValido(regex.test(correo));
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRegister = async () => {
    // Validación básica en frontend
    if (!nombre || !correo || !password) {
      Alert.alert("Campos requeridos", "Nombre, correo y contraseña son obligatorios.");
      return;
    }

    if (password !== confirmarPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        nombre,
        correo,
        password,
        telefono,
        fecha_nacimiento: fechaNacimiento,
        genero,
        pais,
        lenguaje: "es",
      });

      Alert.alert("Éxito", "Usuario registrado. Ahora puedes iniciar sesión.");
      navigation.navigate("Login"); // Asume que se llama "Login" en el navigator
    } catch (error) {
      console.error(error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.error || "No se pudo registrar");
    }
  };

  return (
    <LinearGradient colors={["#24C6DC", "#514A9D"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/3177/3177440.png",
            }}
            style={styles.avatar}
          />
          <Text style={styles.title}>Crear Cuenta</Text>

          <TextInput style={styles.input} placeholder="Nombre completo" onChangeText={setNombre} />
                  <TextInput
                      style={[
                          styles.input,
                          !correoValido && correoTocado ? styles.inputError : null
                      ]}
                      placeholder="Correo"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={correo}
                      onChangeText={(text) => {
                          setCorreo(text.trim());
                          if (correoTocado) {
                              validarCorreo(text);
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
          <TextInput style={styles.input} placeholder="Contraseña" secureTextEntry onChangeText={setPassword} />
          <TextInput style={styles.input} placeholder="Confirmar Contraseña" secureTextEntry onChangeText={setConfirmarPassword} />
          <TextInput style={styles.input} placeholder="Teléfono" keyboardType="numeric" onChangeText={setTelefono} />
          <TextInput style={styles.input} placeholder="Fecha de nacimiento (YYYY-MM-DD)" onChangeText={setFechaNacimiento} />
          <TextInput style={styles.input} placeholder="Género (masculino/femenino/otro)" onChangeText={setGenero} />
          <TextInput style={styles.input} placeholder="País" onChangeText={setPais} />

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Registrarse</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={styles.registerLink}
          >
            <Text style={styles.registerText}>¿Ya tienes cuenta? Inicia sesión</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
      or: {
        marginVertical: 12,
        color: "#888",
      },
      socialContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        gap: 12,
      },
      socialButton: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: "#4267B2",
        paddingVertical: 10,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
      },
      socialText: {
        color: "white",
        marginLeft: 8,
        fontWeight: "bold",
      },
      registerLink: {
        marginTop: 16,
      },
      registerText: {
        color: "#2F80ED",
        fontWeight: "bold",
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
});

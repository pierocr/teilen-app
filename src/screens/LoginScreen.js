import React, { useState, useContext, useRef, useEffect } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import API_URL from "../config";

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = async () => {
    if (!correo || !password) {
      Alert.alert("Campos requeridos", "Ingresa tu correo y contraseña.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        correo,
        password,
      });
      const { token, user } = response.data;
      login(token, user);
    } catch (error) {
      Alert.alert("Error", "Correo o contraseña incorrectos");
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
          <Text style={styles.title}>Iniciar Sesión</Text>

          <TextInput
            placeholder="Correo"
            placeholderTextColor="#999"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(text) => setCorreo(text.trim())}
          />
          <TextInput
            placeholder="Contraseña"
            placeholderTextColor="#999"
            style={styles.input}
            secureTextEntry
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Ingresar</Text>
          </TouchableOpacity>

          <Text style={styles.or}>o continúa con</Text>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-google" size={20} color="white" />
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-facebook" size={20} color="white" />
              <Text style={styles.socialText}>Facebook</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("Registro")}
            style={styles.registerLink}
          >
            <Text style={styles.registerText}>¿No tienes cuenta? Regístrate</Text>
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
});

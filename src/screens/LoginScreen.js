import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import API_URL from "../config";

export default function LoginScreen() {
  const { login } = useContext(AuthContext);
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
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
      <View style={styles.card}>
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
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 12,
    width: "85%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  button: {
    backgroundColor: "#514A9D",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

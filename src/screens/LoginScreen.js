import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URL from "../config";

export default function LoginScreen({ navigation }) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { correo, password });

      // Guardar token en el almacenamiento del dispositivo
      await AsyncStorage.setItem("token", response.data.token);

      Alert.alert("Bienvenido", "Inicio de sesión exitoso");
      navigation.navigate("Home"); // Redirigir al usuario a la pantalla principal
    } catch (error) {
      Alert.alert("Error", "Correo o contraseña incorrectos");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      <TextInput placeholder="Correo" style={styles.input} onChangeText={setCorreo} />
      <TextInput placeholder="Contraseña" style={styles.input} secureTextEntry onChangeText={setPassword} />
      <Button title="Ingresar" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 }
});

import React, { useState, useContext } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import API_URL from "../config";

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { correo, password });
      login(response.data.token);

      // 🔹 Resetea la navegación para que "HomeScreen" sea la raíz
      navigation.reset({
        index: 0,
        routes: [{ name: "Grupos" }],
      });

    } catch (error) {
      Alert.alert("Error", "Correo o contraseña incorrectos");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      <TextInput 
        placeholder="Correo" 
        style={styles.input} 
        keyboardType="email-address" 
        autoCapitalize="none" 
        onChangeText={(text) => setCorreo(text.trim())} 
      />
      <TextInput 
        placeholder="Contraseña" 
        style={styles.input} 
        secureTextEntry 
        onChangeText={setPassword} 
      />
      <Button title="Ingresar" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
});

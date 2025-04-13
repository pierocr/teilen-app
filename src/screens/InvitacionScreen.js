// src/screens/InvitacionScreen.js
import React, { useEffect, useContext } from "react";
import { View, Text, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import API_URL from "../config";

export default function InvitacionScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const ref = route.params?.ref;

    const agregarAmigo = async () => {
      if (!user?.token) {
        Alert.alert("Error", "Debes iniciar sesión para aceptar la invitación.");
        navigation.navigate("Login");
        return;
      }

      try {
        const resp = await fetch(`${API_URL}/amigos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ amigo_id: ref }),
        });

        const data = await resp.json();

        if (!resp.ok) {
          Alert.alert("Error", data.mensaje || "No se pudo agregar al amigo.");
          return;
        }

        Alert.alert("¡Listo!", "Ahora son amigos en Teilen 🎉");
        navigation.navigate("Amigos");
      } catch (error) {
        console.error("Error:", error);
        Alert.alert("Error", "Hubo un problema al aceptar la invitación.");
      }
    };

    if (ref) {
      agregarAmigo();
    }
  }, [route.params]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2F80ED" />
      <Text style={styles.text}>Procesando invitación...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { marginTop: 16, fontSize: 16, color: "#333" },
});

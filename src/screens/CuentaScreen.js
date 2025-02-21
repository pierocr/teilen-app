// src/screens/CuentaScreen.js
import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function CuentaScreen() {
  const { logout } = React.useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Cuenta</Text>
      <Button
        title="Cerrar Sesión"
        onPress={() => {
          // ⛔ No navegamos manualmente
          logout();
          // AppNavigator se encargará de mostrar "Login" automáticamente
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
});

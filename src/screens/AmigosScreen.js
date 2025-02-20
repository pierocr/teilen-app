import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function AmigosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Amigos</Text>
      <Text>Aquí puedes gestionar tus amigos.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
});

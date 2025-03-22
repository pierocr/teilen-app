import React from "react";
import { Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AmigosScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Amigos</Text>
      <Text>Aquí puedes gestionar tus amigos.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
});

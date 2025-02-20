import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ActividadScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Actividad</Text>
      <Text>Aquí puedes ver la actividad reciente.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
});

import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function GrupoItem({ grupo, onPress, onEditar, onEliminar }) {
  const { id, nombre, imagen, total, monto_adeudado } = grupo;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => onPress(id)}
    >
      <View style={styles.infoContainer}>
        <Image
          source={{
            uri: imagen || "https://cdn-icons-png.flaticon.com/512/3207/3207611.png",
          }}
          style={styles.image}
        />
        <View style={styles.textContainer}>
          <Text style={styles.name}>{nombre}</Text>
          <Text style={styles.total}>Total: ${Math.round(total || 0).toLocaleString("es-CL")}</Text>
          <Text style={styles.debt}>
            {monto_adeudado > 0 ? `Debes: $${Math.round(monto_adeudado).toLocaleString("es-CL")}` : "Sin deudas"}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconButton} onPress={() => onEditar(grupo)}>
          <Ionicons name="pencil-outline" size={20} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => onEliminar(id)}>
          <Ionicons name="trash-outline" size={20} color="#d11a2a" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  textContainer: {
    flexDirection: "column",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  total: {
    fontSize: 14,
    color: "#1b873e",
  },
  debt: {
    fontSize: 14,
    color: "#d11a2a",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 10,
    padding: 6,
  },
});

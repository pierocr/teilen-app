// ConfiguracionGrupo.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ConfiguracionGrupo({ route, navigation }) {
  const { grupoId, grupoNombre, grupoImagen } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#2a5298" />
        </TouchableOpacity>
        <Text style={styles.title}>Configuración</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.infoTitle}>{grupoNombre}</Text>
        {/* Aquí podrías mostrar la imagen del grupo si lo deseas */}
        <TouchableOpacity style={styles.imageContainer} onPress={() => {/* Acción para cambiar imagen */}}>
          {grupoImagen ? (
            <View style={styles.imageBox}>
              <Text style={styles.imageText}>Editar Imagen</Text>
            </View>
          ) : (
            <View style={styles.imageBox}>
              <Text style={styles.imageText}>Subir Imagen</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.description}>
          Aquí puedes configurar los detalles de tu grupo. Podrás cambiar el nombre, la imagen y ajustar las opciones de participación.
        </Text>

        {/* Aquí se pueden agregar más opciones, como ajustes, notificaciones, etc. */}
        <TouchableOpacity style={styles.optionButton} onPress={() => alert("Funcionalidad en desarrollo")}>
          <Text style={styles.optionText}>Opción de ejemplo</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2a5298",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2a5298",
    marginBottom: 16,
  },
  imageContainer: {
    marginBottom: 20,
  },
  imageBox: {
    width: 120,
    height: 120,
    backgroundColor: "#eee",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  imageText: {
    color: "#888",
    fontSize: 14,
  },
  description: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: "#2a5298",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  optionText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

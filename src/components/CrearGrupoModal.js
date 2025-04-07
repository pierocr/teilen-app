import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from "react-native";

export default function CrearGrupoModal({
  visible,
  onClose,
  onCreate,
  nombreGrupo,
  imagenGrupo,
  setNombreGrupo,
  setImagenGrupo,
}) {
  return (
    <Modal transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Crear nuevo grupo</Text>

          <TextInput
            placeholder="Nombre del grupo"
            style={styles.input}
            value={nombreGrupo}
            onChangeText={setNombreGrupo}
          />
          <TextInput
            placeholder="URL de imagen (opcional)"
            style={styles.input}
            value={imagenGrupo}
            onChangeText={setImagenGrupo}
          />

          <TouchableOpacity style={styles.primaryButton} onPress={onCreate}>
            <Text style={styles.primaryText}>Crear</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 15,
    backgroundColor: "#fafafa",
  },
  primaryButton: {
    backgroundColor: "#2a5298",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  primaryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  cancelButton: {
    backgroundColor: "#eee",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelText: {
    color: "#555",
    fontWeight: "500",
    fontSize: 15,
  },
});

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { seleccionarYPrepararImagen } from "../utils/subirImagen";
import API_URL from "../config";

export default function EditarGrupoModal({
  visible,
  onClose,
  onSave,
  nombreGrupo,
  imagenGrupo,
  setNombreGrupo,
  grupoId,
}) {
  const [imagenUri, setImagenUri] = useState(null);
  const [formDataImagen, setFormDataImagen] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensajeGuardado, setMensajeGuardado] = useState(false);

  useEffect(() => {
    if (visible) {
      // Al abrir el modal, cargar la imagen actual (si existe)
      setImagenUri(imagenGrupo && imagenGrupo !== "default" ? imagenGrupo : null);
      setFormDataImagen(null);
      setMensajeGuardado(false);
    }
  }, [visible, imagenGrupo]);

  // Función para seleccionar imagen usando la utilidad
  const seleccionarImagen = async () => {
    const resultado = await seleccionarYPrepararImagen();
    if (!resultado) return;
    setImagenUri(resultado.uriPreview);
    setFormDataImagen(resultado.formData);
  };

  // Función para subir imagen al bucket; devuelve la URL nueva o la existente si no se cambió
  const subirImagenAGrupo = async () => {
    if (!formDataImagen) return imagenGrupo;
    try {
      setSubiendo(true);
      const token = await AsyncStorage.getItem("token");
      const resp = await axios.post(`${API_URL}/grupos/imagen`, formDataImagen, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return resp.data.url;
    } catch (error) {
      console.error("❌ Error al subir imagen:", error);
      return imagenGrupo;
    } finally {
      setSubiendo(false);
    }
  };

  // Función para eliminar la imagen del bucket mediante DELETE
  const eliminarImagenDelBucket = async (urlImagen) => {
    if (!urlImagen || urlImagen === "default") return;
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.delete(`${API_URL}/grupos/imagen`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { url: urlImagen },
      });
    } catch (error) {
      console.error("❌ Error eliminando imagen del bucket:", error);
    }
  };

  // Al guardar, si hay una nueva imagen, se elimina la antigua si corresponde
  const handleGuardar = async () => {
    if (!nombreGrupo.trim()) {
      console.warn("handleGuardar: El nombre del grupo es obligatorio");
      alert("El nombre del grupo es obligatorio");
      return;
    }
    try {
      setGuardando(true);
      let nuevaImagen = imagenGrupo;
      // Si se seleccionó una nueva imagen, eliminar la antigua (si existe y no es default)
      if (formDataImagen) {
        if (imagenGrupo && imagenGrupo !== "default") {          
          await eliminarImagenDelBucket(imagenGrupo);      
        }
        nuevaImagen = await subirImagenAGrupo();
        ;
      } else {      
      }
      await onSave(nombreGrupo, nuevaImagen, grupoId);
      setMensajeGuardado(true);
      setTimeout(() => {
        setMensajeGuardado(false);
        onClose();
        
      }, 1500);
    } catch (error) {
      console.error("❌ Error al guardar grupo:", error);
      alert("No se pudo guardar el grupo.");
    } finally {
      setGuardando(false);
      console.log("handleGuardar: finalizado");
    }
  };

  return (
    <Modal transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Editar grupo</Text>

          <View style={styles.row}>
            <TouchableOpacity onPress={seleccionarImagen}>
              <Image
                source={
                  imagenUri ? { uri: imagenUri } : require("../assets/image.png")
                }
                style={styles.avatar}
              />
            </TouchableOpacity>
            <TextInput
              placeholder="Nombre del grupo"
              style={[styles.input, { flex: 1, marginLeft: 12 }]}
              value={nombreGrupo}
              onChangeText={setNombreGrupo}
            />
          </View>

          {subiendo && (
            <ActivityIndicator
              size="small"
              color="#999"
              style={{ marginVertical: 10 }}
            />
          )}

          {mensajeGuardado && (
            <Text style={styles.confirmacion}>✅ Cambios guardados</Text>
          )}

          <TouchableOpacity
            style={[styles.primaryButton, guardando && { opacity: 0.6 }]}
            onPress={handleGuardar}
            disabled={guardando}
          >
            <Text style={styles.primaryText}>
              {guardando ? "Guardando..." : "Guardar"}
            </Text>
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
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    maxHeight: "90%",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#fafafa",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  primaryButton: {
    backgroundColor: "#2a5298",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
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
    marginTop: 8,
  },
  cancelText: {
    color: "#555",
    fontWeight: "500",
    fontSize: 15,
  },
  confirmacion: {
    textAlign: "center",
    color: "green",
    fontWeight: "500",
    marginBottom: 10,
  },
});

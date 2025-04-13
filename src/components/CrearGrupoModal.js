import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URL from "../config";

export default function CrearGrupoModal({
  visible,
  onClose,
  onCreate,          // callback para notificar al padre (si lo necesitas)
  nombreGrupo,
  setNombreGrupo,
}) {
  const [imagenUri, setImagenUri] = useState(null);
  const [amigos, setAmigos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);

  // 🔐 Nuevo estado para impedir que se cree el grupo dos veces
  const [creando, setCreando] = useState(false);

  useEffect(() => {
    const fetchAmigos = async () => {
      try {
        setCargando(true);
        const token = await AsyncStorage.getItem("token");
        const response = await axios.get(`${API_URL}/amigos`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Marcar todos como no seleccionados
        const amigosConSeleccion = response.data.map((amigo) => ({
          ...amigo,
          seleccionado: false,
        }));
        setAmigos(amigosConSeleccion);

        // Resetear campos
        setImagenUri(null);
        setNombreGrupo("");
      } catch (error) {
        console.error("Error al obtener amigos:", error);
      } finally {
        setCargando(false);
      }
    };

    if (visible) {
      fetchAmigos();
    }
  }, [visible]);

  // Seleccionar imagen desde la galería
  const seleccionarImagen = async () => {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!resultado.canceled) {
      setImagenUri(resultado.assets[0].uri);
    }
  };

  // Marcar/desmarcar un amigo
  const toggleSeleccion = (id) => {
    setAmigos((prev) =>
      prev.map((amigo) =>
        amigo.id === id ? { ...amigo, seleccionado: !amigo.seleccionado } : amigo
      )
    );
  };

  // Subir imagen al bucket "grupos" en Supabase
  const subirImagenAGrupo = async () => {
    if (!imagenUri) return null; // Si no se eligió imagen, devolvemos null
    try {
      setSubiendo(true);
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();

      formData.append("imagen", {
        uri: imagenUri,
        type: "image/jpeg",
        name: "grupo.jpg",
      });

      const resp = await axios.post(`${API_URL}/grupos/imagen`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return resp.data.url;
    } catch (error) {
      console.error("❌ Error al subir imagen de grupo:", error);
      return null;
    } finally {
      setSubiendo(false);
    }
  };

  // Handler al presionar "Crear"
const handleCrear = async () => {
  console.log("🔔 handleCrear disparado.");
  console.trace("📍 Stack trace de handleCrear"); // ⬅️ esto mostrará el origen exacto
  if (creando) {
    console.log("🚫 Ya se está creando un grupo, abortamos para evitar duplicados.");
    return;
  }
  setCreando(true);

  try {
    console.log("🌀 Obteniendo token y subiendo imagen si corresponde...");
    const token = await AsyncStorage.getItem("token");
    const urlImagenFinal = await subirImagenAGrupo();
    console.log("✅ Imagen subida (o nula):", urlImagenFinal);

    // Recolectar los IDs de participantes
    const idsSeleccionados = amigos.filter((a) => a.seleccionado).map((a) => a.id);
    console.log("🧩 Participantes seleccionados:", idsSeleccionados);

    // Llamada única, enviando 'participantes'
    console.log("🌐 Llamando POST /grupos con:", {
      nombre: nombreGrupo,
      imagen: urlImagenFinal || "default",
      participantes: idsSeleccionados,
    });
    const resp = await axios.post(
      `${API_URL}/grupos`,
      {
        nombre: nombreGrupo,
        imagen: urlImagenFinal || "default",
        participantes: idsSeleccionados, // 🔴 nuevo
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("🔁 Respuesta de /grupos:", resp.data);

    const nuevoGrupo = resp.data;

    // Llamamos a onCreate (si existe)
   /* console.log("🔔 Llamando onCreate con nuevoGrupo:", nuevoGrupo);
    onCreate?.({
      ...nuevoGrupo,
      participantes: amigos.filter((a) => a.seleccionado),
    });*/

    // limpiar y cerrar
    console.log("🧹 Limpiando estado y cerrando modal...");
    setImagenUri(null);
    setNombreGrupo("");
    setAmigos((prev) => prev.map((a) => ({ ...a, seleccionado: false })));
    onClose();

    console.log("✅ handleCrear completado con éxito.");
  } catch (error) {
    console.error("❌ Error al crear grupo:", error);
  } finally {
    console.log("🧹 setCreando(false) -> se permite crear otro grupo en futuro.");
    setCreando(false);
  }
};

  
  return (
    <Modal transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Crear nuevo grupo</Text>

          {/* Sección: Imagen + Nombre */}
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

          {/* Sección: Lista de amigos */}
          <Text style={styles.friendsTitle}>Agregar participantes</Text>

          {cargando ? (
            <ActivityIndicator
              size="large"
              color="#2a5298"
              style={{ marginVertical: 20 }}
            />
          ) : (
            <FlatList
              data={amigos}
              keyExtractor={(item) => item.id.toString()}
              style={{ maxHeight: 200 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => toggleSeleccion(item.id)}
                  style={styles.friendItem}
                >
                  <Image
                    source={
                      item.imagen_perfil
                        ? { uri: item.imagen_perfil }
                        : require("../assets/avatar.png")
                    }
                    style={styles.friendAvatar}
                  />
                  <Text style={styles.friendName}>{item.nombre}</Text>
                  <View
                    style={[
                      styles.checkbox,
                      item.seleccionado && styles.checkboxChecked,
                    ]}
                  />
                </TouchableOpacity>
              )}
            />
          )}

          {/* Spinner si está subiendo imagen */}
          {subiendo && (
            <ActivityIndicator
              size="small"
              color="#999"
              style={{ marginVertical: 10 }}
            />
          )}

          {/* Botón Crear */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (subiendo || creando) && { opacity: 0.6 },
            ]}
            onPress={handleCrear}
            disabled={subiendo || creando}
          >
            <Text style={styles.primaryText}>
              {creando ? "Creando..." : "Crear"}
            </Text>
          </TouchableOpacity>

          {/* Botón Cancelar */}
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// Estilos
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
    borderRadius: 30,
  },
  friendsTitle: {
    fontWeight: "600",
    marginBottom: 8,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  friendAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  friendName: {
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#2a5298",
    backgroundColor: "transparent",
  },
  checkboxChecked: {
    backgroundColor: "#2a5298",
  },
  primaryButton: {
    backgroundColor: "#2a5298",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
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
});

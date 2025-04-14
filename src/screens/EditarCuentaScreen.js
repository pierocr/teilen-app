import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView, 
  ScrollView,
  Modal
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import API_URL from "../config";
import format from "../utils/format";
import DateTimePicker from "@react-native-community/datetimepicker";


export default function EditarCuentaScreen({ navigation }) {
  const { user, actualizarUsuario } = useContext(AuthContext);

  // Estados para los campos
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [imagenLocal, setImagenLocal] = useState(null); // Para mostrar preview antes de subir
  const [imagenActualBD, setImagenActualBD] = useState(null);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);



  useEffect(() => {
    // Al montar la pantalla, traer el perfil actual (o recibirlo por params)
    obtenerPerfil();
    navigation.setOptions({
      headerBackTitle: "", // puedes usar "Volver" si prefieres
    });
  }, [[navigation]]);

  const obtenerPerfil = async () => {
    try {
      const resp = await axios.get(`${API_URL}/usuarios/perfil`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const p = resp.data;
      setNombre(p.nombre || "");
      setTelefono(p.telefono || "");
      setDireccion(p.direccion || "");
      setFechaNacimiento(p.fecha_nacimiento || "");
      setImagenActualBD(p.imagen_perfil || null);
    } catch (error) {
      Alert.alert("Error", "No se pudo cargar la información del usuario.");
      console.error(error);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 2.1 Seleccionar imagen desde galería o cámara
  // ─────────────────────────────────────────────────────────────────────────────

  const seleccionarImagen = async (origen = "galeria") => {
    try {
      // Pedimos permisos si no lo hicimos antes
      const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permiso.granted) {
        Alert.alert("Permiso denegado", "Necesitas permitir el acceso a la galería.");
        return;
      }

      let resultado;
      if (origen === "camara") {
        const permisoCamara = await ImagePicker.requestCameraPermissionsAsync();
        if (!permisoCamara.granted) {
          Alert.alert("Permiso denegado", "Necesitas permitir el acceso a la cámara.");
          return;
        }
        resultado = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });
      } else {
        resultado = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });
      }

      if (!resultado.canceled && resultado.assets?.length > 0) {
        // Guardamos la URI local de la imagen elegida
        setImagenLocal(resultado.assets[0].uri);
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      Alert.alert("Error", "Ocurrió un problema al seleccionar la imagen.");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 2.2 Subir la nueva imagen de perfil (si hay) al backend
  // ─────────────────────────────────────────────────────────────────────────────

  const subirImagenPerfil = async () => {
    if (!imagenLocal) return null; // No hay imagen nueva, no subimos nada

    try {
      const formData = new FormData();
      formData.append("imagen", {
        uri: imagenLocal,
        type: "image/jpeg", // ajusta según el mime-type de la imagen
        name: `perfil.jpg`,
      });

      const resp = await axios.post(`${API_URL}/usuarios/imagen`, formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (resp.data.url) {
        // Actualizamos globalmente la info
        actualizarUsuario({ imagen_perfil: resp.data.url });
        // resp.data.url es la URL pública en Supabase
        return resp.data.url;
      } else {
        return null;
      }
    } catch (error) {
      console.error("❌ Error al subir imagen:", error);
      Alert.alert("Error", "No se pudo subir la imagen de perfil.");
      return null;
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 2.3 Guardar cambios en el backend (nombre, teléfono, etc.)
  // ─────────────────────────────────────────────────────────────────────────────

  const guardarCambios = async () => {
    try {
      // Primero subimos imagen (si hay) y obtenemos la URL
      const urlImagen = await subirImagenPerfil();

      // Luego guardamos datos en la BD
      const resp = await axios.patch(`${API_URL}/usuarios/editar`, {
        nombre,
        telefono,
        direccion,
        fecha_nacimiento: fechaNacimiento,
      }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      // Si la imagen se subió con éxito, 
      // la BD ya se actualiza con `UPDATE usuarios ... imagen_perfil = ?`
      // o la guardas con otro endpoint, depende cómo lo diseñes
      // *Acá asumimos que la URL se setea en el endpoint /usuarios/imagen*

      // O si prefieres en el mismo endpoint, 
      // tu JSON puede incluir la urlImagen para guardarla en la BD:
      // {
      //   nombre, telefono, direccion, fecha_nacimiento,
      //   imagen_perfil: urlImagen
      // }

      // Y luego refrescas la pantalla o navegas de regreso
      Alert.alert("Éxito", "Datos actualizados correctamente");
      navigation.goBack();
    } catch (error) {
      console.error("Error guardando cambios:", error);
      Alert.alert("Error", "No se pudieron guardar los cambios.");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 2.4 Renderizar
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === "ios" ? "padding" : "height"}
  keyboardVerticalOffset={100} // Ajusta según tu header
>
  <ScrollView contentContainerStyle={styles.container}>
  
      {/* Imagen de perfil */}
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={() => seleccionarImagen("galeria")}>
          <Image
            source={{
              uri: imagenLocal
                ? imagenLocal
                : imagenActualBD
                ? imagenActualBD
                : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
            }}
            style={styles.avatar}
          />
        </TouchableOpacity>
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.botonFoto}
            onPress={() => seleccionarImagen("galeria")}
          >
            <Text style={styles.botonFotoText}>Galería</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.botonFoto}
            onPress={() => seleccionarImagen("camara")}
          >
            <Text style={styles.botonFotoText}>Cámara</Text>
          </TouchableOpacity>
        </View>
      </View>
  
      {/* Campos */}
{/* Campos */}

<View style={styles.inputGroup}>
  <Text style={styles.label}>Nombre completo</Text>
  <TextInput
    style={styles.input}
    value={nombre}
    onChangeText={setNombre}
  />
</View>

<View style={styles.inputGroup}>
  <Text style={styles.label}>Teléfono</Text>
  <TextInput
    style={styles.input}
    keyboardType="phone-pad"
    value={telefono}
    onChangeText={setTelefono}
  />
</View>

<View style={styles.inputGroup}>
  <Text style={styles.label}>Dirección</Text>
  <TextInput
    style={styles.input}
    value={direccion}
    onChangeText={setDireccion}
  />
</View>

<View style={styles.inputGroup}>
  <Text style={styles.label}>Fecha de nacimiento</Text>
  <TouchableOpacity
    onPress={() => setMostrarCalendario(true)}
    style={styles.input}
  >
    <Text style={{ color: fechaNacimiento ? "#000" : "#888" }}>
      {fechaNacimiento
        ? new Date(fechaNacimiento).toISOString().split("T")[0]
        : "Selecciona una fecha"}
    </Text>
  </TouchableOpacity>
</View>

{mostrarCalendario && (
  Platform.OS === "ios" ? (
    <Modal
      animationType="fade"
      transparent={true}
      visible={mostrarCalendario}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <DateTimePicker
            value={fechaNacimiento ? new Date(fechaNacimiento) : new Date()}
            mode="date"
            display="spinner"
            maximumDate={new Date()}
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                setFechaNacimiento(selectedDate.toISOString());
              }
            }}
            style={{ backgroundColor: "#fff" }}
          />
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => setMostrarCalendario(false)}
          >
            <Text style={styles.confirmText}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  ) : (
    <DateTimePicker
      value={fechaNacimiento ? new Date(fechaNacimiento) : new Date()}
      mode="date"
      display="default"
      maximumDate={new Date()}
      onChange={(event, selectedDate) => {
        setMostrarCalendario(false);
        if (selectedDate) {
          setFechaNacimiento(selectedDate.toISOString());
        }
      }}
    />
  )
)}
      {/* Guardar */}
      <TouchableOpacity style={styles.botonGuardar} onPress={guardarCambios}>
        <Text style={styles.botonGuardarText}>Guardar Cambios</Text>
      </TouchableOpacity>
    </ScrollView> 
  </KeyboardAvoidingView>
  );  
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    marginBottom: 10, borderWidth: 1, borderColor: "#ccc"
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "60%",
    marginBottom: 20
  },
  botonFoto: {
    backgroundColor: "#3498db",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  botonFotoText: { color: "#fff", fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  botonGuardar: {
    backgroundColor: "green",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  botonGuardarText: { color: "#fff", fontWeight: "bold" },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#3498db",
    marginBottom: 10,
  },
  botonFoto: {
    backgroundColor: "#2a5298",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 6,
  },
  botonFotoText: {
    color: "#fff",
    fontWeight: "bold",
  },
  inputGroup: {
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "85%",
    alignItems: "center",
  },
  confirmButton: {
    marginTop: 10,
    backgroundColor: "#2a5298",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  confirmText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

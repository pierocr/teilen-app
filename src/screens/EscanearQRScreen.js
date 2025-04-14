import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Camera, CameraView } from "expo-camera"; // ✅ Importar ambos
import { AuthContext } from "../context/AuthContext";
import API_URL from "../config"; // importas tu variable global

export default function EscanearQRScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    (async () => {
      console.log("⌛ Pidiendo permiso cámara...");
      const { status } = await Camera.requestCameraPermissionsAsync(); // ✅ usar Camera
      console.log("✔️ Permiso finalizado:", status);
      setHasPermission(status === "granted");
    })();
  }, []);
  

  // Handler para el evento de escaneo
  const handleBarCodeScanned = async ({ type, data }) => {
    // Evitamos lecturas múltiples
    if (scanned) return;
    setScanned(true);
    setCargando(true);

    try {
      // Consumimos tu endpoint /amigos
      const resp = await fetch(`${API_URL}/amigos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ amigo_id: parseInt(data) }),
      });

      const result = await resp.json();

      if (!resp.ok) {
        Alert.alert("Error", result.mensaje || "No se pudo agregar el amigo.");
        setScanned(false);
        return;
      }

      Alert.alert("🎉 Amigo agregado", "Se ha agregado correctamente.");
      navigation.goBack();
    } catch (error) {
      console.error("❌ Error al agregar amigo desde QR:", error);
      Alert.alert("Error", "Ocurrió un error al agregar el amigo.");
      setScanned(false);
    } finally {
      setCargando(false);
    }
  };

  // Manejo de permisos
  if (hasPermission === null) {
    return <Text style={styles.textAviso}>Solicitando permiso de cámara...</Text>;
  }
  if (hasPermission === false) {
    return <Text style={styles.textAviso}>Permiso de cámara denegado</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Escanea un código QR</Text>

      {/* Al escanear un QR, llama a handleBarCodeScanned
          Solo escanea si 'scanned' está en false */}
      <CameraView
        style={styles.camera}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        barCodeScannerSettings={{
          barCodeTypes: ["qr"], // Solo busca QR
        }}
      />

      <Text style={styles.texto}>
        Alinea el código QR dentro del recuadro para escanearlo
      </Text>

      {cargando && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#2a5298" />
          <Text style={styles.loaderText}>Agregando amigo...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  textAviso: {
    flex: 1,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 16,
  },
  container: {
    flex: 1,
    paddingTop: 40,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  camera: {
    width: "90%",
    height: 300,
    borderRadius: 12,
    overflow: "hidden",
  },
  texto: {
    marginTop: 20,
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  loaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99,
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
});

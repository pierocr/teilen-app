import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Image,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URL from "../config";

export default function AgregarParticipanteScreen({ route, navigation }) {
  const { grupoId, participantesActuales } = route.params;
  const [amigos, setAmigos] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    obtenerAmigos();
  }, []);

  const obtenerAmigos = async () => {
    try {
      setCargando(true);
      const token = await AsyncStorage.getItem("token");
      const resp = await axios.get(`${API_URL}/amigos`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const idsActuales = participantesActuales.map((p) => p.id);
      const disponibles = resp.data.filter((a) => !idsActuales.includes(a.id));

      setAmigos(disponibles);
    } catch (error) {
      console.error("Error obteniendo amigos:", error);
    } finally {
      setCargando(false);
    }
  };

  const toggleSeleccion = (id) => {
    if (seleccionados.includes(id)) {
      setSeleccionados(seleccionados.filter((uid) => uid !== id));
    } else {
      setSeleccionados([...seleccionados, id]);
    }
  };

  const confirmarAgregar = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(
        `${API_URL}/grupos/${grupoId}/participantes`,
        { usuariosAAgregar: seleccionados },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigation.goBack();
    } catch (error) {
      console.error("Error agregando participantes:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecciona amigos para añadir al grupo</Text>
      {cargando ? (
        <ActivityIndicator size="large" color="#2a5298" />
      ) : (
        <FlatList
          data={amigos}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 80 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => toggleSeleccion(item.id)}
              style={styles.amigoItem}
            >
              <Image
                source={
                  item.imagen_perfil
                    ? { uri: item.imagen_perfil }
                    : require("../assets/avatar.png")
                }
                style={styles.avatar}
              />
              <Text style={styles.nombre}>{item.nombre}</Text>
              <View
                style={[styles.checkbox, seleccionados.includes(item.id) && styles.checkboxChecked]}
              />
            </TouchableOpacity>
          )}
        />
      )}
      {seleccionados.length > 0 && (
        <TouchableOpacity onPress={confirmarAgregar} style={styles.botonConfirmar}>
          <Text style={styles.botonTexto}>Agregar {seleccionados.length} participante(s)</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#2a2a2a",
  },
  amigoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  nombre: {
    flex: 1,
    fontSize: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#2a5298",
    backgroundColor: "transparent",
  },
  checkboxChecked: {
    backgroundColor: "#2a5298",
  },
  botonConfirmar: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#2a5298",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  botonTexto: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
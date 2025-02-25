import React, { useState, useEffect, useContext } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  StyleSheet 
} from "react-native";
import axios from "axios";
import API_URL from "../config";
import { AuthContext } from "../context/AuthContext";

export default function AgregarParticipanteScreen({ route, navigation }) {
  const { grupoId } = route.params;
  const { user } = useContext(AuthContext);
  const [amigos, setAmigos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [amigosFiltrados, setAmigosFiltrados] = useState([]);

  useEffect(() => {
    obtenerAmigos();
  }, []);

  const obtenerAmigos = async () => {
    try {
      const response = await axios.get(`${API_URL}/amigos`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setAmigos(response.data || []);
      setAmigosFiltrados(response.data || []);
    } catch (error) {
      console.error("❌ Error obteniendo amigos:", error);
      Alert.alert("Error", "No se pudieron cargar los amigos.");
    }
  };

  const filtrarAmigos = (texto) => {
    setBusqueda(texto);
    if (texto === "") {
      setAmigosFiltrados(amigos);
    } else {
      setAmigosFiltrados(amigos.filter(a => 
        a.nombre.toLowerCase().includes(texto.toLowerCase()) ||
        a.email.toLowerCase().includes(texto.toLowerCase())
      ));
    }
  };

  const agregarParticipante = async (idUsuario) => {
    try {
      await axios.post(`${API_URL}/grupos/${grupoId}/agregar`, 
        { idUsuario },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      Alert.alert("Éxito", "Participante agregado correctamente.");
      navigation.goBack();
    } catch (error) {
      console.error("❌ Error agregando participante:", error);
      Alert.alert("Error", "No se pudo agregar al participante.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agregar Participante</Text>
      <TextInput
        style={styles.input}
        placeholder="Buscar por nombre o email..."
        value={busqueda}
        onChangeText={filtrarAmigos}
      />
      <FlatList
        data={amigosFiltrados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.participantItem} 
            onPress={() => agregarParticipante(item.id)}
          >
            <Text>{item.nombre} ({item.email})</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  input: { 
    borderWidth: 1, 
    borderColor: "#ddd", 
    padding: 10, 
    borderRadius: 5, 
    marginBottom: 10 
  },
  participantItem: { 
    padding: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: "#ddd" 
  }
});

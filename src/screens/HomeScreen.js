import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import API_URL from "../config";

export default function HomeScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigation.replace("Login"); // 🔹 Si no hay usuario autenticado, ir al Login
    }
  }, [user]);

  // Función para obtener los grupos
  const obtenerGrupos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/grupos`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setGrupos(response.data);
    } catch (error) {
      Alert.alert("Error", "No se pudieron obtener los grupos.");
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar con Pull-to-Refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await obtenerGrupos();
    setRefreshing(false);
  };

  useEffect(() => {
    obtenerGrupos();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tus Grupos</Text>

      {/* Botón de Cerrar Sesión */}
      <Button title="Cerrar Sesión" onPress={() => { 
        logout();
        navigation.navigate("Login");
      }} />

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={grupos}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} // 🔹 Habilitar Pull-to-Refresh
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate("GrupoDetalle", { grupoId: item.id })}>
              <View style={styles.groupItem}>
                {item.imagen && <Image source={{ uri: item.imagen }} style={styles.image} />}
                <View>
                  <Text style={styles.groupName}>{item.nombre}</Text>
                  <Text style={styles.groupTotal}>Total: CLP {item.total}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  groupItem: { flexDirection: "row", alignItems: "center", padding: 10, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  image: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  groupName: { fontSize: 18, fontWeight: "bold" },
  groupTotal: { fontSize: 16, color: "green" },
});

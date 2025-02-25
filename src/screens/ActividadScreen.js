import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import API_URL from "../config";

export default function ActividadScreen() {
  const { user } = useContext(AuthContext);
  const [actividad, setActividad] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    obtenerActividad();
  }, []);

  const obtenerActividad = async () => {
    try {
      const response = await axios.get(`${API_URL}/actividad`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setActividad(response.data);
    } catch (error) {
      console.error("Error obteniendo actividad:", error);
      Alert.alert("Error", "No se pudo cargar la actividad.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    obtenerActividad();
  };

  const renderItem = ({ item }) => {
    const color = item.tipo === "Debes" ? "red" : "green";
    return (
      <View style={styles.itemContainer}>
        <Text style={styles.descripcion}>
          {item.creador === user.nombre ? "Tú" : item.creador} añadió{" "}
          <Text style={styles.gasto}>“{item.gasto}”</Text> en{" "}
          <Text style={styles.grupo}>{item.grupo_nombre}</Text>.
        </Text>
        <Text style={[styles.monto, { color }]}>
          {item.tipo} {item.monto_balance.toLocaleString("es-CL")} CLP
        </Text>
        <Text style={styles.fecha}>{new Date(item.creado_en).toLocaleString()}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Actividad</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={actividad}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, marginTop: 20 },
  itemContainer: { marginBottom: 10, padding: 10, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  descripcion: { fontSize: 16 },
  gasto: { fontWeight: "bold" },
  grupo: { fontStyle: "italic" },
  monto: { fontSize: 16, fontWeight: "bold", marginTop: 5 },
  fecha: { fontSize: 12, color: "#888", marginTop: 5 },
});

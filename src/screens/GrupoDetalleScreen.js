import React, { useEffect, useState, useContext } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import API_URL from "../config";

export default function GrupoDetalleScreen({ route }) {
  const { grupoId } = route.params;
  const { user } = useContext(AuthContext);
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerGastos = async () => {
      try {
        const response = await axios.get(`${API_URL}/gastos?grupo_id=${grupoId}`, {
          headers: { Authorization: `Bearer ${user.token}` }, // 🔹 Agregar el token en la petición
        });

        setGastos(response.data);
      } catch (error) {
        console.error("❌ Error obteniendo los gastos:", error);
        Alert.alert("Error", "No se pudieron obtener los gastos.");
      } finally {
        setLoading(false);
      }
    };

    obtenerGastos();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalle del Grupo</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : gastos.length === 0 ? (
        <Text style={styles.noData}>No hay gastos en este grupo.</Text>
      ) : (
        <FlatList
          data={gastos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Text style={styles.gastoItem}>{item.descripcion}: CLP {item.monto}</Text>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  noData: { fontSize: 16, color: "gray", textAlign: "center", marginTop: 20 },
  gastoItem: { fontSize: 18, padding: 10, borderBottomWidth: 1, borderBottomColor: "#ddd" },
});

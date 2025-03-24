import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import API_URL from "../config";
import { Ionicons } from "@expo/vector-icons";
import format from "../utils/format";

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
      setLoading(true);
      const resp = await axios.get(`${API_URL}/gastos/actividad`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setActividad(resp.data);
    } catch (error) {
      console.error("Error al obtener la actividad:", error);
      Alert.alert("Error", "No se pudo cargar la actividad");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await obtenerActividad();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Ionicons name="cash-outline" size={24} color="#2a5298" style={styles.icon} />
        <View style={{ flex: 1 }}>
          <Text style={styles.descripcion}>{item.descripcion}</Text>
          <Text style={styles.monto}>Monto: ${format.monto(item.monto)}</Text>
          <Text style={styles.subText}>Grupo: {item.nombre_grupo}</Text>
          <Text style={styles.subText}>Pagado por: {item.nombre_pagador}</Text>
          <Text style={styles.fecha}>{format.fecha(item.creado_en)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Actividad</Text>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#2a5298" />
      ) : actividad.length === 0 ? (
        <Text style={styles.empty}>No hay transacciones asociadas a tu usuario.</Text>
      ) : (
        <FlatList
          data={actividad}
          keyExtractor={(item) => item.gasto_id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={renderItem}
          ListFooterComponent={() =>
            loading ? <ActivityIndicator size="small" color="#2a5298" /> : null
          }
        />
      )}
    </SafeAreaView>
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
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
    color: "#333",
  },
  empty: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginTop: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  icon: {
    marginRight: 12,
    marginTop: 4,
  },
  descripcion: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  monto: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2a5298",
  },
  subText: {
    fontSize: 13,
    color: "#666",
  },
  fecha: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
});

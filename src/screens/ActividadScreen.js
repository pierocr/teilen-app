// ActividadScreen.js
import React, { useContext, useState, useEffect } from "react";
import {
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
      const resp = await axios.get(`${API_URL}/actividad`, {
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

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (actividad.length === 0 && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Actividad</Text>
        <Text>No hay transacciones asociadas a tu usuario.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Actividad</Text>
      <FlatList
        data={actividad}
        keyExtractor={(item) => item.gasto_id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemText}>
              {item.descripcion} | Monto: CLP {item.monto}
            </Text>
            <Text style={styles.subText}>
              Grupo: {item.nombre_grupo} | Pagado por: {item.nombre_pagador}
            </Text>
            <Text style={styles.subText}>
              Fecha: {new Date(item.creado_en).toLocaleString()}
            </Text>
          </View>
        )}
        ListFooterComponent={() =>
          loading ? <ActivityIndicator size="small" color="#0000ff" /> : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "flex-start",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  itemContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  subText: {
    fontSize: 14,
    color: "#666",
  },
});

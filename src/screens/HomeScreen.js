import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_URL from "../config";

export default function HomeScreen({ navigation }) {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerGrupos = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          Alert.alert("Error", "No hay sesión activa.");
          navigation.navigate("Login");
          return;
        }

        const response = await axios.get(`${API_URL}/grupos`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setGrupos(response.data);
      } catch (error) {
        Alert.alert("Error", "No se pudieron obtener los grupos.");
      } finally {
        setLoading(false);
      }
    };

    obtenerGrupos();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tus Grupos</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : grupos.length === 0 ? (
        <Text style={styles.noGroups}>No tienes grupos aún.</Text>
      ) : (
        <FlatList
          data={grupos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.groupItem}>
              {item.imagen && <Image source={{ uri: item.imagen }} style={styles.image} />}
              <View>
                <Text style={styles.groupName}>{item.nombre}</Text>
                <Text style={styles.groupTotal}>Total: CLP {item.total}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  noGroups: { fontSize: 16, color: "gray", textAlign: "center", marginTop: 20 },
  groupItem: { flexDirection: "row", alignItems: "center", padding: 10, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  image: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  groupName: { fontSize: 18, fontWeight: "bold" },
  groupTotal: { fontSize: 16, color: "green" },
});

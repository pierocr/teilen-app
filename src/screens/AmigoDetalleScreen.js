import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import API_URL from "../config";

export default function AmigoDetalleScreen({ route }) {
  const { user } = useContext(AuthContext);
  const { amigoId } = route.params;

  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);

  const obtenerDetalle = async () => {
    try {
      const res = await axios.get(`${API_URL}/amigos/${amigoId}/detalle`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setDatos(res.data);
    } catch (error) {
      console.error("Error al obtener datos del amigo:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerDetalle();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!datos || !datos.amigo) {
    return (
      <View style={styles.centered}>
        <Text>No se encontraron datos del amigo.</Text>
      </View>
    );
  }

  const { amigo, grupos_compartidos, deuda_tu_le_debes, deuda_el_te_debe } =
    datos;

  const saldo = deuda_el_te_debe - deuda_tu_le_debes;

  const balanceLabel =
    saldo > 0
      ? `Te debe $${saldo}`
      : saldo < 0
      ? `Le debes $${Math.abs(saldo)}`
      : "Están a mano";

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{
            uri:
              amigo.imagen_perfil ||
              "https://cdn-icons-png.flaticon.com/512/847/847969.png",
          }}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.name}>{amigo.nombre}</Text>
          <Text style={styles.email}>{amigo.correo}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Deudas Mutuas</Text>
      <Text style={styles.balanceText}>
        A favor: ${deuda_el_te_debe || 0} | Adeudado: ${deuda_tu_le_debes || 0}
      </Text>
      <Text style={styles.balanceSummary}>{balanceLabel}</Text>

      <Text style={styles.sectionTitle}>Grupos Compartidos</Text>
      {grupos_compartidos && grupos_compartidos.length > 0 ? (
        grupos_compartidos.map((grupo) => (
          <Text key={grupo.id} style={styles.groupItem}>
            • {grupo.nombre}
          </Text>
        ))
      ) : (
        <Text style={styles.noGroups}>No hay grupos compartidos.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },
  email: {
    fontSize: 14,
    color: "#555",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 5,
  },
  balanceText: {
    fontSize: 16,
  },
  balanceSummary: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
    marginBottom: 10,
  },
  groupItem: {
    fontSize: 16,
    paddingVertical: 4,
    paddingLeft: 5,
  },
  noGroups: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#888",
  },
});

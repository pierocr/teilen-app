// ResumenGrupo.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ProgressBar } from "react-native-paper";
import { monto } from "../utils/format";

const ResumenGrupo = ({ deudaRestante = 0, porcentajePagado = 0, totalGastado = 0, totalPagado = 0 }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.titulo}>Resumen del grupo</Text>
        <Ionicons name="wallet-outline" size={20} color="#555" />
      </View>

      <Text style={styles.monto}>Deuda restante: {monto(deudaRestante)}</Text>

      <ProgressBar
        progress={porcentajePagado}
        color="#4caf50"
        style={styles.barraProgreso}
      />

      <View style={styles.filaTotales}>
        <Text style={styles.totalTexto}>
          Total gasto: {monto(totalGastado)}
        </Text>
        <Text style={styles.totalTexto}>
          Pagado: {monto(totalPagado)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#e3f2fd",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titulo: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalGrupo: {
    fontSize: 14,
    color: "#555",
    marginTop: 8,
  },
  monto: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginVertical: 6,
  },
  barraProgreso: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#cfd8dc",
  },
  filaTotales: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  totalTexto: {
    fontSize: 14,
    color: "#444",
  },
});

export default ResumenGrupo;

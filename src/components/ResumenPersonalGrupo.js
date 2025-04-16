import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { monto } from "../utils/format";

const ResumenPersonalGrupo = ({ totalAdeudadoUsuario = 0, detallesDeuda = [] }) => {

    const sinDeudas = parseInt(totalAdeudadoUsuario) === 0;

  return (
    <View style={styles.card}>
      {/* Ícono billetera en la esquina */}
      <Ionicons
        name="wallet-outline"
        size={22}
        color="#2a5298"
        style={styles.walletIcon}
      />

      {sinDeudas ? (
        <>
          <Text style={styles.tituloPositivo}>🎉 ¡Estás al día en este grupo!</Text>
          <Text style={styles.subtexto}>No tienes deudas pendientes, sigue así 💪</Text>
        </>
      ) : (
        <>
          <Text style={styles.tituloNegativo}>💰 Debes {monto(totalAdeudadoUsuario)}</Text>
          <Text style={styles.subtitulo}>Detalle de tus deudas:</Text>
          {detallesDeuda.map((d, idx) => (
            <Text key={idx} style={styles.detalleItem}>
              🔸 A {d.a_quien}: {monto(d.monto)}
            </Text>
          ))}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F0F4FF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    position: "relative",
  },
  walletIcon: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  tituloPositivo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 4,
  },
  tituloNegativo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e53935",
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginTop: 6,
    marginBottom: 4,
  },
  subtexto: {
    fontSize: 14,
    color: "#333",
  },
  detalleItem: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
  },
});

export default ResumenPersonalGrupo;

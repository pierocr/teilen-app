import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function BalanceCard({ balance, totalAFavor, totalAdeudado }) {
  const formatear = (num) =>
    new Intl.NumberFormat("es-CL", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(num);

  let balanceLabel = "";
  if (balance > 0) {
    balanceLabel = `Te deben $${formatear(balance)}`;
  } else if (balance < 0) {
    balanceLabel = `Debes $${formatear(Math.abs(balance))}`;
  } else {
    balanceLabel = "Estás en cero, ¡felicidades!";
  }

  return (
    <LinearGradient colors={["#1e3c72", "#2a5298"]} style={styles.card}>
      <Text style={styles.balanceText}>{balanceLabel}</Text>
      <Text style={styles.secondaryText}>
        A favor: ${formatear(totalAFavor)} | Adeudado: ${formatear(totalAdeudado)}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 6,
  },
  secondaryText: {
    fontSize: 15,
    color: "#e0e0e0",
  },
});

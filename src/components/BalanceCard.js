import React from "react";
import { View, Text, StyleSheet, TouchableOpacity} from "react-native";
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
    
    <LinearGradient colors={["#2a8873", "#1b6db2"]} style={styles.card}>
      <Text style={styles.balanceText}>{balanceLabel}</Text>
      <Text style={styles.secondaryText}>
        A favor: ${formatear(totalAFavor)} | Adeudado: ${formatear(totalAdeudado)}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 10, // menos espacio para el botón de grupo
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  balanceText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  secondaryText: {
    fontSize: 16,
    color: "white",
  },  
});

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MCIcon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Progress from "react-native-progress";

export default function BalanceCard({ totalAdeudado, totalPagado, cantidadGrupos }) {
  const formatear = (num) =>
    new Intl.NumberFormat("es-CL", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(num);

  const progresoPago = totalAdeudado > 0 ? Math.min(totalPagado / totalAdeudado, 1) : 1;

  const getBarColor = () => {
    if (progresoPago < 0.3) return "#e53935"; // rojo
    if (progresoPago < 0.7) return "#ff9800"; // naranjo
    return "#4CAF50"; // verde
  };

  const balanceLabel =
    totalAdeudado === 0
      ? "Estás al día 🎉"
      : `Debes $${formatear(totalAdeudado - totalPagado)}`;

  return (
    <LinearGradient colors={["#2a8873", "#1b6db2"]} style={styles.card}>
      <MCIcon name="wallet-outline" size={30} color="white" style={styles.iconWallet} />

      <Text style={styles.balanceText}>{balanceLabel}</Text>

      <Text style={styles.secondaryText}>
        Has pagado ${formatear(totalPagado)} en {cantidadGrupos} grupo{cantidadGrupos !== 1 ? "s" : ""}
      </Text>

      <View style={styles.progressContainer}>
        <Progress.Bar
          progress={progresoPago}
          width={null}
          height={10}
          borderRadius={8}
          color={getBarColor()}
          unfilledColor="#E0E0E0"
          borderWidth={0}
        />
        <View style={styles.rangeContainer}>
          <Text style={styles.rangeText}>$0</Text>
          <Text style={styles.rangeText}>${formatear(totalAdeudado)}</Text>
        </View>
        <Text style={styles.progressTexto}>
          {Math.round(progresoPago * 100)}% del total saldado
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    position: "relative",
  },
  balanceText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  secondaryText: {
    fontSize: 16,
    color: "white",
    marginBottom: 12,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressTexto: {
    marginTop: 6,
    color: "white",
    fontSize: 14,
    textAlign: "center",
  },
  rangeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  rangeText: {
    color: "white",
    fontSize: 12,
  },
  iconWallet: {
    position: "absolute",
    top: 12,
    right: 12,
  },
});

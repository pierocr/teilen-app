import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as format from "../utils/format";

const GastoItem = ({
  id,
  descripcion,
  monto,
  imagen,
  fecha,
  pagado_por,
  relacion_usuario,
  monto_usuario,
}) => {
  const navigation = useNavigation();

  const color =
    relacion_usuario === "a_favor"
      ? "green"
      : relacion_usuario === "debes"
      ? "red"
      : "#999";

  const label =
    relacion_usuario === "a_favor"
      ? `Prestaste ${format.monto(monto_usuario)}`
      : relacion_usuario === "debes"
      ? `Debes ${format.monto(monto_usuario)}`
      : "Sin participación";

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("GastoDetalle", { gastoId: id })}
    >
      <View style={styles.container}>
        {/* Fecha */}
        <Text style={styles.fecha}>{format.fecha(fecha)}</Text>

        {/* Imagen */}
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{imagen || "🧾"}</Text>
        </View>

        {/* Descripción y pagador */}
        <View style={styles.descripcionContainer}>
          <Text style={styles.descripcion}>{descripcion}</Text>
          <Text style={styles.pagadoPor}>
            Pagado por {pagado_por?.nombre || "Desconocido"}
          </Text>
        </View>

        {/* Deuda o monto */}
        <View style={styles.montoContainer}>
          <Text style={[styles.label, { color }]}>{label}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginVertical: 6,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    elevation: 1,
  },
  fecha: {
    width: 60,
    fontSize: 12,
    color: "#999",
  },
  emojiContainer: {
    width: 40,
    alignItems: "center",
    marginRight: 8,
  },
  emoji: {
    fontSize: 24,
  },
  descripcionContainer: {
    flex: 1,
    justifyContent: "center",
  },
  descripcion: {
    fontWeight: "bold",
    fontSize: 15,
  },
  pagadoPor: {
    fontSize: 12,
    color: "#777",
  },
  montoContainer: {
    width: 100,
    alignItems: "flex-end",
  },
  label: {
    fontWeight: "bold",
    fontSize: 13,
  },
});

export default GastoItem;

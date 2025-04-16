import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as format from "../utils/format";
import Ionicons from "react-native-vector-icons/Ionicons";

const GastoItem = ({
  id,
  descripcion,
  monto,
  imagen,
  icono, // Nueva propiedad
  recurrente, // Agregamos la propiedad recurrente
  fecha,
  pagado_por,
  relacion_usuario,
  monto_usuario,
}) => {
  const navigation = useNavigation();

  // Si se definió icono, lo usamos; de lo contrario, se usa la lógica anterior
  const iconName =
    icono || (imagen ? "document-text-outline" : "receipt-outline");

  // Etiqueta dinámica
  const label =
    relacion_usuario === "a_favor"
      ? `Prestaste ${format.monto(monto_usuario)}`
      : relacion_usuario === "debes"
      ? `Debes ${format.monto(monto_usuario)}`
      : "Sin participación";

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("GastoDetalle", { gastoId: id })}
      activeOpacity={0.9}
    >
      <View style={gastoStyles.container}>
        <Text style={gastoStyles.fecha}>{format.fecha(fecha)}</Text>

        <View style={gastoStyles.iconContainer}>
          <Ionicons name={iconName} size={26} color="#2a5298" />
          {recurrente && (
            <Ionicons
              name="repeat-outline"
              size={16}
              color="#F44336"
              style={{ position: "absolute", top: 0, right: 0 }}
            />
          )}
        </View>

        <View style={gastoStyles.descriptionContainer}>
          <Text style={gastoStyles.descripcion}>{descripcion}</Text>
          <Text style={gastoStyles.pagadoPor}>
            Pagado por {pagado_por?.nombre || "Desconocido"}
          </Text>
        </View>

        <View style={gastoStyles.montoContainer}>
          <Text
            style={[
              gastoStyles.label,
              {
                color:
                  relacion_usuario === "a_favor"
                    ? "#4CAF50"
                    : relacion_usuario === "debes"
                    ? "#F44336"
                    : "#999",
              },
            ]}
          >
            {label}
          </Text>
          <Text style={gastoStyles.montoTotal}>
            Total: {format.monto(monto)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const gastoStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginVertical: 6,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  fecha: {
    width: 60,
    fontSize: 12,
    color: "#999",
  },
  iconContainer: {
    width: 40,
    alignItems: "center",
    marginRight: 8,
  },
  descriptionContainer: {
    flex: 1,
  },
  descripcion: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  pagadoPor: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
  montoContainer: {
    width: 100,
    alignItems: "flex-end",
  },
  label: {
    fontWeight: "bold",
    fontSize: 13,
  },
  montoTotal: {
    fontSize: 12,
    color: "#444",
    marginTop: 4,
  },
});

export default GastoItem;

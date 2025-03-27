import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const CrearGastoScreen = ({ route, navigation }) => {
  const { grupoId, grupoNombre, participantes = [] } = route.params;

  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [pagadoPor, setPagadoPor] = useState(null);
  const [distribucion, setDistribucion] = useState("igual");
  const [montosPersonalizados, setMontosPersonalizados] = useState({});
  const [porcentajes, setPorcentajes] = useState({});

  const handleGuardar = async () => {
    if (!descripcion || !monto || !pagadoPor) {
      return Alert.alert("Campos requeridos", "Completa todos los campos obligatorios");
    }

    const montoLimpio = parseInt(monto.replace(/\./g, ""), 10);

    if (isNaN(montoLimpio) || montoLimpio <= 0) {
      return Alert.alert("Monto inválido", "Ingresa un monto válido mayor a cero.");
    }

    try {
      const token = await AsyncStorage.getItem("token");

      const payload = {
        id_grupo: grupoId,
        descripcion,
        monto: montoLimpio,
        pagado_por: pagadoPor,
        id_usuarios: participantes.map((u) => u.id),
        imagen: "🧾",
        categoria_id: 8,
      };

      if (distribucion === "personalizado") {
        const montosNumericos = Object.values(montosPersonalizados).map((m) =>
          parseInt(m.replace(/\./g, ""), 10)
        );

        const sumaMontos = montosNumericos.reduce((acc, val) => acc + val, 0);

        if (sumaMontos !== montoLimpio) {
          return Alert.alert(
            "❌ Montos personalizados inválidos",
            `La suma (${sumaMontos.toLocaleString()}) no coincide con el monto total (${montoLimpio.toLocaleString()})`
          );
        }

        payload.montos_personalizados = Object.fromEntries(
          Object.entries(montosPersonalizados).map(([id, valor]) => [
            id,
            parseInt(valor.replace(/\./g, ""), 10),
          ])
        );
      }

      if (distribucion === "porcentaje") {
        const porcentajeNumerico = Object.values(porcentajes).map((p) => parseInt(p, 10) || 0);
        const suma = porcentajeNumerico.reduce((acc, val) => acc + val, 0);

        if (suma !== 100) {
          return Alert.alert(
            "❌ Porcentajes inválidos",
            `La suma total debe ser 100%. Actualmente suma ${suma}%.`
          );
        }

        payload.montos_porcentuales = Object.fromEntries(
          Object.entries(porcentajes).map(([id, porcentaje]) => [
            id,
            Math.round((parseInt(porcentaje, 10) / 100) * montoLimpio),
          ])
        );
      }

      await axios.post("http://localhost:5001/gastos", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("Éxito", "Gasto creado correctamente");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", error.response?.data?.error || error.message);
    }
  };

  const handleCambioMonto = (text) => {
    const soloNumeros = text.replace(/[^0-9]/g, "");
    const conFormato = soloNumeros.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setMonto(conFormato);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Descripción</Text>
      <TextInput
        placeholder="Ej: Cena, Regalo"
        value={descripcion}
        onChangeText={setDescripcion}
        style={styles.input}
      />

      <Text style={styles.label}>Monto total</Text>
      <TextInput
        placeholder="$0"
        value={monto ? `$${monto}` : ""}
        onChangeText={handleCambioMonto}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>¿Quién pagó?</Text>
      {participantes.map((u) => (
        <TouchableOpacity
          key={u.id}
          style={[styles.radioOption, pagadoPor === u.id && styles.radioOptionSelected]}
          onPress={() => setPagadoPor(u.id)}
        >
          <Text>{u.nombre}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.label}>¿Cómo dividir el gasto?</Text>
      <View style={styles.radioRow}>
        <TouchableOpacity
          style={[styles.radioOption, distribucion === "igual" && styles.radioOptionSelected]}
          onPress={() => setDistribucion("igual")}
        >
          <Text>Iguales</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.radioOption, distribucion === "personalizado" && styles.radioOptionSelected]}
          onPress={() => setDistribucion("personalizado")}
        >
          <Text>Personalizado</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.radioOption, distribucion === "porcentaje" && styles.radioOptionSelected]}
          onPress={() => setDistribucion("porcentaje")}
        >
          <Text>Porcentaje</Text>
        </TouchableOpacity>
      </View>

      {distribucion === "personalizado" && (
        <View>
          {participantes.map((u) => (
            <View key={u.id} style={styles.montoPersonalizadoRow}>
              <Text style={styles.nombreUsuario}>{u.nombre}</Text>
              <TextInput
                placeholder="$0"
                keyboardType="numeric"
                style={[styles.input, { flex: 1 }]}
                value={montosPersonalizados[u.id] ? `$${montosPersonalizados[u.id]}` : ""}
                onChangeText={(text) => {
                  const soloNumeros = text.replace(/[^0-9]/g, "");
                  const conFormato = soloNumeros.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                  setMontosPersonalizados({
                    ...montosPersonalizados,
                    [u.id]: conFormato,
                  });
                }}
              />
            </View>
          ))}
        </View>
      )}

      {distribucion === "porcentaje" && (
        <View>
          {participantes.map((u) => (
            <View key={u.id} style={styles.montoPersonalizadoRow}>
              <Text style={styles.nombreUsuario}>{u.nombre}</Text>
              <TextInput
                placeholder="%"
                keyboardType="numeric"
                style={[styles.input, { flex: 1 }]}
                value={porcentajes[u.id]?.toString() || ""}
                onChangeText={(text) => {
                  const soloNumeros = text.replace(/[^0-9]/g, "");
                  setPorcentajes({
                    ...porcentajes,
                    [u.id]: soloNumeros,
                  });
                }}
              />
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.botonGuardar} onPress={handleGuardar}>
        <Text style={styles.textoGuardar}>Guardar gasto</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    marginBottom: 8,
  },
  radioOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  radioOptionSelected: {
    backgroundColor: "#cde2ff",
    borderColor: "#3a7",
  },
  radioRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 10,
  },
  montoPersonalizadoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  nombreUsuario: {
    width: 100,
  },
  botonGuardar: {
    backgroundColor: "#2a5298",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  textoGuardar: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default CrearGastoScreen;
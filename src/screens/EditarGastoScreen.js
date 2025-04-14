import React, { useEffect, useState } from "react";
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
import API_URL from "../config";
import { monto as formatearMonto } from "../utils/format";

const EditarGastoScreen = ({ route, navigation }) => {
  const { gastoId, grupoId: grupoIdInicial, grupoNombre, participantes = [] } = route.params;

  // Estados
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState(""); // Cadena, ej. "23.650"
  const [pagadoPor, setPagadoPor] = useState(null);
  const [distribucion, setDistribucion] = useState("igual"); // "igual" | "personalizado" | "porcentaje"
  const [montosPersonalizados, setMontosPersonalizados] = useState({});
  const [porcentajes, setPorcentajes] = useState({});
  const [grupoId, setGrupoId] = useState(grupoIdInicial);

  useEffect(() => {
    obtenerDetalleGasto();
  }, []);

  const obtenerDetalleGasto = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${API_URL}/gastos/${gastoId}/detalle`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data;

      // 1. Descripción
      setDescripcion(data.descripcion);

      // 2. Monto sin decimales ni símbolo $, luego formateado para el TextInput
      const montoLimpio = Math.floor(data.monto); // elimina decimales
      // Ojo, formatearMonto("150000") => "$150.000", eliminemos el "$"
      const soloNumeros = montoLimpio.toString().replace(/[^0-9]/g, "");
      // Transformamos en "23.650"
      const conFormato = soloNumeros.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      setMonto(conFormato);

      // 3. Quién pagó y grupo
      setPagadoPor(data.pagado_por.id);
      setGrupoId(data.id_grupo);

      // 4. Lógica para ver si son todos iguales
      // Dejamos todos (incl. el pagador) para personalizar
      const deudasUsuarios = data.deudas;
      // Redondeamos por si vienen decimales
      const montosNum = deudasUsuarios.map((d) => Math.floor(d.monto));
      const todosIguales = montosNum.every((m) => m === montosNum[0]);

      if (todosIguales) {
        setDistribucion("igual");
      } else {
        setDistribucion("personalizado");

        // Prellenamos montosPersonalizados
        const personalizados = {};
        deudasUsuarios.forEach((d) => {
          // Eliminamos decimales => Math.floor
          const mLimpio = Math.floor(d.monto); 
          // Convertimos a string con puntos de miles
          const sLimpio = mLimpio
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
          personalizados[d.id_usuario] = sLimpio; 
        });
        setMontosPersonalizados(personalizados);
      }
    } catch (error) {
      Alert.alert("Error al obtener gasto", error.response?.data?.error || error.message);
      navigation.goBack();
    }
  };

  // Manejar la edición manual del monto total
  const handleCambioMonto = (text) => {
    // Deja solo dígitos
    const soloNumeros = text.replace(/[^0-9]/g, "");
    // Formatea con puntos
    const conFormato = soloNumeros.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setMonto(conFormato);
  };

  // Guardar cambios
  const handleActualizarGasto = async () => {
    // Limpia los puntos "." para convertir a número
    const montoLimpio = parseInt(monto.replace(/\./g, ""), 10);

    // Validaciones principales
    if (!descripcion || !monto || !pagadoPor) {
      let faltantes = [];
      if (!descripcion) faltantes.push("descripción");
      if (!monto) faltantes.push("monto");
      if (!pagadoPor) faltantes.push("quién pagó");
      return Alert.alert("Campos requeridos", `Te falta completar: ${faltantes.join(", ")}`);
    }
    if (isNaN(montoLimpio) || montoLimpio <= 0) {
      return Alert.alert("Monto inválido", "Ingresa un monto válido mayor a cero.");
    }

    // Armamos el payload
    const id_usuarios = participantes.map((u) => u.id);
    const payload = {
      id_grupo: grupoId,
      descripcion,
      monto: montoLimpio,
      pagado_por: pagadoPor,
      id_usuarios,
      imagen: "🧾",
      categoria_id: 8,
    };

    // Manejo de "personalizado"
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
        Object.entries(montosPersonalizados).map(([id, valor]) => {
          const valLimpio = parseInt(valor.replace(/\./g, ""), 10);
          return [id, valLimpio];
        })
      );
    }

    // Manejo de "porcentaje"
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
        Object.entries(porcentajes).map(([id, porcentaje]) => {
          const px = parseInt(porcentaje, 10);
          const montoCalculado = Math.round((px / 100) * montoLimpio);
          return [id, montoCalculado];
        })
      );
    }

    console.log("📤 Payload final:", payload);

    // Enviamos al backend
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.put(`${API_URL}/gastos/${gastoId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("Éxito", "Gasto editado correctamente");
      navigation.goBack();
    } catch (error) {
      console.log("❌ Error al editar gasto:", error.response?.data || error.message);
      Alert.alert(
        "Error al editar gasto",
        error.response?.data?.error || error.message
      );
    }
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
        value={monto}
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
          {participantes.map((u) => {
            const valor = montosPersonalizados[u.id] || "";
            return (
              <View key={u.id} style={styles.montoPersonalizadoRow}>
                <Text style={styles.nombreUsuario}>{u.nombre}</Text>
                <TextInput
                  placeholder="$0"
                  keyboardType="numeric"
                  style={[styles.input, { flex: 1 }]}
                  value={valor ? `$${valor}` : ""}
                  onChangeText={(text) => {
                    const soloNumeros = text.replace(/[^0-9]/g, "");
                    const conFormato = soloNumeros.replace(
                      /\B(?=(\d{3})+(?!\d))/g,
                      "."
                    );
                    setMontosPersonalizados({
                      ...montosPersonalizados,
                      [u.id]: conFormato,
                    });
                  }}
                />
              </View>
            );
          })}
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

      <TouchableOpacity style={styles.botonGuardar} onPress={handleActualizarGasto}>
        <Text style={styles.textoGuardar}>Guardar cambios</Text>
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

export default EditarGastoScreen;

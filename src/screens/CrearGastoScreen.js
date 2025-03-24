import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation, useRoute } from "@react-navigation/native";

const CrearGastoScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { grupoId, grupoNombre, participantes } = route.params;

  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [pagadoPor, setPagadoPor] = useState(null);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [distribucion, setDistribucion] = useState("igual"); // igual | personalizado | porcentaje
  const [montosPersonalizados, setMontosPersonalizados] = useState({});

  useEffect(() => {
    const cargarUsuario = async () => {
      const storedUser = await AsyncStorage.getItem("usuario");
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        setUsuarioActual(userObj);
        setPagadoPor(userObj.id);
      }
    };
    cargarUsuario();
  }, []);

  const handleGuardar = async () => {
    if (!descripcion || !monto || !pagadoPor) {
      return Alert.alert("Campos requeridos", "Completa todos los campos obligatorios");
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const payload = {
        id_grupo: grupoId,
        descripcion,
        monto: Number(monto),
        pagado_por: pagadoPor,
        id_usuarios: participantes.map((u) => u.id),
        imagen: "🧾",
        categoria_id: 8,
      };

      if (distribucion === "personalizado") {
        payload.montos_personalizados = montosPersonalizados;
      }

      const res = await axios.post("http://localhost:5001/gastos", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("Éxito", "Gasto creado correctamente");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", error.response?.data?.error || error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Añadir gasto a "{grupoNombre}"</Text>

      <TextInput
        placeholder="Descripción del gasto"
        value={descripcion}
        onChangeText={setDescripcion}
        style={styles.input}
      />

      <TextInput
        placeholder="Monto total"
        value={monto}
        onChangeText={setMonto}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.subtitle}>¿Quién pagó?</Text>
      {participantes.map((u) => (
        <TouchableOpacity
          key={u.id}
          style={styles.radioOption}
          onPress={() => setPagadoPor(u.id)}
        >
          <Ionicons
            name={pagadoPor === u.id ? "radio-button-on" : "radio-button-off"}
            size={20}
            color="#2a5298"
          />
          <Text style={styles.radioText}>{u.nombre}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.subtitle}>Dividir gasto</Text>
      <View style={styles.radioGroup}>
        <TouchableOpacity onPress={() => setDistribucion("igual")}>
          <Text style={distribucion === "igual" ? styles.activeOption : styles.option}>
            Partes iguales
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setDistribucion("personalizado")}>
          <Text style={distribucion === "personalizado" ? styles.activeOption : styles.option}>
            Montos personalizados
          </Text>
        </TouchableOpacity>
      </View>

      {distribucion === "personalizado" && (
        <View>
          {participantes.map((u) => (
            <View key={u.id} style={styles.montoPersonalizado}>
              <Text>{u.nombre}:</Text>
              <TextInput
                keyboardType="numeric"
                placeholder="$0"
                style={styles.inputPequeño}
                onChangeText={(val) =>
                  setMontosPersonalizados((prev) => ({ ...prev, [u.id]: Number(val) }))
                }
              />
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.botonGuardar} onPress={handleGuardar}>
        <Text style={styles.botonGuardarTexto}>Guardar gasto</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  radioText: {
    marginLeft: 8,
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  option: {
    color: "#888",
  },
  activeOption: {
    fontWeight: "bold",
    color: "#2a5298",
    textDecorationLine: "underline",
  },
  montoPersonalizado: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  inputPequeño: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 5,
    width: 80,
    marginLeft: 8,
  },
  botonGuardar: {
    backgroundColor: "#2a5298",
    padding: 12,
    marginTop: 30,
    borderRadius: 8,
    alignItems: "center",
  },
  botonGuardarTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default CrearGastoScreen;
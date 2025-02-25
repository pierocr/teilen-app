// AgregarGastoScreen.js
import React, { useState, useContext, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  StyleSheet, 
  Alert 
} from "react-native";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import API_URL from "../config";

export default function AgregarGastoScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  // Campos del formulario
  const [detalle, setDetalle] = useState("");
  const [monto, setMonto] = useState("");
  const [pagadoPor, setPagadoPor] = useState(user?.id?.toString() || "");
  const [grupoId, setGrupoId] = useState("");

  // Si deseas cargar la lista de grupos del usuario para que elija uno:
  // const [misGrupos, setMisGrupos] = useState([]);
  // useEffect(() => {
  //   cargarGrupos();
  // }, []);
  // const cargarGrupos = async () => {
  //   const resp = await axios.get(`${API_URL}/grupos`, {
  //     headers: { Authorization: `Bearer ${user.token}` },
  //   });
  //   setMisGrupos(resp.data);
  // };

  const handleGuardar = async () => {
    console.log("📢 Datos enviados al backend:", {
        descripcion,
        monto,
        pagado_por,
        id_grupo,
        categoria,
        id_usuarios,
      });
    if (!detalle || !monto || !pagadoPor || !grupoId) {
      Alert.alert("Campos incompletos", "Todos los campos son obligatorios");
      return;
    }

    try {
      // Aquí suponiendo que tendrás un endpoint POST /gastos
      // en tu backend, que reciba { descripcion, monto, pagado_por, id_grupo }.
      await axios.post(
        `${API_URL}/gastos`, 
        {
          descripcion: detalle,
          monto: parseFloat(monto),
          pagado_por: parseInt(pagadoPor),
          id_grupo: parseInt(grupoId),
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      Alert.alert("Éxito", "Gasto agregado correctamente");
      navigation.goBack(); // regresar a la pantalla anterior
    } catch (error) {
      console.error("Error al agregar gasto:", error);
      Alert.alert("Error", "No se pudo agregar el gasto");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Detalle</Text>
      <TextInput
        style={styles.input}
        value={detalle}
        onChangeText={setDetalle}
        placeholder="Ej: Cena, Taxi, etc."
      />

      <Text style={styles.label}>Monto</Text>
      <TextInput
        style={styles.input}
        value={monto}
        onChangeText={setMonto}
        keyboardType="numeric"
        placeholder="0.00"
      />

      <Text style={styles.label}>¿Quién pagó? (ID de Usuario)</Text>
      <TextInput
        style={styles.input}
        value={pagadoPor}
        onChangeText={setPagadoPor}
        keyboardType="numeric"
      />

      <Text style={styles.label}>ID del Grupo</Text>
      <TextInput
        style={styles.input}
        value={grupoId}
        onChangeText={setGrupoId}
        keyboardType="numeric"
      />

      <Button title="Guardar Gasto" onPress={handleGuardar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    marginTop: 10,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    marginTop: 5,
  },
});

import React, { useContext, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { AuthContext } from "../context/AuthContext";

export default function CodigoQRScreen({ navigation }) {
    const { user } = useContext(AuthContext);
  
    useEffect(() => {
      navigation.setOptions({
        headerBackTitleVisible: false,
      });
    }, [navigation]);


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tu código QR</Text>

      <View style={styles.qrBox}>
        <QRCode
          value={user.id.toString()} // o tu identificador único
          size={200}
        />
      </View>

      <Text style={styles.text}>
        Comparte este código con tus amigos para que te agreguen en Teilen.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  qrBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  text: {
    marginTop: 20,
    fontSize: 14,
    textAlign: "center",
    color: "#555",
  },
});

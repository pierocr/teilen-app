// AmigosScreen.js
import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Linking, // <-- Importamos Linking para abrir WhatsApp
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import API_URL from "../config";

export default function AmigosScreen() {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();

  const [amigos, setAmigos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estado para la búsqueda en tiempo real
  const [busqueda, setBusqueda] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Cargar la lista de amigos existentes
  // ─────────────────────────────────────────────────────────────────────────────
  const obtenerAmigos = async () => {
    try {
      setLoading(true);
      const resp = await fetch(`${API_URL}/amigos`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await resp.json();
      setAmigos(data);
    } catch (error) {
      console.error("Error al obtener amigos:", error);
      Alert.alert("Error", "No se pudieron cargar los amigos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerAmigos();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // Pull-to-refresh
  // ─────────────────────────────────────────────────────────────────────────────
  const onRefresh = async () => {
    setRefreshing(true);
    await obtenerAmigos();
    setRefreshing(false);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Buscar usuarios en la BD conforme se escribe en el TextInput
  // ─────────────────────────────────────────────────────────────────────────────
  const buscarUsuarios = async (texto) => {
    setBusqueda(texto);

    if (!texto) {
      setResultadosBusqueda([]);
      return;
    }

    try {
      // GET /usuarios/buscar?q=texto
      const resp = await fetch(`${API_URL}/usuarios/buscar?q=${texto}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await resp.json();
      setResultadosBusqueda(data); // array de {id, nombre, correo, imagen_perfil}
    } catch (error) {
      console.error("Error buscando usuarios:", error);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Agregar el usuario seleccionado a la tabla amigos
  // ─────────────────────────────────────────────────────────────────────────────
  const agregarAmigo = async (usuario) => {
    try {
      // Cambiamos a { amigo_id: usuario.id } porque el backend espera "amigo_id"
      const resp = await fetch(`${API_URL}/amigos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ amigo_id: usuario.id }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        Alert.alert("Error", data.mensaje || "No se pudo agregar el amigo.");
        return;
      }

      Alert.alert("Éxito", `Amigo ${usuario.nombre} agregado correctamente.`);
      // Limpia el cuadro de búsqueda y la lista de resultados
      setBusqueda("");
      setResultadosBusqueda([]);
      // Refresca tu lista de amigos
      obtenerAmigos();
    } catch (error) {
      console.error("Error al agregar amigo:", error);
      Alert.alert("Error", "No se pudo agregar el amigo.");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Eliminar amigo
  // ─────────────────────────────────────────────────────────────────────────────
  const eliminarAmigo = async (idAmigo) => {
    Alert.alert(
      "Eliminar Amigo",
      "¿Estás seguro de que quieres eliminar a este amigo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const resp = await fetch(`${API_URL}/amigos/${idAmigo}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${user.token}` },
              });

              if (!resp.ok) {
                Alert.alert("Error", "No se pudo eliminar el amigo.");
                return;
              }

              Alert.alert("Eliminado", "Amigo eliminado correctamente.");
              obtenerAmigos();
            } catch (error) {
              console.error("Error al eliminar amigo:", error);
              Alert.alert("Error", "No se pudo eliminar el amigo.");
            }
          },
        },
      ]
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Render para cada amigo que ya tengo en mi lista
  // ─────────────────────────────────────────────────────────────────────────────
  const renderAmigo = ({ item }) => (
    <TouchableOpacity
      style={styles.amigoItem}
      onPress={() => navigation.navigate("AmigoDetalle", { amigoId: item.id })}
    >
      <Image
        source={{
          uri:
            item.imagen_perfil ||
            "https://cdn-icons-png.flaticon.com/512/847/847969.png",
        }}
        style={styles.avatar}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.nombre}>{item.nombre}</Text>
        <Text style={styles.correo}>{item.correo}</Text>
      </View>
      <TouchableOpacity
        style={styles.btnEliminar}
        onPress={() => eliminarAmigo(item.id)}
      >
        <Text style={styles.eliminarTexto}>Eliminar</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Render para cada resultado de la búsqueda (usuarios no amigos)
  // ─────────────────────────────────────────────────────────────────────────────
  const renderResultado = ({ item }) => (
    <View style={styles.resultadoItem}>
      <Image
        source={{
          uri:
            item.imagen_perfil ||
            "https://cdn-icons-png.flaticon.com/512/847/847969.png",
        }}
        style={styles.avatarResultado}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.nombre}>{item.nombre}</Text>
        <Text style={styles.correo}>{item.correo}</Text>
      </View>
      <TouchableOpacity
        style={styles.btnAgregar}
        onPress={() => agregarAmigo(item)}
      >
        <Text style={styles.btnAgregarTexto}>Agregar</Text>
      </TouchableOpacity>
    </View>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Si no hay resultados, ofrecer botón para invitar por WhatsApp
  // ─────────────────────────────────────────────────────────────────────────────
  const renderNoResultados = () => {
    if (!busqueda) return null; // Si está vacío el buscador, no mostramos nada

    return (
      <View style={styles.noResultadosContainer}>
        <Text style={styles.noResultadosText}>
          No se encontraron usuarios con "{busqueda}"
        </Text>
        <TouchableOpacity
          style={styles.btnWhatsApp}
          onPress={() => {
            // Texto que mandamos por WhatsApp
            const mensaje = encodeURIComponent(
              `¡Hola! Te invito a unirte a Teilen, la app de gastos compartidos. ` +
              `Haz clic aquí para unirte: ${enlace}`
            );
            const whatsappUrl = `whatsapp://send?text=${mensaje}`;
            Linking.openURL(whatsappUrl);            
            Linking.openURL(whatsappUrl).catch(() => {
              Alert.alert(
                "Error",
                "No se pudo abrir WhatsApp. ¿Lo tienes instalado?"
              );
            });
          }}
        >
          <Text style={styles.btnWhatsAppText}>Invitar por WhatsApp</Text>
        </TouchableOpacity>
      </View>
    );
  };
  // ─────────────────────────────────────────────────────────────────────────────
  // Ofrecer botón para invitar por WhatsApp
  // ─────────────────────────────────────────────────────────────────────────────
  const invitarPorWhatsApp = () => {
    // Sustituyes este dominio por el que realmente usarás
    const enlace = `https://teilen-backend.onrender.com/invite?ref=${user.id}`;
    // Mensaje codificado
    const mensaje = encodeURIComponent(
      `¡Hola! Te invito a unirte a Teilen, nuestra app de gastos compartidos. Regístrate aquí: ${enlace}`
    );
    const whatsappUrl = `whatsapp://send?text=${mensaje}`;
  
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert(
        "Error",
        "No se pudo abrir WhatsApp. ¿Lo tienes instalado?"
      );
    });
  };  

  // ─────────────────────────────────────────────────────────────────────────────
  // Render principal
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Text style={styles.title}>Amigos</Text>

      {/* 1. Búsqueda/autocomplete de usuarios */}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar usuarios por nombre o correo"
        value={busqueda}
        onChangeText={buscarUsuarios} // Llama a la función que hace GET /usuarios/buscar
      />

      {/* Resultados */}
      {resultadosBusqueda.length > 0 ? (
        <FlatList
          data={resultadosBusqueda}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderResultado}
          style={styles.listaResultados}
        />
      ) : (
        // Si NO hay resultados, y hay algo escrito en "busqueda", mostramos invitación
        renderNoResultados()
      )}

      {/* 2. Lista de amigos */}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : amigos.length === 0 ? (
        <Text style={{ marginTop: 20 }}>No tienes amigos aún.</Text>
      ) : (
        <>
          <Text style={styles.subTitle}>Tu lista de amigos:</Text>
          <FlatList
            data={amigos}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={renderAmigo}
          />
        </>
      )}
          {/* Botón de invitación por WhatsApp, para que siempre aparezca */}
    <TouchableOpacity
      style={styles.btnWhatsApp}
      onPress={invitarPorWhatsApp}
    >
      <Text style={styles.btnWhatsAppText}>Invitar por WhatsApp</Text>
    </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff"},
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  subTitle: { fontSize: 18, fontWeight: "600", marginVertical: 8 },
  searchInput: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  listaResultados: {
    maxHeight: 200, // Para que la lista no ocupe toda la pantalla
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  resultadoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatarResultado: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  btnAgregar: {
    backgroundColor: "#007AFF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  btnAgregarTexto: {
    color: "#fff",
    fontWeight: "bold",
  },

  // Amigos
  amigoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  nombre: {
    fontSize: 16,
    fontWeight: "600",
  },
  correo: {
    fontSize: 14,
    color: "#555",
  },
  btnEliminar: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  eliminarTexto: {
    color: "#fff",
    fontWeight: "bold",
  },

  // Invitación por WhatsApp
  noResultadosContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  noResultadosText: {
    marginBottom: 8,
    fontSize: 16,
    color: "#333",
  },
  btnWhatsApp: {
    backgroundColor: "#25D366",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  btnWhatsAppText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { monto } from "../utils/format";
import { Menu, MenuOptions, MenuOption, MenuTrigger } from "react-native-popup-menu";
import MCIcon from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";

const GrupoItem = ({ grupo, onPress, onEditar, onEliminar }) => {
  const { id, nombre, imagen, total_gastado, total_adeudado, total_pagado } = grupo;

  return (
    <TouchableOpacity style={styles.itemContainer} onPress={() => onPress(id, nombre)}>
      <View style={styles.innerContainer}>
        {/* Avatar del grupo */}
        <Image
          source={
            imagen && imagen !== "default"
              ? { uri: imagen }
              : require("../assets/image.png")
          }
          style={styles.avatar}
        />
        
        {/* Información textual */}
        <View style={styles.textContainer}>
          <Text style={styles.nombre}>{nombre}</Text>
          <Text style={styles.totales}>
            Total: {monto(total_gastado)} | Debes: {monto(total_adeudado)}
          </Text>
          <Text style={styles.totales}>
            Te deben: {monto(total_pagado)}
          </Text>
        </View>

        {/* Menú y chevron */}
        <View style={styles.menuContainer}>
          <Menu>
            <MenuTrigger>
              <MCIcon name="dots-vertical" size={24} color="#666" />
            </MenuTrigger>
            <MenuOptions customStyles={menuStyles}>
              <MenuOption onSelect={() => onEditar(grupo)}>
                <View style={styles.menuItem}>
                  <MCIcon name="pencil-outline" size={20} color="#2a5298" style={{ marginRight: 8 }} />
                  <Text style={styles.menuText}>Editar</Text>
                </View>
              </MenuOption>
              <MenuOption onSelect={() => onEliminar(id)}>
                <View style={styles.menuItem}>
                  <MCIcon name="trash-can-outline" size={20} color="#F44336" style={{ marginRight: 8 }} />
                  <Text style={styles.menuText}>Eliminar</Text>
                </View>
              </MenuOption>
            </MenuOptions>
          </Menu>
          <Ionicons name="chevron-forward-outline" size={20} color="#ccc" style={styles.chevron} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: "#fff", // fondo blanco para el item
    borderRadius: 10,
    marginVertical: 6,
    marginHorizontal: 2,
    padding: 12,
    // Sombras para iOS y Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  nombre: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  totales: {
    fontSize: 13,
    color: "#666",
  },
  menuContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  chevron: {
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  menuText: {
    fontSize: 16,
    color: "#333",
  },
});

const menuStyles = {
  optionsContainer: {
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 8,
    width: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
};

export default GrupoItem;

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { monto } from '../utils/format';
import Icon from 'react-native-vector-icons/MaterialIcons';

const GrupoItem = ({ grupo, onPress, onEditar, onEliminar }) => {
  const [tooltip, setTooltip] = useState(null);
  const { id, nombre, imagen, total_gastado, total_adeudado, total_pagado } = grupo;

  const mostrarTooltip = (mensaje, tipo) => {
    setTooltip({ mensaje, tipo });
    setTimeout(() => setTooltip(null), 1500);
  };

  return (
    <TouchableOpacity onPress={() => onPress(id, nombre)}>
      <View style={styles.container}>
        <View style={styles.infoContainer}>
          <Image
            source={
              imagen && imagen !== "default"
                ? { uri: imagen }
                : require("../assets/image.png") // imagen local por defecto
            }
            style={styles.avatar}
          />
          <View style={styles.textContainer}>
            <Text style={styles.nombre}>{nombre}</Text>
            <Text style={styles.total}>Total: {monto(total_gastado)}</Text>
            <Text style={styles.deuda}>Debes: {monto(total_adeudado)}</Text>
            <Text style={styles.favor}>Te deben: {monto(total_pagado)}</Text>
          </View>

          <View style={styles.botonesContainer}>
            <TouchableOpacity
              onPress={() => onEditar(grupo)}
              onLongPress={() => mostrarTooltip("Editar", "editar")}
              style={styles.iconButton}
            >
              <Icon name="edit" size={24} color="#4CAF50" />
              {tooltip?.tipo === 'editar' && (
                <Text style={styles.tooltipText}>{tooltip.mensaje}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onEliminar(grupo.id)}
              onLongPress={() => mostrarTooltip("Eliminar", "eliminar")}
              style={styles.iconButton}
            >
              <Icon name="delete" size={24} color="#F44336" />
              {tooltip?.tipo === 'eliminar' && (
                <Text style={styles.tooltipText}>{tooltip.mensaje}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0F4F8',
    borderRadius: 5,
    marginVertical: 8,
    padding: 10,
    elevation: 0,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nombre: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  total: {
    fontSize: 14,
    color: '#555',
  },
  deuda: {
    fontSize: 14,
    color: 'red',
  },
  favor: {
    fontSize: 14,
    color: 'green',
  },
  botonesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  iconButton: {
    marginHorizontal: 4,
    padding: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tooltipText: {
    position: 'absolute',
    left: 0,
    top: 40,
    backgroundColor: '#eee',
    borderRadius: 4,
    fontSize: 12,
    color: '#333',
    zIndex: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    minWidth: 50,
    textAlign: 'center',
  }
});

export default GrupoItem;

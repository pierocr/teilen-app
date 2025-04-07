// AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_URL from "../config";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Estado para controlar la carga

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const tokenGuardado = await AsyncStorage.getItem("token");
        if (tokenGuardado) {
          const resp = await axios.get(`${API_URL}/usuarios/perfil`, {
            headers: { Authorization: `Bearer ${tokenGuardado}` },
          });
          setUser({ token: tokenGuardado, ...resp.data });
        }
      } catch (error) {
        console.warn("Token inválido o expirado, cerrando sesión automáticamente.");
        await AsyncStorage.removeItem("token");
        setUser(null);
      } finally {
        setIsLoading(false); // Finaliza la verificación, sea exitosa o no
      }
    };
    verificarSesion();
  }, []);

  const login = async (token, userData) => {
    try {
      await AsyncStorage.setItem("token", token);
      setUser({ token, ...userData });
    } catch (error) {
      console.error("Error en login (AuthContext):", error);
    }
  };

  const actualizarUsuario = (nuevosDatos) => {
    setUser((prev) => ({
      ...prev,
      ...nuevosDatos,
    }));
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      setUser(null);
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, actualizarUsuario }}
    >
      {children}
    </AuthContext.Provider>
  );
};

import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { navigationRef } from "../navigation/AppNavigator"; // 🔹 Importar navigationRef

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const verificarSesion = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        setUser({ token });
      }
    };
    verificarSesion();
  }, []);

  const login = async (token) => {
    await AsyncStorage.setItem("token", token);
    setUser({ token });
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      setUser(null);
      if (navigationRef.isReady()) {
        navigationRef.current?.navigate("Login"); // 🔹 Redirigir correctamente al Login
      }
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

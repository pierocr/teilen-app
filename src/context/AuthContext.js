// AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { navigationRef } from "../navigation/AppNavigator";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  //Permite la lectura del TOKEN que inicio sesion (No dejar comentado, es muy util)
  /*useEffect(() => {
    const verificarSesion = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        setUser({ token });
      }
    };
    verificarSesion();
  }, []);*/

  // Guarda token y datos de usuario en el estado
  const login = async (token, userData) => {
    await AsyncStorage.setItem("token", token);
    setUser({ token, ...userData });
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      setUser(null);
      // ❌ Eliminamos la navegación manual a "Login"
      // if (navigationRef.isReady()) {
      //   navigationRef.current?.navigate("Login");
      // }
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

import React from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { MenuProvider } from "react-native-popup-menu";
import { SafeAreaProvider } from "react-native-safe-area-context"; // Importa SafeAreaProvider

export default function App() {
  return (
    <SafeAreaProvider>
      <MenuProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </MenuProvider>
    </SafeAreaProvider>
  );
}

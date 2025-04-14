// AppNavigator.js
import React, { useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import {
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import GrupoDetalleScreen from "../screens/GrupoDetalleScreen";
import AmigosScreen from "../screens/AmigosScreen";
import ActividadScreen from "../screens/ActividadScreen";
import CuentaScreen from "../screens/CuentaScreen";
import LoginScreen from "../screens/LoginScreen";
import AmigoDetalleScreen from "../screens/AmigoDetalleScreen";
import CrearGastoScreen from "../screens/CrearGastoScreen";
import GastoDetalleScreen from "../screens/GastoDetalleScreen";
import RegisterScreen from "../screens/RegisterScreen";
import EditarCuentaScreen from "../screens/EditarCuentaScreen";
import LoadingScreen from "../screens/LoadingScreen"; // ¡OJO! Asegúrate de tener este archivo
import InvitacionScreen from "../screens/InvitacionScreen";
import AgregarParticipanteScreen from "../screens/AgregarParticipanteScreen";
import EditarGastoScreen from "../screens/EditarGastoScreen";
import CodigoQRScreen from "../screens/CodigoQRScreen";
import EscanearQRScreen from "../screens/EscanearQRScreen";


import * as Linking from "expo-linking";

import { AuthContext } from "../context/AuthContext";

export const navigationRef = createNavigationContainerRef();

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


const linking = {
  prefixes: ["teilenapp://"],
  config: {
    screens: {
      Invitacion: {
        path: "invite",
        parse: {
          ref: (ref) => `${ref}`,
        },
      },
    },
  },
};

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerBackTitleVisible: false }}>
      <Stack.Screen
        name="Tus Grupos"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="GrupoDetalle" component={GrupoDetalleScreen} />
      <Stack.Screen
        name="CrearGasto"
        component={CrearGastoScreen}
        options={{ title: "Añadir Gasto" }}
      />
      <Stack.Screen
        name="GastoDetalle"
        component={GastoDetalleScreen}
        options={{ title: "Detalle del Gasto" }}
      />
      <Stack.Screen
        name="EditarGasto"
        component={EditarGastoScreen}
        options={{ title: "Editar Gasto" }}
      />
      {/* 2) Agregar la nueva pantalla */}
      <Stack.Screen
        name="AgregarParticipante"
        component={AgregarParticipanteScreen}
        options={{ title: "Añadir Participante" }}
      />
    </Stack.Navigator>
  );
}

function AmigosStack() {
  return (
    <Stack.Navigator screenOptions={{ headerBackTitleVisible: false }}>
      <Stack.Screen
        name="AmigosMain"
        component={AmigosScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AmigoDetalle"
        component={AmigoDetalleScreen}
        options={{ title: "Detalle del Amigo" }}
      />
      <Stack.Screen
  name="EscanearQR"
  component={EscanearQRScreen}
  options={{ title: "Escanear código QR" }}
/>

    </Stack.Navigator>
  );
}

function CuentaStack() {
  return (
    <Stack.Navigator screenOptions={{ headerBackTitleVisible: false }}>
      <Stack.Screen
        name="CuentaMain"
        component={CuentaScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditarCuenta"
        component={EditarCuentaScreen}
        options={{ title: "Editar Cuenta" }}
      />
      <Stack.Screen
        name="CodigoQR"
        component={CodigoQRScreen}
        options={{ title: "Mi código QR" }}
      />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackTitleVisible: false,
        animation: "fade",
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Registro"
        component={RegisterScreen}
        options={{ title: "Crear Cuenta", headerShown: false }}
      />
      <Stack.Screen
        name="Invitacion"
        component={InvitacionScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}


export default function AppNavigator() {
  const { user, isLoading } = useContext(AuthContext);

  // Mientras se verifica el token, mostramos la pantalla de carga
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      {user ? (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let iconName;
              if (route.name === "Grupos") iconName = "people-outline";
              else if (route.name === "Amigos") iconName = "person-add-outline";
              else if (route.name === "Actividad") iconName = "stats-chart-outline";
              else if (route.name === "Cuenta") iconName = "person-circle-outline";
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            headerShown: false,
          })}
        >
          <Tab.Screen name="Grupos" component={HomeStack} />
          <Tab.Screen name="Amigos" component={AmigosStack} />
          <Tab.Screen name="Actividad" component={ActividadScreen} />
          <Tab.Screen name="Cuenta" component={CuentaStack} />
        </Tab.Navigator>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}

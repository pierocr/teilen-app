// src/navigation/AppNavigator.js
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

import { AuthContext } from "../context/AuthContext";

export const navigationRef = createNavigationContainerRef();

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Tus Grupos"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="GrupoDetalle" component={GrupoDetalleScreen} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useContext(AuthContext);

  return (
    <NavigationContainer ref={navigationRef}>
      {user ? (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let iconName;
              if (route.name === "Grupos") iconName = "people-outline";
              else if (route.name === "Amigos") iconName = "person-add-outline";
              else if (route.name === "Actividad")
                iconName = "stats-chart-outline";
              else if (route.name === "Cuenta") iconName = "person-circle-outline";
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            headerShown: false,
          })}
        >
          <Tab.Screen name="Grupos" component={HomeStack} />
          <Tab.Screen name="Amigos" component={AmigosScreen} />
          <Tab.Screen name="Actividad" component={ActividadScreen} />
          <Tab.Screen name="Cuenta" component={CuentaScreen} />
        </Tab.Navigator>
      ) : (
        // Si user es null, muestra el Stack con la pantalla de Login
        <AuthStack />
      )}
    </NavigationContainer>
  );
}

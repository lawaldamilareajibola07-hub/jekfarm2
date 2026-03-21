// navigation/AdminNavigator.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AdminLoginScreen from "../screens/admin/AdminLoginScreen";
import AdminRegisterScreen from "../screens/admin/AdminRegisterScreen";
import AdminTabNavigator from "../components/AdminTabNavigator";
import AdminDisputes from "../screens/admin/AdminDisputes";

const Stack = createNativeStackNavigator();

export default function AdminNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="AdminLogin"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      {/* Authentication */}
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
      <Stack.Screen name="AdminRegister" component={AdminRegisterScreen} />

      {/* Main Admin Tabs */}
      <Stack.Screen name="Admin" component={AdminTabNavigator} />

      {/* Secondary Screens */}
      <Stack.Screen name="AdminDisputes" component={AdminDisputes} />
      
    </Stack.Navigator>
  );
}
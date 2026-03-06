import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts, Lato_400Regular, Lato_700Bold } from "@expo-google-fonts/lato";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";

import { CartProvider } from "./context/CartContext";
import AppNavigator from "./navigation/AppNavigator";
import { NavigationContainer } from "@react-navigation/native";
import "./security/track.js";

export default function App() {
  // Load fonts
  const [fontsLoaded] = useFonts({
    Lato_400Regular,
    Lato_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <CartProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
        <StatusBar style="auto" />
      </CartProvider>
    </SafeAreaProvider>
  );
}
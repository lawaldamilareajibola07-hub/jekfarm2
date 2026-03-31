import React, { useEffect } from "react";
import { View, ActivityIndicator, SafeAreaView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";

const AuthLoadingScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    let active = true;

    const checkLoginStatus = async () => {
      try {
        // ── Step 1: Check if onboarding has been completed ──────────────
        const onboardingCompleted = await AsyncStorage.getItem("onboardingCompleted");
        if (!onboardingCompleted) {
          // First ever launch — deep-link into Auth navigator at Onboarding
          if (active) navigation.replace("Auth", { screen: "Onboarding" });
          return;
        }

        // ── Step 2: Check for saved session (user data + token) ──────────
        const userData = await AsyncStorage.getItem("user");
        const token = await SecureStore.getItemAsync("token");

        if (active && userData && token) {
          const user = JSON.parse(userData);

          // Normalise role to lowercase to avoid casing mismatches
          // e.g. "Farmer", "FARMER", "farmer" all resolve correctly
          const role = (user.role || "customer").toLowerCase().trim();

          console.log("✅ Auth check — role found:", role);

          // ── Step 3: Route to the correct Tab Navigator by role ─────────
          if (role === "farmer") {
            navigation.replace("FarmerTabs");
          } else if (role === "vendor") {
            navigation.replace("VendorTabs");
          } else if (role === "admin") {
            navigation.replace("Admin");
          } else {
            // Covers "customer" and any unknown/future roles
            navigation.replace("MainTabs");
          }
        } else {
          // ── Onboarding done but no session — go straight to Login ──────
          if (active) navigation.replace("Auth", { screen: "Login" });
        }
      } catch (error) {
        // Something went wrong reading storage — fail safe to Login
        console.log("⚠️ Auth check error:", error);
        if (active) navigation.replace("Auth", { screen: "Login" });
      }
    };

    checkLoginStatus();

    return () => {
      active = false;
    };
  }, [navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    </SafeAreaView>
  );
};

export default AuthLoadingScreen;
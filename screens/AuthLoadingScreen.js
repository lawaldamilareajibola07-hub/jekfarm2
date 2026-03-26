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
        // Check if onboarding is done
        const onboardingCompleted = await AsyncStorage.getItem("onboardingCompleted");
        if (!onboardingCompleted && active) {
          navigation.replace("Onboarding");
          return;
        }

        // Get User Data from AsyncStorage, Token from SecureStore
        const userData = await AsyncStorage.getItem("user");
        const token = await SecureStore.getItemAsync("token"); // ✅ matches axios interceptor

        if (active && userData && token) {
          const user = JSON.parse(userData);

          // Redirect based on the saved role
          if (user.role === "farmer") {
            navigation.replace("FarmerTabs");
          } else {
            navigation.replace("MainTabs");
          }
        } else if (active) {
          navigation.replace("Login");
        }
      } catch (error) {
        console.log("Auth check error:", error);
        if (active) navigation.replace("Login");
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
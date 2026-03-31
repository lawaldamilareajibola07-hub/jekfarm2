import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// ─── Auth & Onboarding Screens ───────────────────────────────────────────────
import OnboardingScreen from "../screens/Agreonpay/general/auth/OnboardingScreen";
import LoginScreen from "../screens/Agreonpay/general/auth/LoginScreen";
import CreateAccountScreen from "../screens/Agreonpay/general/auth/CreateAccountScreen";
import ConfirmEmailScreen from "../screens/Agreonpay/general/auth/ConfirmEmailScreen";
import ForgotPasswordScreen from "../screens/Agreonpay/general/auth/ForgotPasswordScreen";
import ChangePassword from "../screens/Agreonpay/general/auth/ChangePassword";
import ConfirmOTP from "../screens/Agreonpay/general/auth/ConfirmOTP";
import ConfirmOTPForgotPassword from "../screens/Agreonpay/general/auth/ConfirmOTPForgotPassword";
import CompleteProfileScreen from "../screens/Agreonpay/general/auth/CompleteProfileScreen";

const Stack = createNativeStackNavigator();

/**
 * AuthNavigator
 * Handles all unauthenticated flows:
 *   Onboarding → Login / Register → OTP → Forgot Password → Complete Profile
 *
 * initialRouteName is "Login" because AuthLoadingScreen controls which
 * screen opens via deep-linking:
 *   - First launch  → navigation.replace("Auth", { screen: "Onboarding" })
 *   - Returning     → navigation.replace("Auth", { screen: "Login" })
 *
 * Once authentication is complete, AuthLoadingScreen in AppNavigator
 * will redirect the user to the appropriate Tab Navigator.
 */
export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      {/* ── Onboarding ───────────────────────────────────────────────────── */}
      {/* Shown once on first launch only — controlled by AuthLoadingScreen */}
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />

      {/* ── Login ────────────────────────────────────────────────────────── */}
      {/* Default entry point for returning unauthenticated users */}
      <Stack.Screen name="Login" component={LoginScreen} />

      {/* ── Registration ─────────────────────────────────────────────────── */}
      {/* New user sign-up flow */}
      <Stack.Screen name="Signup" component={CreateAccountScreen} />

      {/* Email confirmation after account creation */}
      <Stack.Screen name="Email" component={ConfirmEmailScreen} />

      {/* OTP verification for registration */}
      <Stack.Screen name="ConfirmOTP" component={ConfirmOTP} />

      {/* Final step: fill in profile details before entering the app */}
      <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />

      {/* ── Forgot Password ───────────────────────────────────────────────── */}
      {/* Password recovery entry screen */}
      <Stack.Screen name="Fbpass" component={ForgotPasswordScreen} />

      {/* OTP verification specific to forgot-password flow */}
      <Stack.Screen name="ConfirmOTPForgotPassword" component={ConfirmOTPForgotPassword} />

      {/* New password entry after OTP verification */}
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
    </Stack.Navigator>
  );
}
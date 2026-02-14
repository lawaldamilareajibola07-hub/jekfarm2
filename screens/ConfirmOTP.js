import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,

} from "react-native";
import { Ionicons as Icon } from "@expo/vector-icons";
import OTPTextInput from "react-native-otp-textinput";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api";

import Menu from "../assets/menu.png";
import Gmail from "../assets/Gmail.png";

const ConfirmOTPScreen = ({ navigation, route }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const otpRef = useRef(null);

  const email = route?.params?.email || "";
  const token = route?.params?.token || "";

  const handleNext = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(
        "/auth/register.php?action=final",
        {
          email: email,
          otp: otp,
          token: token,
        }
      );

      const data = response.data;
      console.log("API Response:", data);
      setLoading(false);

      if (data.status === "success") {
        // Auto-login logic
        if (data.user && data.session) {
          const userData = data.user;
          await AsyncStorage.setItem("user", JSON.stringify(userData));
          await AsyncStorage.setItem("token", data.session);
          await AsyncStorage.setItem("session_cookie", data.session);
        }

        Alert.alert("Success", data.message, [
          { text: "OK", onPress: () => navigation.replace("CompleteProfile", { email: email, token: data.session }) }, // Navigate to Profile Completion
        ]);
      } else {
        Alert.alert("Error", data.message || "Invalid OTP, try again.");
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Something went wrong. Please try again later.");
      console.error(error);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      const response = await api.post(
        "/auth/register.php?action=resend",
        { email, token }
      );

      const data = response.data;
      setResending(false);

      if (data.status === "success") {
        Alert.alert("Success", data.message);
      } else {
        Alert.alert("Error", data.message || "Could not resend OTP.");
      }
    } catch (error) {
      setResending(false);
      Alert.alert("Error", "Something went wrong while resending OTP.");
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Image source={Menu} style={{ width: 40, height: 40 }} />
              <Text style={styles.titleText}> Confirm OTP</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.infoText}>
              Enter OTP sent to{" "}
              <Text style={{ fontWeight: "bold" }}>{email || "your email"}</Text>
            </Text>

            <OTPTextInput
              ref={otpRef}
              inputCount={6}
              handleTextChange={setOtp}
              tintColor="#10b981"
              offTintColor="#d1d5db"
              containerStyle={styles.otpContainer}
              textInputStyle={styles.otpInput}
            />

            <TouchableOpacity
              onPress={handleResend}
              disabled={resending}
              style={styles.resendButton}
            >
              {resending ? (
                <ActivityIndicator color="#10b981" />
              ) : (
                <Text style={styles.resendText}>Resend OTP</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.nextButtonText}>Next</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.emailButton}
              onPress={() => Linking.openURL("mailto:")}
            >
              <Image source={Gmail} />
              <Text style={styles.emailButtonText}> Open Email App</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ConfirmOTPScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8", padding: 20 },
  header: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 13,
  },
  backButton: {
    backgroundColor: "#3d2601",
    borderRadius: 50,
    padding: 10,
    marginRight: 10,
  },
  titleContainer: {
    backgroundColor: "#d6f5dc",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    width: "80%",
  },
  titleText: { fontSize: 14, fontWeight: "500", color: "#000" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 40,
  },
  infoText: { color: "#374151", fontSize: 14, marginBottom: 16 },
  infoText: { color: "#374151", fontSize: 14, marginBottom: 16 },
  otpContainer: { marginBottom: 16, justifyContent: "space-between" },
  otpInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    width: "14%",
    aspectRatio: 1,
    width: "14%",
    aspectRatio: 1,
    fontSize: 18,
    textAlign: "center",
  },
  otpContainer: { marginBottom: 16, justifyContent: "space-between" },
  resendText: { color: "#6b7280", fontSize: 13, marginBottom: 20 },
  sendAgain: { color: "#10b981", fontWeight: "600" },
  resendButton: { marginBottom: 20, alignItems: "center" },
  resendText: { color: "#10b981", fontWeight: "600", fontSize: 14 },
  nextButton: {
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  nextButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  emailButton: {
    flexDirection: "row",
    justifyContent: "center",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  emailButtonText: { fontSize: 15, fontWeight: "500", color: "#374151" },
});

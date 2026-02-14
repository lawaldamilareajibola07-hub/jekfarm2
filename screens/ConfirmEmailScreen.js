import React, { useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { FontAwesome as Icon } from "@expo/vector-icons";
import OTPTextInput from "react-native-otp-textinput";

const ConfirmEmailScreen = ({ route, navigation }) => {
  const otpRef = useRef(null);
  const { email = "your email" } = route.params || {};

  const handleNext = () => {
    const otp = otpRef.current?.state?.otpText?.join("");
    if (otp.length === 6) {
      Alert.alert("OTP Entered", otp);
    } else {
      Alert.alert("Error", "Please enter all 6 digits");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton}>
              <Icon name="arrow-left" size={18} color="#fff" />
            </TouchableOpacity>

            <View style={styles.headerRight}>
              <View style={styles.iconCircle}>
                <Icon name="info" size={18} color="#fff" />
              </View>
              <Text style={styles.headerText}>Confirm Email</Text>
            </View>
          </View>

          {/* Card Section */}
          <View style={styles.card}>
            <Text style={styles.infoText}>
              Enter OTP Sent to{" "}
              <Text style={{ fontWeight: "600" }}>{email}</Text>
            </Text>

            <OTPTextInput
              ref={otpRef}
              tintColor="#10b981"
              offTintColor="#d1d5db"
              containerStyle={styles.otpContainer}
              textInputStyle={styles.otpInput}
              inputCount={6}
            />

            <Text style={styles.resendText}>
              Didn’t get code?{" "}
              <Text style={styles.resendLink}>Send again</Text>
            </Text>

            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.emailButton}>
              <Icon name="envelope" size={18} color="#DB4437" />
              <Text style={styles.emailButtonText}> Open Email App</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ConfirmEmailScreen;

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#3b2f0b",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d1fae5",
    borderRadius: 20,
    marginLeft: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    width: "80%",
  },
  iconCircle: {
    backgroundColor: "#10b981",
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#065f46",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  infoText: {
    color: "#374151",
    fontSize: 14,
    marginBottom: 16,
  },
  otpContainer: {
    marginBottom: 16,
    justifyContent: "space-between",
  },
  otpInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    width: 45,
    height: 50,
  },
  resendText: {
    color: "#6b7280",
    fontSize: 13,
    marginBottom: 20,
  },
  resendLink: {
    color: "#10b981",
    fontWeight: "600",
  },
  nextButton: {
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  nextButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  emailButton: {
    flexDirection: "row",
    justifyContent: "center",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emailButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#374151",
  },
});

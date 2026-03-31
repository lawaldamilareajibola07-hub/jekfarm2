import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { FontAwesome as Icon } from "@expo/vector-icons";

const ChangePassword = ({ navigation, route }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const email = route?.params?.email || "";
  const token = route?.params?.token || "";

  const handleConfirm = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        "https://jekfarms.com.ng/auth/forgot_password.php?action=reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            token: token,
            new_password: newPassword,
          }),
        }
      );

      const data = await response.json();
      setLoading(false);

      if (data.status === "success") {
        Alert.alert("Success", data.message, [
          {
            text: "OK",
            onPress: () => navigation.replace("Login"),
          },
        ]);
      } else {
        Alert.alert("Error", data.message || "Failed to reset password");
      }
    } catch (error) {
      setLoading(false);
      console.error("Reset password error:", error);
      Alert.alert("Error", "Something went wrong. Please try again later.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {/* Top header section */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={18} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerRight}>
            <View style={styles.iconCircle}>
              <Icon name="info" size={18} color="#fff" />
            </View>
            <Text style={styles.headerText}>Change Password</Text>
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.card}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Enter new password"
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={setNewPassword}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Icon
                name={showNewPassword ? "eye" : "eye-slash"}
                size={18}
                color="#555"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Icon
                name={showConfirmPassword ? "eye" : "eye-slash"}
                size={18}
                color="#555"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.buttonDisabled]}
            onPress={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginText}>Change Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingTop: 50,
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
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  label: {
    fontSize: 14,
    color: "#374151",
    marginTop: 12,
    marginBottom: 4,
  },
  passwordWrapper: {
    position: "relative",
    marginBottom: 12,
  },
  input: {
    height: 44,
    borderColor: "#d1d5db",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingRight: 40,
    backgroundColor: "#fff",
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 13,
  },
  loginButton: {
    marginTop: 20,
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { FontAwesome as Icon } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Menu from "../assets/menu.png";

const CreateAccountScreen = () => {
  const navigation = useNavigation();
  const [phone, setPhone] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState(""); // 👈 referral state
  const [showPassword, setShowPassword] = useState(false); // 👈 toggle state
  const [loading, setLoading] = useState(false);

  // State for user type, defaulted to 'customer'
  const [userType, setUserType] = useState("customer");

  const handleCreate = async () => {
    console.log("SENDING DATA TO BACKEND:", {
      email,
      type: userType // This should show 'farmer' if selected
    });

    if (!fullName || !email || !password || !phone) {
      Alert.alert("Error", "All fields are required!");
      return;
    }

    // Check if userType has been selected, though it's defaulted now
    if (!userType) {
      Alert.alert(
        "Error",
        "Please select an account type (Customer or Farmer)."
      );
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        "https://jekfarms.com.ng/auth/register.php?action=send-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: fullName,
            email: email,
            password: password,
            phone: phone,
            type: userType,
            referral_code: referralCode,
          }),
        }
      );

      const data = await response.json();
      console.log("API Response:", data);

      if (data.status === "otp_sent") {
        Alert.alert("Success", data.message);
        navigation.replace("ConfirmOTP", { token: data.token, email: email });
      } else {
        Alert.alert("Error", data.message || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.topSection}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.logoCircle}>
            <Icon name="leaf" size={30} color="#fff" />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the Jekfarm community</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account Type</Text>
          {/* User Type Selector */}
          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === "customer" && styles.selectedButton,
              ]}
              onPress={() => setUserType("customer")}
              disabled={loading}
            >
              <Text
                style={
                  userType === "customer"
                    ? styles.selectedText
                    : styles.unselectedText
                }
              >
                Customer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === "farmer" && styles.selectedButton,
              ]}
              onPress={() => setUserType("farmer")}
              disabled={loading}
            >
              <Text
                style={
                  userType === "farmer"
                    ? styles.selectedText
                    : styles.unselectedText
                }
              >
                Farmer
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputContainerStyle}>
                <Icon name="user" size={18} color="#9ca3af" style={styles.fieldIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputContainerStyle}>
                <Icon name="envelope" size={18} color="#9ca3af" style={styles.fieldIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="john@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputContainerStyle}>
                <Icon name="phone" size={18} color="#9ca3af" style={styles.fieldIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="08012345678"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  maxLength={11}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainerStyle}>
                <Icon name="lock" size={18} color="#9ca3af" style={styles.fieldIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Icon
                    name={showPassword ? "eye" : "eye-slash"}
                    size={18}
                    color="#9ca3af"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Referral Code (Optional)</Text>
              <View style={styles.inputContainerStyle}>
                <Icon name="gift" size={18} color="#9ca3af" style={styles.fieldIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="JKF-123456"
                  autoCapitalize="characters"
                  value={referralCode}
                  onChangeText={setReferralCode}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.createText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateAccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  topSection: {
    backgroundColor: "#10b981",
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.8)",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 30,
    marginTop: -30,
    marginHorizontal: 20,
    padding: 24,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: "#f0fdf4",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 12,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  userTypeContainer: {
    flexDirection: "row",
    marginBottom: 24,
    backgroundColor: "#f3f4f6",
    borderRadius: 16,
    padding: 6,
  },
  userTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  selectedButton: {
    backgroundColor: "#10b981",
  },
  unselectedText: {
    color: "#6b7280",
    fontWeight: "600",
    fontSize: 15,
  },
  selectedText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  formSection: {
    width: "100%",
  },
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainerStyle: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 16,
  },
  fieldIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: "#1e293b",
    fontWeight: "500",
  },
  eyeIcon: {
    padding: 8,
  },
  createButton: {
    backgroundColor: "#10b981",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    elevation: 4,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  createText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "500",
  },
  loginLink: {
    color: "#10b981",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 6,
  },
});

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
  Easing,
} from "react-native";
import { FontAwesome as Icon } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api";

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Animation refs
  const logoScale = useRef(new Animated.Value(1.4)).current; // start bigger
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslate, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  // Listen for keyboard show/hide
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("auth/login.php", {
        identifier: email,
        password,
      });
      const data = res.data;

      if (data.status === "success") {
        const userData = {
          ...data.user,
          role: data.user.role || data.user.type || "customer",
          wallet_balance: data.user.wallet_balance
            ? parseFloat(data.user.wallet_balance)
            : 0,
          balance: data.user.wallet_balance
            ? parseFloat(data.user.wallet_balance)
            : 0,
          wallet_balance_string: data.user.wallet_balance || "0.00",
          kyc_complete: data.user.kyc_complete || false,
          has_nin: data.user.has_nin || false,
          has_bvn: data.user.has_bvn || false,
        };

        await AsyncStorage.setItem("user", JSON.stringify(userData));

        const token =
          data.session || data.token || data.user?.session_id;
        if (token) {
          await AsyncStorage.setItem("token", token);
          await AsyncStorage.setItem("session_cookie", token);
        }

        const userRole = userData.role.toLowerCase();

        if (userRole === "farmer") {
          navigation.replace("FarmerTabs");
        } else {
          navigation.replace("MainTabs");
        }
      } else {
        Alert.alert("Login Failed", data.message);
      }
    } catch (err) {
      let errorMessage = "Failed to connect to server";

      if (err.code === "ECONNABORTED") {
        errorMessage =
          "Connection timed out. Please check your internet connection and try again.";
      } else if (err.message === "Network Error") {
        errorMessage =
          "No internet connection. Please check your network settings and try again.";
      } else if (err.response) {
        errorMessage =
          err.response.data?.message ||
          "Server error. Please try again later.";
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            keyboardVisible && styles.scrollContainerKeyboardVisible,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.topSection}>
              <Animated.View
                style={{
                  transform: [{ scale: logoScale }],
                  opacity: logoOpacity,
                }}
              >
                <View style={styles.logoCircle}>
                  <Icon name="leaf" size={40} color="#fff" />
                </View>
              </Animated.View>

              <Animated.View
                style={{
                  opacity: titleOpacity,
                  transform: [{ translateY: titleTranslate }],
                }}
              >
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>
                  Login to your Jekfarm account
                </Text>
              </Animated.View>
            </View>

            <View style={styles.formSection}>
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Email / Phone Number</Text>
                <View style={styles.inputContainer}>
                  <Icon
                    name="user"
                    size={18}
                    color="#9ca3af"
                    style={styles.fieldIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Ex. john@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <Icon
                    name="lock"
                    size={18}
                    color="#9ca3af"
                    style={styles.fieldIcon}
                  />
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

              <TouchableOpacity
                onPress={() => navigation.navigate("Fbpass")}
                style={styles.forgotPasswordLink}
              >
                <Text style={styles.forgotPasswordText}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginText}>Login</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ marginTop: 12, alignItems: "center" }}>
            <Text style={{ color: "#6b7280" }}>
              Don't have an account?
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Signup")}
            >
              <Text
                style={{
                  color: "#10b981",
                  fontWeight: "600",
                  marginTop: 6,
                }}
              >
                Sign up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

// 🔹 Styles remain completely untouched
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  scrollContainerKeyboardVisible: { paddingBottom: 40 },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 32,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#f0fdf4",
  },
  topSection: { alignItems: "center", marginBottom: 32 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
  },
  formSection: { width: "100%" },
  inputWrapper: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 16,
  },
  fieldIcon: { marginRight: 12 },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },
  eyeIcon: { padding: 8 },
  forgotPasswordLink: { alignSelf: "flex-end", marginBottom: 24 },
  forgotPasswordText: {
    color: "#10b981",
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: "#10b981",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});

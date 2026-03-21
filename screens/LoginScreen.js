// screens/LoginScreen.js
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
  ToastAndroid,
} from "react-native";
import { FontAwesome as Icon } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/axios";

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const logoScale = useRef(new Animated.Value(1.4)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(30)).current;

  // Admin triple-tap
  const [logoTapCount, setLogoTapCount] = useState(0);
  const logoTapTimeout = useRef(null);

  /* =============================
     LOAD SAVED CREDENTIALS
  ============================== */
  useEffect(() => {
    const loadSavedCredentials = async () => {
      const savedEmail = await AsyncStorage.getItem("remember_email");
      const savedPassword = await AsyncStorage.getItem("remember_password");
      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    };
    loadSavedCredentials();
  }, []);

  /* =============================
     Logo & Title Animation
  ============================== */
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

  /* =============================
     Keyboard listener
  ============================== */
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false)
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  /* =============================
     HANDLE LOGO TRIPLE TAP
  ============================== */
  const handleLogoTap = () => {
    setLogoTapCount((prev) => prev + 1);

    // Pulse animation on each tap
    Animated.sequence([
      Animated.timing(logoScale, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(logoScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    // Reset tap count after 1 second
    if (logoTapTimeout.current) clearTimeout(logoTapTimeout.current);
    logoTapTimeout.current = setTimeout(() => setLogoTapCount(0), 1000);

    // On third tap, navigate to AdminLogin inside nested navigator
    if (logoTapCount + 1 === 3) {
      setLogoTapCount(0);

      if (Platform.OS === "android") {
        ToastAndroid.show("Admin mode activated", ToastAndroid.SHORT);
      } else {
        Alert.alert("Admin mode activated");
      }

      // ✅ Nested navigation fix
      navigation.navigate("Admin", { screen: "AdminLogin" });
    }
  };

  /* =============================
     HANDLE USER LOGIN
  ============================== */
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/userManager/login", { login: email, password });
      const data = res.data;

      if (data.status === "success") {
        const userData = {
          ...data.data.user,
          role: data.data.user.role || data.data.user.type || "customer",
          wallet_balance: data.data.user.wallet_balance
            ? parseFloat(data.data.user.wallet_balance)
            : 0,
          balance: data.data.user.wallet_balance
            ? parseFloat(data.data.user.wallet_balance)
            : 0,
          wallet_balance_string: data.data.user.wallet_balance || "0.00",
          kyc_complete: data.data.user.kyc_complete || false,
          has_nin: data.data.user.has_nin || false,
          has_bvn: data.data.user.has_bvn || false,
        };

        await AsyncStorage.setItem("user", JSON.stringify(userData));

        const token = data.data.token || data.data.user?.session_id;
        if (token) {
          await AsyncStorage.setItem("token", token);
          await AsyncStorage.setItem("session_cookie", token);
        }

        // Save or clear credentials
        if (rememberMe) {
          await AsyncStorage.setItem("remember_email", email);
          await AsyncStorage.setItem("remember_password", password);
        } else {
          await AsyncStorage.removeItem("remember_email");
          await AsyncStorage.removeItem("remember_password");
        }

        const userRole = userData.role.toLowerCase();
        navigation.replace(userRole === "farmer" ? "FarmerTabs" : "MainTabs");
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
          err.response.data?.message || "Server error. Please try again later.";
      }
      console.log("🔥 LOGIN ERROR:", err.response?.data || err);
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
                <TouchableOpacity activeOpacity={0.7} onPress={handleLogoTap}>
                  <View style={styles.logoCircle}>
                    <Icon name="leaf" size={40} color="#fff" />
                  </View>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View
                style={{
                  opacity: titleOpacity,
                  transform: [{ translateY: titleTranslate }],
                }}
              >
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Login to your Jekfarm account</Text>
              </Animated.View>
            </View>

            <View style={styles.formSection}>
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Email / Phone Number</Text>
                <View style={styles.inputContainer}>
                  <Icon name="user" size={18} color="#9ca3af" style={styles.fieldIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ex. john@example.com"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <Icon name="lock" size={18} color="#9ca3af" style={styles.fieldIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                    <Icon name={showPassword ? "eye" : "eye-slash"} size={18} color="#9ca3af" />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setRememberMe(!rememberMe)}
                style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}
              >
                <Icon name={rememberMe ? "check-square" : "square-o"} size={18} color="#10b981" />
                <Text style={{ marginLeft: 8, color: "#374151", fontWeight: "500" }}>Remember Me</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginText}>Login</Text>}
              </TouchableOpacity>
            </View>
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
  scrollContainer: { flexGrow: 1, justifyContent: "center", padding: 24 },
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
  title: { fontSize: 28, fontWeight: "800", color: "#111827", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#6b7280", textAlign: "center" },
  formSection: { width: "100%" },
  inputWrapper: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8, marginLeft: 4 },
  inputContainer: { flexDirection: "row", alignItems: "center", height: 56, backgroundColor: "#f9fafb", borderRadius: 16, borderWidth: 1, borderColor: "#e5e7eb", paddingHorizontal: 16 },
  fieldIcon: { marginRight: 12 },
  input: { flex: 1, height: "100%", fontSize: 15, color: "#111827", fontWeight: "500" },
  eyeIcon: { padding: 8 },
  loginButton: { backgroundColor: "#10b981", height: 56, borderRadius: 16, justifyContent: "center", alignItems: "center", elevation: 4, shadowColor: "#10b981", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  loginText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.5 },
});
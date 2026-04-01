import React, { useState, useRef } from "react";
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
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { FontAwesome as Icon } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as SecureStore from "expo-secure-store";

const CreateAccountScreen = () => {
  const navigation = useNavigation();
  const scrollRef = useRef();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [market, setMarket] = useState("");
  const [bvn, setBvn] = useState("");
  const [dob, setDob] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const validateEmail = (value) => /\S+@\S+\.\S+/.test(value);

  const getPasswordStrength = () => {
    if (password.length < 6) return 1;
    if (password.match(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/))
      return 3;
    return 2;
  };

  const validate = () => {
    let newErrors = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(email)) newErrors.email = "Invalid email";
    if (!phone.trim()) newErrors.phone = "Phone is required";
    if (!password.trim()) newErrors.password = "Password required";
    if (!bvn || bvn.length !== 11) newErrors.bvn = "BVN must be 11 digits";
    if (!dob) newErrors.dob = "Date of birth required";
    if ((role === "farmer" || role === "vendor") && !market.trim())
      newErrors.market = "Market required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const requestBody = {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        password,
        role,
        market: role === "farmer" || role === "vendor" ? market : null,
        bvn,
        dob,
      };

      console.log("🚀 SENDING REGISTER REQUEST:", requestBody);

      const response = await fetch(
        "https://productionbackend2.agreonpay.com.ng/api/userManager/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      console.log("📡 RESPONSE STATUS:", response.status);

      const text = await response.text();
      console.log("📩 RAW RESPONSE:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.log("❌ JSON PARSE ERROR:", parseError);
        Alert.alert("Error", "Invalid server response");
        return;
      }

      console.log("✅ PARSED RESPONSE:", data);

      if (data.status === "success") {
        const token = data.data.token;
        await SecureStore.setItemAsync("token", token);
        Alert.alert("Success", data.message, [
          {
            text: "Continue",
            onPress: () => navigation.replace("Login"),
          },
        ]);
      } else {
        Alert.alert("Error", data.message || "Registration failed");
      }
    } catch (error) {
      console.log("🔥 NETWORK ERROR:", error);
      Alert.alert("Error", "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
        >
          <View style={styles.topSection}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Secure KYC Registration</Text>
          </View>

          <View style={styles.card}>
            {/* ROLE PICKER */}
            <View style={{ marginBottom: 22 }}>
              <Text style={styles.staticLabel}>Select Role</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={role} onValueChange={setRole}>
                  <Picker.Item label="Customer" value="customer" />
                  <Picker.Item label="Farmer" value="farmer" />
                  <Picker.Item label="Vendor" value="vendor" />
                </Picker>
              </View>
            </View>

            <FloatingInput
              label="First Name"
              value={firstName}
              onChangeText={setFirstName}
              error={errors.firstName}
            />
            <FloatingInput
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
              error={errors.lastName}
            />
            <FloatingInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              error={errors.email}
            />
            <FloatingInput
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={11}
              error={errors.phone}
            />

            {/* ✅ FIXED PASSWORD FIELD */}
            <FloatingInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              error={errors.password}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Icon
                    name={showPassword ? "eye" : "eye-slash"}
                    size={18}
                    color="#9ca3af"
                  />
                </TouchableOpacity>
              }
            />

            <PasswordStrengthBar strength={getPasswordStrength()} />

            {(role === "farmer" || role === "vendor") && (
              <FloatingInput
                label="Market"
                value={market}
                onChangeText={setMarket}
                error={errors.market}
              />
            )}

            <FloatingInput
              label="BVN (11 digits)"
              value={bvn}
              onChangeText={setBvn}
              keyboardType="number-pad"
              maxLength={11}
              error={errors.bvn}
            />

            {/* DATE PICKER */}
            <View style={{ marginBottom: 22 }}>
              <Text style={styles.staticLabel}>Date of Birth</Text>
              <TouchableOpacity
                style={styles.dateBox}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>{dob || "Select Date"}</Text>
              </TouchableOpacity>
              {errors.dob && (
                <Text style={styles.errorText}>{errors.dob}</Text>
              )}
              {showDatePicker && (
                <DateTimePicker
                  value={dob ? new Date(dob) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setDob(selectedDate.toISOString().split("T")[0]);
                    }
                  }}
                />
              )}
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

            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/* ✅ FIXED Floating Input Component */
const FloatingInput = ({
  label,
  value,
  onChangeText,
  error,
  keyboardType,
  secureTextEntry,
  maxLength,
  rightIcon,
}) => {
  const animated = useRef(new Animated.Value(value ? 1 : 0)).current;

  const handleFocus = () => {
    Animated.timing(animated, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    if (!value) {
      Animated.timing(animated, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const labelStyle = {
    position: "absolute",
    left: 16,
    top: animated.interpolate({ inputRange: [0, 1], outputRange: [18, -8] }),
    fontSize: animated.interpolate({
      inputRange: [0, 1],
      outputRange: [15, 12],
    }),
    color: "#6b7280",
    backgroundColor: "#fff",
    paddingHorizontal: 4,
    zIndex: 1,
  };

  return (
    <View style={{ marginBottom: 22 }}>
      <View style={styles.inputContainer}>
        {/* Floating label sits above the row */}
        <Animated.Text style={labelStyle}>{label}</Animated.Text>

        {/* ✅ Row holds TextInput + icon side by side */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
            maxLength={maxLength}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          {rightIcon && (
            <View style={styles.rightIconWrapper}>{rightIcon}</View>
          )}
        </View>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const PasswordStrengthBar = ({ strength }) => {
  const width = ["33%", "66%", "100%"][strength - 1] || "33%";
  const color = ["#ef4444", "#f59e0b", "#10b981"][strength - 1] || "#ef4444";

  return (
    <View style={{ marginBottom: 20 }}>
      <View style={styles.strengthBarBackground}>
        <View
          style={[styles.strengthBarFill, { width, backgroundColor: color }]}
        />
      </View>
    </View>
  );
};

export default CreateAccountScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  topSection: {
    backgroundColor: "#10b981",
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  title: { fontSize: 26, fontWeight: "800", color: "#fff" },
  subtitle: { fontSize: 15, color: "rgba(255,255,255,0.9)" },
  card: {
    marginTop: -30,
    marginHorizontal: 20,
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 30,
    elevation: 10,
  },
  staticLabel: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  pickerContainer: {
    borderWidth: 1.5,
    borderRadius: 16,
    borderColor: "#e5e7eb",
  },
  dateBox: {
    borderWidth: 1.5,
    borderRadius: 16,
    borderColor: "#e5e7eb",
    padding: 16,
  },
  dateText: {
    fontSize: 15,
    color: "#374151",
  },

  // ✅ FIXED: inputContainer no longer uses justifyContent center alone
  inputContainer: {
    borderWidth: 1.5,
    borderRadius: 16,
    borderColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
    minHeight: 60,
  },

  // ✅ NEW: row that aligns TextInput and icon horizontally
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  // ✅ FIXED: added color so typed text is visible
  input: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    paddingVertical: 0,
  },

  // ✅ NEW: keeps icon to the right, vertically centered
  rightIconWrapper: {
    paddingLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  createButton: {
    backgroundColor: "#10b981",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  createText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  errorText: { color: "#ef4444", fontSize: 13, marginTop: 4 },
  strengthBarBackground: {
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
  },
  strengthBarFill: {
    height: 6,
    borderRadius: 4,
  },
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginText: {
    color: "#6b7280",
    fontSize: 14,
  },
  loginLink: {
    color: "#10b981",
    fontSize: 14,
    fontWeight: "600",
  },
});
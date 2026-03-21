// screens/admin/AdminLoginScreen.js
import React, { useState } from "react";
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  Alert, 
  StyleSheet, 
  SafeAreaView 
} from "react-native";
import api from "../../api/axios"; // API instance

export default function AdminLoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Error", "Please enter email and password");

    try {
      const res = await api.post("/admin/login", { email, password });
      if (res.data.status === "success") {
        navigation.replace("AdminDashboard"); // Navigate to dashboard
      } else {
        Alert.alert("Login Failed", res.data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not login. Try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.homeButton} 
          onPress={() => navigation.replace("AdminDashboard")}
        >
          <Text style={styles.homeButtonText}>🏠 Home</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Login</Text>
        <View style={{ width: 70 }} /> {/* Placeholder to center title */}
      </View>

      {/* Login Form */}
      <View style={styles.container}>
        <TextInput 
          placeholder="Email" 
          style={styles.input} 
          value={email} 
          onChangeText={setEmail} 
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput 
          placeholder="Password" 
          secureTextEntry 
          style={styles.input} 
          value={password} 
          onChangeText={setPassword} 
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f9fafb" },

  /* Header */
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: 15, 
    paddingVertical: 12, 
    backgroundColor: "#10b981" 
  },
  homeButton: { 
    padding: 8 
  },
  homeButtonText: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: 16 
  },
  headerTitle: { 
    color: "#fff", 
    fontSize: 18, 
    fontWeight: "700" 
  },

  /* Login Form */
  container: { 
    flex: 1, 
    justifyContent: "center", 
    padding: 20 
  },
  input: { 
    backgroundColor: "#fff", 
    padding: 12, 
    borderRadius: 12, 
    marginVertical: 10,
    fontSize: 16 
  },
  button: { 
    backgroundColor: "#10b981", 
    padding: 15, 
    borderRadius: 12, 
    alignItems: "center", 
    marginTop: 10 
  },
  buttonText: { 
    color: "#fff", 
    fontWeight: "700",
    fontSize: 16 
  },
});
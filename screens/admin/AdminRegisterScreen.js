import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet } from "react-native";
import api from "../../api/axios"; // note: two levels up from screens/admin

export default function AdminRegister({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!name || !email || !password) return Alert.alert("Error", "All fields are required");

    try {
      const res = await api.post("/admin/register", { name, email, password });
      if (res.data.status === "success") {
        Alert.alert("Success", "Admin registered successfully");
        navigation.replace("AdminLogin");
      } else {
        Alert.alert("Failed", res.data.message || "Could not register admin");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not register admin. Try again.");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Full Name" style={styles.input} value={name} onChangeText={setName} />
      <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry style={styles.input} value={password} onChangeText={setPassword} />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#f9fafb" },
  input: { backgroundColor: "#fff", padding: 12, borderRadius: 12, marginVertical: 10 },
  button: { backgroundColor: "#10b981", padding: 15, borderRadius: 12, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontWeight: "700" },
});
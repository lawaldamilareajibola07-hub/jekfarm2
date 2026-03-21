import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function ProfileScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>John Doe</Text>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>john@example.com</Text>
        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.value}>+234 801 234 5678</Text>
      </View>

      <TouchableOpacity
        style={styles.walletBtn}
        onPress={() => navigation.navigate("Wallet")}
      >
        <Text style={styles.walletText}>Go to Wallet</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.editBtn}>
        <Text style={styles.editText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20 },
  infoCard: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    marginBottom: 20,
  },
  label: { fontWeight: "700", color: "#555", marginTop: 10 },
  value: { fontSize: 16, color: "#333", marginTop: 4 },
  walletBtn: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#1a8917",
    marginBottom: 12,
    alignItems: "center",
  },
  walletText: { color: "#fff", fontWeight: "700" },
  editBtn: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1a8917",
    alignItems: "center",
  },
  editText: { color: "#1a8917", fontWeight: "700" },
});
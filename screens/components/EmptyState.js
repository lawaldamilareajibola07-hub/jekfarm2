import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const EmptyState = ({ title, subtitle, onRetry, error }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={onRetry}>
        <Text style={styles.buttonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 40, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 16, fontWeight: "600", marginBottom: 8, color: "#6B7280" },
  subtitle: { fontSize: 13, color: "#9CA3AF", marginBottom: 12, textAlign: "center" },
  errorText: { fontSize: 12, color: "#DC2626", marginBottom: 12 },
  button: { backgroundColor: "#22c55e", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});

export default EmptyState;
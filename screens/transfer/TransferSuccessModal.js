import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

export default function TransferSuccessModal({ visible, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View entering={FadeInUp.springify()} style={styles.card}>
          <Text style={styles.icon}>✅</Text>

          <Text style={styles.title}>Transfer Successful</Text>

          <Text style={styles.subtitle}>
            Your money has been sent successfully.
          </Text>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    width: "80%",
    backgroundColor: "#1e293b",
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
  },

  icon: {
    fontSize: 50,
    marginBottom: 10,
  },

  title: {
    fontSize: 20,
    color: "#22c55e",
    fontWeight: "700",
    marginBottom: 10,
  },

  subtitle: {
    color: "#cbd5f5",
    textAlign: "center",
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#22c55e",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
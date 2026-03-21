import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

export default function TermsPoliciesScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Policies</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeIn.duration(500)}>
          <Text style={styles.sectionTitle}>Terms of Use</Text>
          <Text style={styles.sectionText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec purus vel nisi aliquam...
          </Text>

          <Text style={styles.sectionTitle}>Privacy Policy</Text>
          <Text style={styles.sectionText}>
            We respect your privacy and ensure your data is protected. All personal information collected...
          </Text>

          <Text style={styles.sectionTitle}>Platform Policies</Text>
          <Text style={styles.sectionText}>
            Users are expected to follow the rules and regulations set forth for marketplace conduct...
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", marginLeft: 16 },
  content: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginTop: 16, marginBottom: 8 },
  sectionText: { fontSize: 14, lineHeight: 22, color: "#555" },
});
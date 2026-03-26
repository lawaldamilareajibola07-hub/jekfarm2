import React from "react";
import { View, Text, ScrollView, StatusBar, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import DashboardOverview from "../farmers-com/DashboardOverview";
// import KYCBanner from "../components/KYCBanner"; // Uncomment if needed
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/axios";

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        fetchUnreadCount(parsedUser.id);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const fetchUnreadCount = async (userId) => {
    try {
      const response = await api.post("api/notifications/get_notifications.php?action=unread-count", {
        user_id: userId
      });
      if (response.data.status === "success") {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="light-content" />
      
      {/* Gradient background – now properly sized to show rounded corners */}
      <LinearGradient
        colors={["#065f46", "#059669", "#10b981"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerBackground}
      />

      {/* Header content (overlaps the gradient) */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            {/* ✅ Display first name – falls back to "Farmer" if missing */}
            <Text style={styles.greetingText}>
              Hello, {user?.first_name || "Farmer"} {user?.last_name} 👨‍🌾
            </Text>
            <Text style={styles.subText}>Your daily farm insights</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => navigation.navigate("Notifications")}
            >
              <Ionicons name="notifications-outline" size={22} color="#fff" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => navigation.navigate("Profile")}
            >
              <Ionicons name="person-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 10, paddingBottom: 100 }}
      >
        {/* Optional KYCBanner – uncomment if you have it */}
        {/* <KYCBanner /> */}
        <DashboardOverview />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 160,                // ✅ Adjusted to cover header area only
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    // marginBottom removed – no longer needed
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    paddingBottom: 40,
    zIndex: 100,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greetingText: {
    fontSize: 19,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  subText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 12,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 2,
    borderColor: "#065f46",
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "bold",
  },
});
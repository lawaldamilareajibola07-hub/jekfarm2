import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  Image,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const initialize = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good morning");
        else if (hour < 18) setGreeting("Good afternoon");
        else setGreeting("Good evening");
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    initialize();
  }, []);

  const handleLogoutPress = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.clear();
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          } catch (err) {
            console.error("Logout error:", err);
          }
        },
      },
    ]);
  };

  const MenuItem = ({ icon, label, onPress, color = "#1F2937", sublabel }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconBox, { backgroundColor: color + "10" }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuItemLabel}>{label}</Text>
          {sublabel && <Text style={styles.menuItemSublabel}>{sublabel}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
    </TouchableOpacity>
  );

  const isVerified = user?.has_bvn || user?.has_nin;
  const isFullyVerified = user?.has_bvn && user?.has_nin;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView bounces={true} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <LinearGradient
          colors={["#10B981", "#059669"]}
          style={styles.header}
        >
          <SafeAreaView>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greetingText}>{user?.name || "User"}</Text>
                <Text style={styles.subGreetingText}>{greeting}!</Text>
                {isFullyVerified ? (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#fff" />
                    <Text style={styles.verifiedText}>Fully Verified</Text>
                  </View>
                ) : isVerified ? (
                  <View style={[styles.verifiedBadge, { backgroundColor: '#F59E0B' }]}>
                    <Ionicons name="shield-half" size={14} color="#fff" />
                    <Text style={styles.verifiedText}>Partial KYC</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.unverifiedBadge}
                    onPress={() => navigation.navigate("CreateVirtualAccount")}
                  >
                    <Ionicons name="alert-circle" size={14} color="#fff" />
                    <Text style={styles.verifiedText}>Complete KYC</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=fff&color=10B981` }}
                  style={styles.avatar}
                />
                <TouchableOpacity style={styles.editAvatarBtn}>
                  <Ionicons name="camera" size={12} color="#10B981" />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Info Cards */}
        <View style={styles.infoRow}>
          <TouchableOpacity style={styles.infoCard} onPress={() => navigation.navigate("Orders")}>
            <Text style={styles.infoValue}>0</Text>
            <Text style={styles.infoLabel}>Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.infoCard, styles.infoCardCenter]} onPress={() => navigation.navigate("Points")}>
            <Text style={styles.infoValue}>₦0</Text>
            <Text style={styles.infoLabel}>Points</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.infoCard} onPress={() => navigation.navigate("Loans")}>
            <Text style={styles.infoValue}>0</Text>
            <Text style={styles.infoLabel}>Loans</Text>
          </TouchableOpacity>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>ACCOUNT OVERVIEW</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="person-outline"
              label="Personal Information"
              sublabel="Edit your name, email and phone"
              color="#10B981"
              onPress={() => navigation.navigate("PersonalInfo")}
            />
            <MenuItem
              icon="wallet-outline"
              label="My Wallets"
              sublabel="Check balance and withdraw funds"
              color="#8B5CF6"
              onPress={() => navigation.navigate("WalletScreen")}
            />
            <MenuItem
              icon="card-outline"
              label="Virtual Account"
              sublabel="View your funding details"
              color="#3B82F6"
              onPress={() => navigation.navigate("CreateVirtualAccount")}
            />
          </View>

          <Text style={styles.sectionTitle}>ACTIVITY & SUPPORT</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="chatbubble-ellipses-outline"
              label="Live Support"
              sublabel="Chat with our agent"
              color="#8B5CF6"
              onPress={() => navigation.navigate("ChatBot")}
            />
            <MenuItem
              icon="notifications-outline"
              label="Notifications"
              sublabel="View your alerts"
              color="#EC4899"
              onPress={() => navigation.navigate("Notifications")}
            />
            <MenuItem
              icon="share-social-outline"
              label="Refer & Earn"
              sublabel="Invite friends to Agreon"
              color="#6366F1"
              onPress={() => navigation.navigate("ReferralScreen")}
            />
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutPress}>
            <View style={styles.logoutContent}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={styles.logoutText}>Log Out</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.versionText}>v1.0.3 • Agreon Pay</Text>
        </View>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  backButton: {
    padding: 10,
    marginLeft: -10,
    marginBottom: 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  greetingText: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subGreetingText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  unverifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EF4444",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  verifiedText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
  },
  editAvatarBtn: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#fff",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 24,
    borderRadius: 24,
    paddingVertical: 20,
    marginTop: -30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  infoCard: {
    flex: 1,
    alignItems: "center",
  },
  infoCardCenter: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#F3F4F6",
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#9CA3AF",
    marginTop: 30,
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 1,
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  menuTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  menuItemSublabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 1,
    fontWeight: "500",
  },
  logoutButton: {
    marginTop: 35,
    marginBottom: 10,
    alignItems: "center",
  },
  logoutContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  logoutText: {
    color: "#EF4444",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },
  versionText: {
    textAlign: "center",
    color: "#D1D5DB",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 20,
  },
  bottomSpacer: {
    height: 60,
  },
});

export default ProfileScreen;

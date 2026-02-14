import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ReferralScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const referralId = user?.referral_code || "JKF-UNAVALABLE";
  const totalRewards = user?.agro_points || 0;

  const handleCopy = async () => {
    if (!user?.referral_code) {
      Alert.alert("Wait", "Referral code not available yet.");
      return;
    }
    await Clipboard.setStringAsync(referralId);
    Alert.alert("Copied!", "Referral ID has been copied to clipboard.");
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerText}>Refer Your Friends</Text>
          <Text style={styles.subHeaderText}>Give 300, Get 300 Agro Points</Text>
        </View>
      </View>

      {loading ? (
        <View style={{ padding: 50, alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#22C55E" />
        </View>
      ) : (
        <>
          {/* Rewards Card */}
          <View style={[styles.card, styles.cardWithBorder]}>
            <View style={styles.row}>
              <Text style={styles.rewardText}>{Number(totalRewards).toLocaleString()}</Text>
              <TouchableOpacity
                style={styles.useBtn}
                onPress={() => navigation.navigate("Points")}
              >
                <Text style={styles.useBtnText}>Use</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Total Agro Points</Text>
          </View>

          {/* Referral ID Card */}
          <View style={[styles.card, styles.cardWithBorder]}>
            <View style={styles.row}>
              <Text style={styles.referralId}>{referralId}</Text>
              <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
                <Text style={styles.copyBtnText}>Copy</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Your Referral ID</Text>
          </View>
        </>
      )}

      {/* Referred Users */}
      <View style={styles.referralBox}>
        <Text style={styles.emptyIcon}>💤</Text>
        <Text style={styles.emptyText}>There's no recent Referrals</Text>
        <Text style={styles.helperText}>
          Refer a friend and rewards will display here
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    backgroundColor: "#22C55E",
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  backArrow: {
    color: "#22C55E",
    fontSize: 22,
    fontWeight: "bold",
  },
  headerContent: {
    flex: 1,
  },
  headerText: { fontSize: 20, fontWeight: "600", color: "#fff" },
  subHeaderText: {
    fontSize: 16,
    fontWeight: "400",
    color: "#fff",
    marginTop: 5,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  cardWithBorder: {
    borderWidth: 2,
    borderColor: "#22C55E",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rewardText: { fontSize: 24, fontWeight: "bold", color: "#111" },
  label: { marginTop: 8, fontSize: 12, color: "#6B7280" },
  referralId: { fontSize: 18, fontWeight: "600", color: "#111" },
  useBtn: {
    backgroundColor: "#22C55E",
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: "#22C55E",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  useBtnText: { color: "#fff", fontWeight: "600" },
  copyBtn: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#22C55E",
  },
  copyBtnText: { color: "#111", fontWeight: "600" },
  referralBox: {
    marginTop: 40,
    marginHorizontal: 16,
    marginBottom: 20,
    alignItems: "center",
    padding: 30,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#22C55E",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  emptyIcon: { fontSize: 48, color: "#22C55E", marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: "500", color: "#111" },
  helperText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
  },
});

export default ReferralScreen;

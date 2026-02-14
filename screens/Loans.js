"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Avater from "../assets/Ellipse-1.png";
import setting from "../assets/Group 4.png";
import image1 from "../assets/Loan 02 1.png";
import image2 from "../assets/Loan 03 1.png";
import image3 from "../assets/Loan 04 1.png";
import image4 from "../assets/Loan 06 1.png";
import bottomimage from "../assets/image 1.png";

export default function Loan({ navigation }) {
  const [userInfo, setUserInfo] = useState({
    name: "User",
    avatar: Avater,
    maxLoanLimit: 50000.0,
    friendsInvited: 0,
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString) {
          const user = JSON.parse(userString);
          setUserInfo({
            name: user.name || user.full_name || user.fullName || "User",
            avatar: user.avatar || Avater,
            maxLoanLimit: parseFloat(user.maxLoanLimit) || 50000.0,
            friendsInvited: parseInt(user.friendsInvited) || 0,
          });
        }
      } catch (error) {
        console.error("Error loading user data in Loans:", error);
      }
    };
    loadUserData();
  }, []);

  const [loanHistory] = useState([]);

  const handleRequestLoanLimit = () => {
    navigation.navigate("PersonnalInformation");
  };

  const handleInviteFriends = () => console.log("Invite friends clicked");
  const handleChatSupport = () => console.log("Chat customer service clicked");
  const handleHowToGetLoan = () => console.log("How to get a loan clicked");
  const handleIncreaseLoanLimit = () =>
    console.log("Increase loan limit clicked");
  const handleSeeAllHistory = () => console.log("See all history clicked");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.userGreeting}>
            <View style={styles.userInfo}>
              <Image source={Avater} style={styles.userAvatar} />
              <View style={styles.greetingText}>
                <Text style={styles.greeting}>Good Afternoon</Text>
                <Text style={styles.userName}>{userInfo.name}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.notificationBtn}>
              <Image source={setting} style={styles.settingIcon} />
            </TouchableOpacity>
          </View>

          {/* Loan Limit Card */}
          <View style={styles.loanLimitCard}>
            <Text style={styles.loanLimitLabel}>Maximum Loan Limit</Text>
            <Text style={styles.loanAmount}>
              ₦{userInfo.maxLoanLimit.toLocaleString()}.00
            </Text>
            <TouchableOpacity
              style={styles.requestLoanBtn}
              onPress={handleRequestLoanLimit}
              activeOpacity={0.8}
            >
              <Text style={styles.requestLoanBtnText}>Request loan limit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Feature Cards Grid */}
          <View style={styles.featureGrid}>
            <TouchableOpacity
              style={styles.featureCard}
              onPress={handleInviteFriends}
              activeOpacity={0.7}
            >
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Invite Friends</Text>
                <Text style={styles.featureSubtitle}>
                  {userInfo.friendsInvited} friends invited
                </Text>
              </View>
              <Image source={image1} style={styles.featureIcon} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={handleChatSupport}
              activeOpacity={0.7}
            >
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Chat Customer Service</Text>
                <Text style={styles.featureSubtitle}>Need Help?</Text>
              </View>
              <Image source={image2} style={styles.featureIcon} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={handleHowToGetLoan}
              activeOpacity={0.7}
            >
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>How to get a loan?</Text>
                <Text style={styles.featureSubtitle}>Easy steps</Text>
              </View>
              <Image source={image3} style={styles.featureIcon} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={handleIncreaseLoanLimit}
              activeOpacity={0.7}
            >
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Increase loan limit</Text>
                <Text style={styles.featureSubtitle}>Need more money?</Text>
              </View>
              <Image source={image4} style={styles.featureIcon} />
            </TouchableOpacity>
          </View>

          {/* Loan History Section */}
          <View style={styles.loanHistorySection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Loan History</Text>
              <TouchableOpacity onPress={handleSeeAllHistory}>
                <Text style={styles.seeAllBtn}>See all</Text>
              </TouchableOpacity>
            </View>

            {/* Empty State */}
            {loanHistory.length === 0 && (
              <View style={styles.emptyState}>
                <Image source={bottomimage} style={styles.emptyIllustration} />
                <Text style={styles.emptyTitle}>
                  There's no recent transaction
                </Text>
                <Text style={styles.emptySubtitle}>
                  Take a Loan, and we will display it here
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  userGreeting: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "#fff",
    marginRight: 12,
  },
  greetingText: {
    justifyContent: "center",
  },
  greeting: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  notificationBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  settingIcon: {
    width: 24,
    height: 24,
  },

  // Loan limit card
  loanLimitCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    borderTopWidth: 4,
    borderTopColor: "#22c55e",
  },
  loanLimitLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 6,
  },
  loanAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
  },
  requestLoanBtn: {
    alignSelf: "stretch",
    backgroundColor: "#22c55e",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  requestLoanBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // Main content
  content: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  featureCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "48%",
    minHeight: 190,
    justifyContent: "space-between",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 2,
    borderColor: "#22c55e",
  },
  featureContent: {
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 6,
  },
  featureSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  featureIcon: {
    width: 60,
    height: 60,
    alignSelf: "flex-end",
  },

  // Loan history
  loanHistorySection: {
    marginTop: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#22c55e",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1f2937",
  },
  seeAllBtn: {
    color: "#22c55e",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 50,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: "#22c55e",
  },
  emptyIllustration: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    textAlign: "center",
  },
});

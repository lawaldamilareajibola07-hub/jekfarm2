import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
} from "react-native";
import LottieView from "lottie-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Animated, { FadeInUp, FadeInDown, Layout } from "react-native-reanimated";

const WithdrawSuccessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { reference, amount, bankName, accountNumber } = route.params || {};

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Withdrawal Successful!\n\nAmount: ₦${amount}\nBank: ${bankName}\nAccount: ${accountNumber}\nReference: ${reference}`,
      });
    } catch (error) {
      console.log("Share error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        layout={Layout.springify()}
        entering={FadeInDown.duration(600)}
        style={styles.card}
      >
        {/* Success Animation */}
        <Animated.View entering={FadeInUp.delay(150)}>
          <LottieView
            source={require("./animations/success.json")}
            autoPlay
            loop={false}
            style={styles.animation}
          />
        </Animated.View>

        {/* Title */}
        <Animated.Text
          entering={FadeInUp.delay(300)}
          style={styles.title}
        >
          Withdrawal Successful
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          entering={FadeInUp.delay(400)}
          style={styles.subtitle}
        >
          Your withdrawal has been processed successfully.
        </Animated.Text>

        {/* Transaction Reference */}
        {reference && (
          <Animated.Text
            entering={FadeInUp.delay(500)}
            style={styles.reference}
          >
            Ref: {reference}
          </Animated.Text>
        )}

        {/* Share & Back Buttons */}
        <Animated.View
          entering={FadeInUp.delay(650)}
          style={styles.buttonsContainer}
        >
          <TouchableOpacity
            style={[styles.button, styles.shareButton]}
            onPress={handleShare}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Share Receipt</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("WalletDashboard")}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Back to Wallet</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default WithdrawSuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  card: {
    width: "100%",
    backgroundColor: "#1e293b",
    borderRadius: 22,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },

  animation: {
    width: 180,
    height: 180,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 10,
    color: "#22c55e",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
    color: "#cbd5f5",
    lineHeight: 22,
  },

  reference: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 10,
    textAlign: "center",
  },

  buttonsContainer: {
    marginTop: 28,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  button: {
    flex: 1,
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 5,
  },

  shareButton: {
    backgroundColor: "#2563eb",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
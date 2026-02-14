import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const CreateVirtualAccountScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Stats/Info, 2: ID Verify, 3: Account/Wallet
  const [userData, setUserData] = useState({ name: "", email: "" });
  const [bvn, setBvn] = useState("");
  const [nin, setNin] = useState("");
  const [dob, setDob] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountDetails, setAccountDetails] = useState(null);
  const [verificationType, setVerificationType] = useState("NIN"); // 'NIN' or 'BVN'

  useEffect(() => {
    loadUserData();
    loadExistingAccount();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserData(user);
        if (user.has_bvn || user.has_nin) {
          setCurrentStep(2); // Skip info if already partially known
        }
      }
    } catch (error) {
      console.error("User data load failed:", error);
    }
  };

  const loadExistingAccount = async () => {
    try {
      const saved = await AsyncStorage.getItem("virtualAccount");
      if (saved) {
        const parsed = JSON.parse(saved);
        setAccountDetails(Array.isArray(parsed) ? parsed : [parsed]);
        setCurrentStep(3);
      }
    } catch (e) {
      console.log("No previous virtual account found");
    }
  };

  const API_BASE = "https://jekfarms.com.ng/pay/monnify";

  const handleIdentityVerification = async () => {
    if (verificationType === "NIN") {
      if (!nin || nin.length !== 11) {
        Alert.alert("Invalid NIN", "Please enter a valid 11-digit NIN.");
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/nin_verification.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nin, email: userData.email }),
        });
        const result = await response.json();
        if (result.status === "success") {
          Alert.alert("Verified!", "Your NIN has been verified successfully.");
          setCurrentStep(2); // Proceed to next part of verification or account creation
          // Update local user state
          const updatedUser = { ...userData, has_nin: true, nin_number: nin };
          await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
          setUserData(updatedUser);
        } else {
          Alert.alert("Verification Failed", result.message || "Could not verify NIN.");
        }
      } catch (err) {
        Alert.alert("Error", "Network error during NIN verification.");
      } finally {
        setLoading(false);
      }
    } else {
      if (!bvn || bvn.length !== 11 || !bankCode || !accountNumber) {
        Alert.alert("Missing Info", "Bank Code, Account Number, and BVN are required for BVN verification.");
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/bvn_verification.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bvn, bankCode, accountNumber, email: userData.email }),
        });
        const result = await response.json();
        if (result.status === "success" && (result.data.matchStatus === "FULL_MATCH" || result.data.name?.matchStatus === "FULL_MATCH")) {
          Alert.alert("Verified!", "Your BVN matches our records.");
          setCurrentStep(2);
          const updatedUser = { ...userData, has_bvn: true, customer_bvn: bvn };
          await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
          setUserData(updatedUser);
        } else {
          Alert.alert("Verification Failed", result.message || "BVN match failed.");
        }
      } catch (err) {
        Alert.alert("Error", "Network error during BVN verification.");
      } finally {
        setLoading(false);
      }
    }
  };

  const generatePermanentAccount = async () => {
    if (!dob || !dob.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert("Date Required", "Please enter DOB in YYYY-MM-DD format.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        accountReference: `REF_${Date.now()}`,
        customerName: userData.name,
        customerEmail: userData.email,
        customerBVN: bvn || userData.customer_bvn,
        customerNIN: nin || userData.nin_number,
        dob: dob,
        accountName: "Jek Farm Funding",
      };

      const response = await fetch(`${API_BASE}/permanent.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.status === "success") {
        const accounts = result.data.accounts;
        setAccountDetails(accounts);
        await AsyncStorage.setItem("virtualAccount", JSON.stringify(accounts));

        // Now also create the disbursement wallet
        await createDisburseWallet();

        setCurrentStep(3);
        Alert.alert("Setup Complete", "Your virtual accounts and disbursement wallet are ready!");
      } else {
        Alert.alert("Account Failed", result.message || "Could not reserve account.");
      }
    } catch (err) {
      Alert.alert("Error", "Network error during account reservation.");
    } finally {
      setLoading(false);
    }
  };

  const createDisburseWallet = async () => {
    try {
      const walletPayload = {
        customerName: userData.name,
        customerEmail: userData.email,
        bvn: bvn || userData.customer_bvn,
        dob: dob,
        walletName: `Wallet - ${userData.name}`
      };
      const response = await fetch(`${API_BASE}/create_wallet.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(walletPayload),
      });
      const result = await response.json();
      if (result.status === "success") {
        await AsyncStorage.setItem("disbursementWallet", JSON.stringify(result.data));
        return true;
      }
    } catch (e) {
      console.log("Wallet creation failed background", e);
    }
    return false;
  };

  const ProgressBar = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3].map((step) => (
        <View key={step} style={styles.stepWrapper}>
          <View style={[
            styles.stepCircle,
            currentStep >= step ? styles.stepActive : styles.stepInactive
          ]}>
            <Text style={styles.stepText}>{step}</Text>
          </View>
          {step < 3 && <View style={[
            styles.stepLine,
            currentStep > step ? styles.lineActive : styles.lineInactive
          ]} />}
        </View>
      ))}
    </View>
  );

  const Step1Info = () => (
    <View style={styles.stepCard}>
      <Ionicons name="shield-checkmark" size={60} color="#10B981" style={styles.stepIcon} />
      <Text style={styles.stepTitle}>Secure Your account</Text>
      <Text style={styles.stepDescription}>
        To comply with financial regulations, we need to verify your identity. This allows you to have a secure bank account for funding your farm.
      </Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setCurrentStep(2)}
      >
        <Text style={styles.buttonText}>Start Verification</Text>
      </TouchableOpacity>
    </View>
  );

  const Step2Identify = () => (
    <View style={styles.stepCard}>
      <Text style={styles.stepTitle}>Identity Verification</Text>
      <View style={styles.typeSwitcher}>
        <TouchableOpacity
          style={[styles.typeBtn, verificationType === "NIN" && styles.typeBtnActive]}
          onPress={() => setVerificationType("NIN")}
        >
          <Text style={[styles.typeBtnText, verificationType === "NIN" && styles.typeBtnTextActive]}>NIN</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeBtn, verificationType === "BVN" && styles.typeBtnActive]}
          onPress={() => setVerificationType("BVN")}
        >
          <Text style={[styles.typeBtnText, verificationType === "BVN" && styles.typeBtnTextActive]}>BVN</Text>
        </TouchableOpacity>
      </View>

      {verificationType === "NIN" ? (
        <View style={styles.inputBox}>
          <Text style={styles.label}>NIN Number</Text>
          <TextInput
            style={styles.input}
            placeholder="11-digit NIN"
            keyboardType="number-pad"
            maxLength={11}
            value={nin}
            onChangeText={setNin}
          />
        </View>
      ) : (
        <View>
          <View style={styles.inputBox}>
            <Text style={styles.label}>Bank Account Number</Text>
            <TextInput
              style={styles.input}
              placeholder="10-digit Account Number"
              keyboardType="number-pad"
              maxLength={10}
              value={accountNumber}
              onChangeText={setAccountNumber}
            />
          </View>
          <View style={styles.inputBox}>
            <Text style={styles.label}>Bank Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Bank Code (e.g. 058 for GTB)"
              keyboardType="number-pad"
              maxLength={3}
              value={bankCode}
              onChangeText={setBankCode}
            />
          </View>
          <View style={styles.inputBox}>
            <Text style={styles.label}>BVN Number</Text>
            <TextInput
              style={styles.input}
              placeholder="11-digit BVN"
              keyboardType="number-pad"
              maxLength={11}
              value={bvn}
              onChangeText={setBvn}
            />
          </View>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#10B981" style={{ marginVertical: 20 }} />
      ) : (
        <TouchableOpacity style={styles.primaryButton} onPress={handleIdentityVerification}>
          <Text style={styles.buttonText}>Verify Identity</Text>
        </TouchableOpacity>
      )}

      {/* If already verified by NIN or BVN, show DOB field to proceed */}
      {(userData.has_bvn || userData.has_nin) && (
        <View style={styles.verifiedNextSection}>
          <Text style={styles.successText}>✓ ID Verified Successfully</Text>
          <View style={styles.inputBox}>
            <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 1990-12-31"
              value={dob}
              onChangeText={setDob}
              maxLength={10}
            />
          </View>
          <TouchableOpacity style={styles.secondaryButton} onPress={generatePermanentAccount}>
            <Text style={styles.buttonText}>Finalize Setup</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const Step3Result = () => (
    <View style={styles.resultContainer}>
      <Text style={styles.stepTitle}>Account Details</Text>
      <Text style={styles.stepDescription}>Use these details to fund your wallet instantly.</Text>

      {accountDetails && accountDetails.map((acc, i) => (
        <LinearGradient
          key={i}
          colors={['#10B981', '#059669']}
          style={styles.atmCard}
        >
          <View style={styles.cardInfo}>
            <Text style={styles.cardBank}>{acc.bankName}</Text>
            <Text style={styles.cardNum}>{acc.accountNumber}</Text>
            <Text style={styles.cardName}>{acc.accountName.toUpperCase()}</Text>
          </View>
          <Ionicons name="card" size={40} color="rgba(255,255,255,0.3)" />
        </LinearGradient>
      ))}

      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.buttonText}>Go to Home</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KYC & Accounts</Text>
        <View style={{ width: 24 }} />
      </View>

      <ProgressBar />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {currentStep === 1 && <Step1Info />}
        {currentStep === 2 && <Step2Identify />}
        {currentStep === 3 && <Step3Result />}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1F2937" },
  scrollContent: { padding: 20 },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#fff",
  },
  stepWrapper: { flexDirection: "row", alignItems: "center" },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  stepActive: { backgroundColor: "#10B981" },
  stepInactive: { backgroundColor: "#E5E7EB" },
  stepText: { color: "#fff", fontWeight: "bold" },
  stepLine: { height: 2, width: 60, marginHorizontal: -5, zIndex: 1 },
  lineActive: { backgroundColor: "#10B981" },
  lineInactive: { backgroundColor: "#E5E7EB" },
  stepCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    alignItems: "center",
  },
  stepIcon: { marginBottom: 20 },
  stepTitle: { fontSize: 22, fontWeight: "bold", color: "#111827", marginBottom: 12 },
  stepDescription: { fontSize: 14, color: "#6B7280", textAlign: "center", lineHeight: 22, marginBottom: 30 },
  primaryButton: {
    backgroundColor: "#10B981",
    width: "100%",
    height: 54,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#059669",
    width: "100%",
    height: 54,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  typeSwitcher: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
    width: "100%",
  },
  typeBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  typeBtnActive: { backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  typeBtnText: { color: "#6B7280", fontWeight: "600" },
  typeBtnTextActive: { color: "#10B981" },
  inputBox: { width: "100%", marginBottom: 15 },
  label: { fontSize: 12, fontWeight: "600", color: "#4B5563", marginBottom: 6, marginLeft: 4 },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 15,
  },
  verifiedNextSection: { width: "100%", marginTop: 30, borderTopWidth: 1, borderTopColor: "#F3F4F6", paddingTop: 20 },
  successText: { color: "#10B981", fontWeight: "bold", textAlign: "center", marginBottom: 15 },
  resultContainer: { alignItems: "center" },
  atmCard: {
    width: "100%",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  cardInfo: { flex: 1 },
  cardBank: { color: "rgba(255,255,255,0.8)", fontSize: 12, textTransform: "uppercase" },
  cardNum: { color: "#fff", fontSize: 20, fontWeight: "bold", marginVertical: 4, letterSpacing: 1 },
  cardName: { color: "#fff", fontSize: 14, fontWeight: "500" },
  doneButton: {
    backgroundColor: "#111827",
    width: "100%",
    height: 54,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
});

export default CreateVirtualAccountScreen;

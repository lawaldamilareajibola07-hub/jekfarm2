import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons as Icon } from "@expo/vector-icons";
import Menu from "../assets/menu.png";
import api from "../api/axios";

const CompleteProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = useState(false);

  // Get email/token from params or storage
  const [email, setEmail] = useState(route.params?.email || "");
  const token = route.params?.token;

  useEffect(() => {
    const fetchEmail = async () => {
      if (!email) {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setEmail(user.email);
        }
      }
    };
    fetchEmail();
  }, []);

  const [nin, setNin] = useState("");
  const [bvn, setBvn] = useState("");

  const handleSave = async () => {
    if (!nin && !bvn) {
      Alert.alert("Error", "Please enter at least NIN or BVN to continue.");
      return;
    }

    if ((nin && nin.length !== 11) || (bvn && bvn.length !== 11)) {
      Alert.alert("Error", "NIN and BVN must be 11 digits.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/update_kyc.php", { email, nin, bvn });

      const data = response.data;

      if (data.status === "success") {
        // Update local user data if needed
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (nin) user.nin_number = nin;
          if (bvn) user.customer_bvn = bvn;
          await AsyncStorage.setItem("user", JSON.stringify(user));
        }

        Alert.alert("Success", "Profile updated! Your account is ready.", [
          {
            text: "Continue", onPress: () => {
              // Navigate based on role (retrieved from storage or params)
              // For now, default to MainTabs or check role
              checkRoleAndNavigate();
            }
          }
        ]);

      } else {
        Alert.alert("Error", data.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const checkRoleAndNavigate = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.role === 'farmer') {
          navigation.replace("FarmerTabs");
        } else {
          navigation.replace("MainTabs");
        }
      } else {
        navigation.replace("Login");
      }
    } catch (e) {
      navigation.replace("Login");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10 }}>
            <Icon name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Image source={Menu} style={{ width: 40, height: 40 }} />
            <Text style={styles.titleText}> Complete Profile</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.infoText}>
            To generate your dedicated virtual account for payments, we need your NIN or BVN.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>NIN (National Identity Number)</Text>
            <TextInput
              style={styles.input}
              placeholder="11-digit NIN"
              keyboardType="number-pad"
              maxLength={11}
              value={nin}
              onChangeText={setNin}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>BVN (Bank Verification Number)</Text>
            <TextInput
              style={styles.input}
              placeholder="11-digit BVN"
              keyboardType="number-pad"
              maxLength={11}
              value={bvn}
              onChangeText={setBvn}
            />
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save & Continue</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => checkRoleAndNavigate()} style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={{ color: '#6b7280' }}>Skip for now (Account generation may fail)</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CompleteProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8", padding: 20 },
  header: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  titleContainer: {
    backgroundColor: "#d6f5dc",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    width: "100%",
  },
  titleText: { fontSize: 16, fontWeight: "600", color: "#000" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  infoText: { color: "#374151", fontSize: 14, marginBottom: 20, lineHeight: 20 },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, color: "#374151", marginBottom: 6, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  saveButton: {
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});

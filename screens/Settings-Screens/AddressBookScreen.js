import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import api from "../../api/api";

export default function AddressBookScreen({ navigation }) {
  const [savedAddress, setSavedAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [label, setLabel] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const response = await api.get("/addresses/get.php");
        if (response.data.status === "success" && response.data.addresses?.length > 0) {
          const addr = response.data.addresses[0];
          setSavedAddress(addr);
          setLabel(addr.label || "");
          setFullName(addr.full_name || ""); // Assuming backend might support this
          setPhone(addr.phone || ""); // Assuming backend might support this
          setAddress(addr.address || "");
          setCity(addr.city || "");
          setState(addr.state || "");
          setZip(addr.postal_code || "");
        }
      } catch (err) {
        console.error("Fetch address error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAddress();
  }, []);

  const handleUpdateAddress = async () => {
    if (!label || !fullName || !phone || !address || !city || !state || !zip) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setSaving(true);
    try {
      const endpoint = savedAddress ? "/addresses/update.php" : "/addresses/add.php";
      const payload = {
        label,
        full_name: fullName,
        phone,
        address,
        city,
        state,
        postal_code: zip,
        ...(savedAddress ? { id: savedAddress.id } : {}),
      };

      const response = await api.post(endpoint, payload);
      if (response.data.status === "success") {
        Alert.alert("Success", "Address updated successfully!");
        navigation.goBack();
      } else {
        Alert.alert("Error", response.data.message || "Failed to update address");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong!");
    } finally {
      setSaving(false);
    }
  };

  const InputField = ({ label: fieldLabel, value, onChangeText, placeholder }) => (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>{fieldLabel}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Address Book</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <InputField label="Label" value={label} onChangeText={setLabel} placeholder="e.g. Home" />
          <InputField label="Full Name" value={fullName} onChangeText={setFullName} placeholder="Enter full name" />
          <InputField label="Phone" value={phone} onChangeText={setPhone} placeholder="Enter phone number" />
          <InputField label="Address" value={address} onChangeText={setAddress} placeholder="Enter address" />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <InputField label="City" value={city} onChangeText={setCity} placeholder="City" />
            </View>
            <View style={{ flex: 1 }}>
              <InputField label="State" value={state} onChangeText={setState} placeholder="State" />
            </View>
          </View>

          <InputField label="ZIP" value={zip} onChangeText={setZip} placeholder="Enter ZIP code" />
        </View>

        <TouchableOpacity
          style={styles.updateButton}
          onPress={handleUpdateAddress}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.updateText}>Update Address</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  form: {
    marginTop: 10,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    height: 54,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  updateButton: {
    backgroundColor: "#10B981",
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  updateText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

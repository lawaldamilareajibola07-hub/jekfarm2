import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

const BASE_URL = "https://productionbackend2.agreonpay.com.ng/api";

export default function VendorStoreSettingsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [form, setForm] = useState({
    storeName: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    logoUrl: "",
    isOpen: true,
    returnPolicy: "",
    deliveryInfo: "",
  });

  const fetchProfile = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const res = await axios.get(
        `${BASE_URL}/commerce/vendor/store/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = res.data?.data || {};
      setForm({
        storeName: data.storeName || "",
        description: data.description || "",
        phone: data.phone || "",
        email: data.email || "",
        address: data.address || "",
        logoUrl: data.logoUrl || data.logo || "",
        isOpen: data.isOpen ?? true,
        returnPolicy: data.returnPolicy || "",
        deliveryInfo: data.deliveryInfo || "",
      });
    } catch (err) {
      console.log("Fetch store profile error:", err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const handleSave = async () => {
    if (!form.storeName.trim()) {
      Alert.alert("Validation", "Store name is required.");
      return;
    }
    setSaving(true);
    try {
      const token = await SecureStore.getItemAsync("token");
      await axios.put(
        `${BASE_URL}/commerce/vendor/store/profile`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Success", "Store profile updated successfully.");
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.message || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePickLogo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow access to your photo library.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      const uri = result.assets[0].uri;
      setUploadingLogo(true);
      try {
        const token = await SecureStore.getItemAsync("token");
        const formData = new FormData();
        formData.append("logo", {
          uri,
          name: "store-logo.jpg",
          type: "image/jpeg",
        });
        const res = await axios.post(
          `${BASE_URL}/commerce/vendor/store/logo`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        const newLogoUrl = res.data?.data?.logoUrl || uri;
        setForm((prev) => ({ ...prev, logoUrl: newLogoUrl }));
        Alert.alert("Success", "Logo updated.");
      } catch (err) {
        Alert.alert("Error", "Could not upload logo.");
      } finally {
        setUploadingLogo(false);
      }
    }
  };

  const updateField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2D6A4F" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Store Settings</Text>
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Logo */}
      <View style={styles.logoSection}>
        <TouchableOpacity style={styles.logoWrap} onPress={handlePickLogo}>
          {uploadingLogo ? (
            <ActivityIndicator size="large" color="#2D6A4F" />
          ) : form.logoUrl ? (
            <Image source={{ uri: form.logoUrl }} style={styles.logoImage} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Ionicons name="storefront-outline" size={36} color="#9CA3AF" />
            </View>
          )}
          <View style={styles.logoEditBadge}>
            <Ionicons name="camera" size={14} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        <Text style={styles.logoHint}>Tap to change store logo</Text>
      </View>

      {/* Store Status */}
      <View style={styles.card}>
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Store Status</Text>
            <Text style={styles.switchSub}>
              {form.isOpen ? "Your store is open to customers" : "Store is currently closed"}
            </Text>
          </View>
          <Switch
            value={form.isOpen}
            onValueChange={(v) => updateField("isOpen", v)}
            trackColor={{ false: "#E5E7EB", true: "#B7E4C7" }}
            thumbColor={form.isOpen ? "#2D6A4F" : "#9CA3AF"}
          />
        </View>
      </View>

      {/* Basic Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <View style={styles.card}>
          <InputField
            label="Store Name *"
            value={form.storeName}
            onChangeText={(v) => updateField("storeName", v)}
            placeholder="e.g. Green Harvest Farm"
          />
          <InputField
            label="Description"
            value={form.description}
            onChangeText={(v) => updateField("description", v)}
            placeholder="Tell customers about your store..."
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      {/* Contact Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.card}>
          <InputField
            label="Phone Number"
            value={form.phone}
            onChangeText={(v) => updateField("phone", v)}
            placeholder="+234 800 000 0000"
            keyboardType="phone-pad"
          />
          <InputField
            label="Email"
            value={form.email}
            onChangeText={(v) => updateField("email", v)}
            placeholder="store@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <InputField
            label="Store Address"
            value={form.address}
            onChangeText={(v) => updateField("address", v)}
            placeholder="Full address or pickup location"
            multiline
            numberOfLines={2}
          />
        </View>
      </View>

      {/* Policies */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Store Policies</Text>
        <View style={styles.card}>
          <InputField
            label="Return Policy"
            value={form.returnPolicy}
            onChangeText={(v) => updateField("returnPolicy", v)}
            placeholder="e.g. Returns accepted within 7 days..."
            multiline
            numberOfLines={3}
          />
          <InputField
            label="Delivery Information"
            value={form.deliveryInfo}
            onChangeText={(v) => updateField("deliveryInfo", v)}
            placeholder="e.g. Delivery within Lagos in 2-3 days..."
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: "#DC2626" }]}>Account</Text>
        <TouchableOpacity
          style={styles.dangerBtn}
          onPress={() => navigation.navigate("SettingsSecurity")}
        >
          <Ionicons name="shield-outline" size={18} color="#DC2626" />
          <Text style={styles.dangerBtnText}>Security Settings</Text>
          <Ionicons name="chevron-forward" size={16} color="#DC2626" style={{ marginLeft: "auto" }} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  numberOfLines,
  keyboardType,
  autoCapitalize,
}) {
  return (
    <View style={inputStyles.wrap}>
      <Text style={inputStyles.label}>{label}</Text>
      <TextInput
        style={[
          inputStyles.input,
          multiline && { height: numberOfLines * 24 + 16, textAlignVertical: "top" },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType || "default"}
        autoCapitalize={autoCapitalize || "sentences"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  title: { fontSize: 20, fontWeight: "700", color: "#111827" },
  saveBtn: {
    backgroundColor: "#2D6A4F",
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 10,
    minWidth: 68,
    alignItems: "center",
  },
  saveBtnText: { color: "#FFFFFF", fontWeight: "600", fontSize: 14 },

  logoSection: { alignItems: "center", paddingVertical: 24 },
  logoWrap: { position: "relative" },
  logoImage: { width: 90, height: 90, borderRadius: 20 },
  logoPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  logoEditBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#2D6A4F",
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  logoHint: { fontSize: 12, color: "#9CA3AF", marginTop: 8 },

  section: { paddingHorizontal: 16, paddingTop: 4 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 4,
    marginTop: 16,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  switchLabel: { fontSize: 15, fontWeight: "600", color: "#111827" },
  switchSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },

  dangerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  dangerBtnText: { fontSize: 14, fontWeight: "600", color: "#DC2626" },
});

const inputStyles = StyleSheet.create({
  wrap: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  label: { fontSize: 12, fontWeight: "600", color: "#6B7280", marginBottom: 6 },
  input: {
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
});
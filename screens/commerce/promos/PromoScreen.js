import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";

import Animated, { FadeInUp } from "react-native-reanimated";
import { getPromos, applyPromoCode } from "../../../api/commerce/promos";

export default function PromoScreen({ navigation, route }) {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      const res = await getPromos();
      setPromos(res.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!code.trim()) return Alert.alert("Error", "Please enter a promo code");

    try {
      const res = await applyPromoCode(code.trim());
      if (res.data.success) {
        Alert.alert("Success", "Promo code applied successfully");
        if (route.params?.onApply) route.params.onApply(res.data.discount);
      } else {
        Alert.alert("Failed", res.data.message || "Invalid promo code");
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to apply promo code");
    }
  };

  const renderItem = ({ item, index }) => (
    <Animated.View entering={FadeInUp.delay(index * 50)} style={styles.card}>
      <Text style={styles.title}>{item.code}</Text>
      <Text style={styles.desc}>{item.description}</Text>
      <Text style={styles.expiry}>Expires: {new Date(item.expiry_date).toLocaleDateString()}</Text>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter promo code"
        value={code}
        onChangeText={setCode}
      />
      <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
        <Text style={styles.applyText}>Apply</Text>
      </TouchableOpacity>

      <FlatList
        data={promos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  input: {
    margin: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  applyBtn: {
    marginHorizontal: 16,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#1a8917",
    alignItems: "center",
    marginBottom: 12,
  },
  applyText: { color: "#fff", fontWeight: "700" },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: "700", color: "#1a8917" },
  desc: { marginTop: 4, color: "#555" },
  expiry: { marginTop: 4, color: "#999", fontSize: 12 },
});
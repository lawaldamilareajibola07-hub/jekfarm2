import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { getAddresses, deleteAddress } from "../../../api/commerce/address";
import { Ionicons } from "@expo/vector-icons";

export default function AddressListScreen({ navigation }) {
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await getAddresses();
      setAddresses(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this address?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAddress(id);
            fetchAddresses();
          } catch (err) {
            console.log(err);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item, index }) => (
    <Animated.View entering={FadeInUp.delay(index * 50)} style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.full_name}</Text>
        <Text style={styles.address}>{item.address_line}, {item.city}, {item.state}</Text>
        <Text style={styles.phone}>{item.phone}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => navigation.navigate("AddEditAddress", { address: item })}>
          <Ionicons name="pencil" size={20} color="#1a8917" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ marginTop: 10 }}>
          <Ionicons name="trash" size={20} color="#d11a2a" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate("AddEditAddress")}
      >
        <Text style={styles.addText}>Add New Address</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  name: { fontWeight: "700", fontSize: 16 },
  address: { marginTop: 4, color: "#555" },
  phone: { marginTop: 2, color: "#999" },
  actions: { marginLeft: 10, justifyContent: "center" },
  addBtn: {
    margin: 16,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#1a8917",
    alignItems: "center",
  },
  addText: { color: "#fff", fontWeight: "700" },
});
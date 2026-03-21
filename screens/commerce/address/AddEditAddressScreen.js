import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { addAddress, updateAddress } from "../../../api/commerce/address";

export default function AddEditAddressScreen({ navigation, route }) {
  const address = route.params?.address;
  const [fullName, setFullName] = useState(address?.full_name || "");
  const [phone, setPhone] = useState(address?.phone || "");
  const [addressLine, setAddressLine] = useState(address?.address_line || "");
  const [city, setCity] = useState(address?.city || "");
  const [state, setState] = useState(address?.state || "");
  const [zipCode, setZipCode] = useState(address?.zip_code || "");
  const [country, setCountry] = useState(address?.country || "");

  const handleSave = async () => {
    if (!fullName || !phone || !addressLine || !city || !state || !country) {
      return Alert.alert("Error", "Please fill all required fields");
    }

    try {
      if (address) {
        await updateAddress(address.id, { full_name: fullName, phone, address_line: addressLine, city, state, zip_code: zipCode, country });
      } else {
        await addAddress({ full_name: fullName, phone, address_line: addressLine, city, state, zip_code: zipCode, country });
      }
      Alert.alert("Success", "Address saved successfully");
      navigation.goBack();
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to save address");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
      <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Address Line" value={addressLine} onChangeText={setAddressLine} />
      <TextInput style={styles.input} placeholder="City" value={city} onChangeText={setCity} />
      <TextInput style={styles.input} placeholder="State" value={state} onChangeText={setState} />
      <TextInput style={styles.input} placeholder="Zip Code" value={zipCode} onChangeText={setZipCode} keyboardType="number-pad" />
      <TextInput style={styles.input} placeholder="Country" value={country} onChangeText={setCountry} />
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>Save Address</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  input: {
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  saveBtn: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#1a8917",
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "700" },
});
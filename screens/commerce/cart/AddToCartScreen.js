import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { addToCart } from "../../../api/commerce/cart";

export default function AddToCartScreen({ route, navigation }) {
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const increment = () => {
    if (quantity < parseFloat(product.stock_quantity)) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrement = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, quantity, notes);
      Alert.alert("Success", `${product.name} added to cart`);
      navigation.goBack();
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to add to cart");
    }
  };

  const subtotal = (quantity * parseFloat(product.price)).toFixed(2);

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInUp}>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.price}>₦{product.price} per {product.unit}</Text>
        <Text style={styles.stock}>Available: {product.stock_quantity}</Text>

        <View style={styles.quantityContainer}>
          <TouchableOpacity style={styles.qtyBtn} onPress={decrement}><Text style={styles.qtyText}>–</Text></TouchableOpacity>
          <Text style={styles.qtyValue}>{quantity}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={increment}><Text style={styles.qtyText}>+</Text></TouchableOpacity>
        </View>

        <Text style={styles.subtotal}>Subtotal: ₦{subtotal}</Text>

        <TextInput
          style={styles.notes}
          placeholder="Add a note (optional)"
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <TouchableOpacity style={styles.addBtn} onPress={handleAddToCart}>
          <Text style={styles.addText}>Add to Cart</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  price: { fontSize: 16, color: "#1a8917", marginBottom: 4 },
  stock: { fontSize: 14, color: "#555", marginBottom: 16 },
  quantityContainer: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  qtyBtn: { padding: 12, backgroundColor: "#eee", borderRadius: 8 },
  qtyText: { fontSize: 18, fontWeight: "700" },
  qtyValue: { fontSize: 18, fontWeight: "700", marginHorizontal: 16 },
  subtotal: { fontSize: 16, fontWeight: "600", marginBottom: 16 },
  notes: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    height: 80,
  },
  addBtn: {
    backgroundColor: "#1a8917",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  addText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
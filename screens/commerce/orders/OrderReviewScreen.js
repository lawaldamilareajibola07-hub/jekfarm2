import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";

import Animated, { FadeInUp } from "react-native-reanimated";
import { submitProductReview, getOrderProducts } from "../../../api/commerce/orders";
import { Ionicons } from "@expo/vector-icons";

export default function OrderReviewScreen({ route, navigation }) {
  const { orderId } = route.params;
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchOrderProducts();
  }, []);

  const fetchOrderProducts = async () => {
    try {
      const res = await getOrderProducts(orderId);
      const productsWithRating = res.data.data.map((p) => ({ ...p, rating: 0, comment: "" }));
      setProducts(productsWithRating);
    } catch (err) {
      console.log(err);
    }
  };

  const handleRating = (index, value) => {
    const updated = [...products];
    updated[index].rating = value;
    setProducts(updated);
  };

  const handleComment = (index, text) => {
    const updated = [...products];
    updated[index].comment = text;
    setProducts(updated);
  };

  const handleSubmit = async () => {
    try {
      await submitProductReview(orderId, products);
      Alert.alert("Success", "Reviews submitted successfully");
      navigation.goBack();
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to submit reviews");
    }
  };

  const renderStars = (rating, onPress) => {
    return [...Array(5)].map((_, i) => (
      <TouchableOpacity key={i} onPress={() => onPress(i + 1)}>
        <Ionicons
          name={i < rating ? "star" : "star-outline"}
          size={24}
          color="#f1c40f"
          style={{ marginRight: 4 }}
        />
      </TouchableOpacity>
    ));
  };

  const renderItem = ({ item, index }) => (
    <Animated.View entering={FadeInUp.delay(index * 50)} style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <View style={styles.starsRow}>{renderStars(item.rating, (val) => handleRating(index, val))}</View>
      <TextInput
        style={styles.commentInput}
        placeholder="Leave a comment (optional)"
        multiline
        value={item.comment}
        onChangeText={(text) => handleComment(index, text)}
      />
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit Reviews</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  name: { fontWeight: "700", fontSize: 16, marginBottom: 8 },
  starsRow: { flexDirection: "row", marginBottom: 12 },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    minHeight: 60,
    textAlignVertical: "top",
  },
  submitBtn: {
    backgroundColor: "#1a8917",
    padding: 15,
    margin: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
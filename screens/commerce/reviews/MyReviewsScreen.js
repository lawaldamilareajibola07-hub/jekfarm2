import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { getMyReviews, updateReview, deleteReview } from "../../../api/commerce/reviews";
import { Ionicons } from "@expo/vector-icons";

export default function MyReviewsScreen({ navigation }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await getMyReviews();
      setReviews(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this review?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteReview(id);
            fetchReviews();
          } catch (err) {
            console.log(err);
          }
        },
      },
    ]);
  };

  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  const renderItem = ({ item, index }) => (
    <Animated.View entering={FadeInUp.delay(index * 50)} style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.product}>{item.product_name}</Text>
        <Text style={styles.rating}>{renderStars(item.rating)}</Text>
        <Text style={styles.comment}>{item.comment}</Text>
        <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => navigation.navigate("EditReviewScreen", { review: item, onUpdated: fetchReviews })}
        >
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
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
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
  product: { fontWeight: "700", fontSize: 16 },
  rating: { marginTop: 4, color: "#f4c430" },
  comment: { marginTop: 4, color: "#555" },
  date: { marginTop: 4, color: "#999", fontSize: 12 },
  actions: { marginLeft: 10, justifyContent: "center" },
});
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import Animated, { FadeInUp } from "react-native-reanimated";

import { getWishlist, removeFromWishlist } from "../../../api/commerce/products";

export default function WishlistScreen({ navigation }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const res = await getWishlist();
      setWishlist(res.data.data);
    } catch (error) {
      console.log("Wishlist error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
      setWishlist((prev) => prev.filter((item) => item.id !== productId));
    } catch (err) {
      console.log(err);
    }
  };

  const renderItem = ({ item, index }) => (
    <Animated.View entering={FadeInUp.delay(index * 50)} style={styles.card}>
      <TouchableOpacity
        onPress={() => navigation.navigate("ProductDetail", { productId: item.id })}
      >
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>₦{parseFloat(item.price).toLocaleString()}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item.id)}>
        <Text style={styles.removeText}>Remove</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!wishlist.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Your wishlist is empty</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={wishlist}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 16 }}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#666" },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  name: { fontWeight: "700", fontSize: 16 },
  price: { marginTop: 5, color: "#1a8917", fontWeight: "600" },
  removeBtn: { marginTop: 8, alignSelf: "flex-start" },
  removeText: { color: "#d11a2a", fontWeight: "700" },
});
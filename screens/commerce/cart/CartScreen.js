import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";

import Animated, { FadeInUp } from "react-native-reanimated";

import { getCartItems, removeCartItem } from "../../../api/commerce/cart";

export default function CartScreen({ navigation }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const res = await getCartItems();
      setCart(res.data.data);
    } catch (error) {
      console.log("Cart error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const removeItem = async (id) => {
    try {
      await removeCartItem(id);
      fetchCart();
    } catch (error) {
      console.log("Remove error", error);
    }
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const renderItem = ({ item, index }) => {
    const image =
      item.product?.images?.find((img) => img.is_primary)?.image_url ||
      item.product?.images?.[0]?.image_url;

    return (
      <Animated.View entering={FadeInUp.delay(index * 80)} style={styles.card}>
        <Image source={{ uri: image }} style={styles.image} />

        <View style={styles.info}>
          <Text style={styles.name}>{item.product.name}</Text>

          <Text style={styles.vendor}>
            {item.product.vendor?.first_name}
          </Text>

          <Text style={styles.price}>
            ₦{parseFloat(item.price).toLocaleString()}
          </Text>

          <Text style={styles.qty}>Qty: {item.quantity}</Text>
        </View>

        <TouchableOpacity onPress={() => removeItem(item.id)}>
          <Text style={styles.remove}>Remove</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>

      <FlatList
        data={cart}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
      />

      {/* Cart Summary */}
      <View style={styles.summary}>
        <Text style={styles.total}>
          Subtotal: ₦{subtotal.toLocaleString()}
        </Text>

        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => navigation.navigate("Checkout")}
        >
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    elevation: 3,
  },

  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },

  info: {
    flex: 1,
    marginLeft: 10,
  },

  name: {
    fontWeight: "600",
  },

  vendor: {
    fontSize: 12,
    color: "#666",
  },

  price: {
    marginTop: 4,
    fontWeight: "700",
    color: "#1a8917",
  },

  qty: {
    fontSize: 12,
    marginTop: 4,
  },

  remove: {
    color: "red",
    fontSize: 12,
  },

  summary: {
    borderTopWidth: 1,
    borderColor: "#eee",
    paddingTop: 15,
  },

  total: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  checkoutBtn: {
    backgroundColor: "#1a8917",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  checkoutText: {
    color: "#fff",
    fontWeight: "700",
  },
});
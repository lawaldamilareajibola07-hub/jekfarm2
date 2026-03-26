import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";

import Animated, { FadeInUp } from "react-native-reanimated";

// ✅ FIXED: correct function names matching cart.js exports
import { getCart, removeCartItem } from "../../../api/commerce/cart";

const GREEN = "#22c55e";
const GREEN_DARK = "#16a34a";

export default function CartScreen({ navigation }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCart();
      // ✅ FIXED: correct data path
      setCart(res.data || []);
    } catch (error) {
      console.log("Cart error", error);
      Alert.alert("Error", "Could not load your cart. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const removeItem = async (productId, itemId) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              setRemovingId(itemId);
              await removeCartItem(productId);
              await fetchCart();
            } catch (error) {
              console.log("Remove error", error);
              Alert.alert("Error", "Could not remove item. Please try again.");
            } finally {
              setRemovingId(null);
            }
          },
        },
      ]
    );
  };

  // ✅ FIXED: correct subtotal calculation using item.product.price
  const subtotal = cart.reduce(
    (sum, item) => sum + parseFloat(item.product?.price || 0) * item.quantity,
    0
  );

  const renderItem = ({ item, index }) => {
    const image =
      item.product?.images?.find((img) => img.is_primary)?.image_url ||
      item.product?.images?.[0]?.image_url ||
      null;

    const isRemoving = removingId === item.id;

    return (
      <Animated.View entering={FadeInUp.delay(index * 80)} style={styles.card}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={{ fontSize: 24 }}>🌿</Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.product?.name}
          </Text>

          <Text style={styles.vendor}>
            {item.product?.vendor?.first_name || "Unknown Vendor"}
          </Text>

          <Text style={styles.price}>
            ₦{parseFloat(item.product?.price || 0).toLocaleString()}
          </Text>

          <Text style={styles.qty}>Qty: {item.quantity}</Text>
        </View>

        <TouchableOpacity
          onPress={() => removeItem(item.product_id, item.id)}
          disabled={isRemoving}
        >
          {isRemoving ? (
            <ActivityIndicator size="small" color="red" />
          ) : (
            <Text style={styles.remove}>Remove</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={GREEN} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Cart</Text>
        <View style={{ width: 30 }} />
      </View>

      {cart.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 48 }}>🛒</Text>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => navigation.navigate("Marketplace")}
          >
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 180 }}
          />

          {/* ── Cart Summary ── */}
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {cart.length} item{cart.length > 1 ? "s" : ""}
              </Text>
              <Text style={styles.total}>
                ₦{subtotal.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => navigation.navigate("Checkout")}
            >
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backBtn: {
    fontSize: 30,
    color: "#111",
    lineHeight: 34,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  imagePlaceholder: {
    backgroundColor: "#e8f5e9",
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontWeight: "600",
    fontSize: 14,
    color: "#111",
  },
  vendor: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  price: {
    marginTop: 4,
    fontWeight: "700",
    color: GREEN_DARK,
    fontSize: 14,
  },
  qty: {
    fontSize: 12,
    marginTop: 4,
    color: "#555",
  },
  remove: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  shopBtn: {
    marginTop: 8,
    backgroundColor: GREEN,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  shopBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  summary: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
  total: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
  },
  checkoutBtn: {
    backgroundColor: GREEN,
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: GREEN,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  checkoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
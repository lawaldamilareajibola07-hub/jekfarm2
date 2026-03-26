import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";

import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

export default function ProductCard({ product, onPress, layout = "grid" }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  // ✅ Robust image fallback
  const image =
   product?.images?.find((img) => img.is_primary)?.image_url ||
product?.images?.find((img) => img.is_primary)?.url ||
product?.images?.[0]?.image_url ||
product?.images?.[0]?.url ||
    "https://via.placeholder.com/300";

  const vendorName = product?.vendor
    ? `${product.vendor.first_name || ""} ${product.vendor.last_name || ""}`.trim()
    : "Unknown";

  const isList = layout === "list";

  // ✅ NEW: Stock status
  const stock = Number(product?.stock_quantity ?? 0);
  const inStock = stock > 0;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        entering={FadeIn.duration(400)}
        style={[styles.card, animatedStyle, isList && styles.listCard]}
      >
        <Image
          source={{ uri: image }}
          style={[styles.image, isList && styles.listImage]}
        />

        <View style={styles.info}>
          <Text numberOfLines={2} style={styles.name}>
            {product?.name || "Unnamed Product"}
          </Text>

          <Text style={styles.vendor}>{vendorName}</Text>

          {/* ✅ NEW: Stock Display */}
          <Text
            style={[
              styles.stock,
              { color: inStock ? "#1a8917" : "#d11a2a" },
            ]}
          >
            {inStock ? `In Stock (${stock})` : "Out of Stock"}
          </Text>

          <View style={styles.bottom}>
            <Text style={styles.price}>
              ₦{parseFloat(product?.price || 0).toLocaleString()}
            </Text>

            <Text style={styles.unit}>/{product?.unit || "unit"}</Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  listCard: {
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 120,
  },
  listImage: {
    width: 110,
    height: 110,
  },
  info: {
    padding: 10,
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
  },
  vendor: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },

  // ✅ NEW STYLE
  stock: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },

  bottom: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a8917",
  },
  unit: {
    fontSize: 12,
    marginLeft: 4,
    color: "#888",
  },
});
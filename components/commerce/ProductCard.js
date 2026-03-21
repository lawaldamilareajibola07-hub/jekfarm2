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

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const image =
    product?.images?.find((img) => img.is_primary)?.image_url ||
    product?.images?.[0]?.image_url;

  const isList = layout === "list";

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        entering={FadeIn.duration(400)}
        style={[
          styles.card,
          animatedStyle,
          isList && styles.listCard
        ]}
      >

        <Image
          source={{ uri: image }}
          style={[
            styles.image,
            isList && styles.listImage
          ]}
        />

        <View style={styles.info}>
          <Text numberOfLines={2} style={styles.name}>
            {product.name}
          </Text>

          <Text style={styles.vendor}>
            {product.vendor?.first_name} {product.vendor?.last_name}
          </Text>

          <View style={styles.bottom}>
            <Text style={styles.price}>
              ₦{parseFloat(product.price).toLocaleString()}
            </Text>

            <Text style={styles.unit}>/{product.unit}</Text>
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
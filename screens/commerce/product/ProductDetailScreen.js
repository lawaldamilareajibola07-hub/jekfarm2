import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { getProductDetail } from "../../../api/commerce/products";

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const fetchProduct = async () => {
    try {
      const res = await getProductDetail(productId);
      setProduct(res.data.data);
    } catch (error) {
      console.log("Product detail error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const image =
    product?.images?.find((img) => img.is_primary)?.image_url ||
    product?.images?.[0]?.image_url;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      <Animated.Image
        entering={FadeInDown.duration(500)}
        source={{ uri: image }}
        style={styles.image}
      />

      <View style={styles.content}>
        
        <Animated.Text entering={FadeInUp.delay(100)} style={styles.name}>
          {product.name}
        </Animated.Text>

        <Animated.Text entering={FadeInUp.delay(200)} style={styles.vendor}>
          Vendor: {product.vendor?.first_name} {product.vendor?.last_name}
        </Animated.Text>

        <Animated.Text entering={FadeInUp.delay(300)} style={styles.price}>
          ₦{parseFloat(product.price).toLocaleString()}
        </Animated.Text>

        <Animated.Text entering={FadeInUp.delay(400)} style={styles.unit}>
          Unit: {product.unit}
        </Animated.Text>

        <Animated.Text entering={FadeInUp.delay(500)} style={styles.description}>
          {product.description}
        </Animated.Text>

        {/* Quantity Selector */}
        <Animated.View entering={FadeInUp.delay(600)} style={styles.qtyContainer}>
          
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => quantity > 1 && setQuantity(quantity - 1)}
          >
            <Text style={styles.qtyText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.qty}>{quantity}</Text>

          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Text style={styles.qtyText}>+</Text>
          </TouchableOpacity>

        </Animated.View>

        {/* Add To Cart */}
        <Animated.View entering={FadeInUp.delay(700)}>
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={() =>
              navigation.navigate("Cart", {
                productId: product.id,
                quantity,
              })
            }
          >
            <Text style={styles.cartText}>Add to Cart</Text>
          </TouchableOpacity>
        </Animated.View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  image: {
    width: "100%",
    height: 260,
  },

  content: {
    padding: 20,
  },

  name: {
    fontSize: 22,
    fontWeight: "700",
  },

  vendor: {
    marginTop: 5,
    color: "#666",
  },

  price: {
    fontSize: 22,
    color: "#1a8917",
    fontWeight: "700",
    marginTop: 10,
  },

  unit: {
    marginTop: 5,
    color: "#777",
  },

  description: {
    marginTop: 15,
    lineHeight: 20,
    color: "#444",
  },

  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },

  qtyBtn: {
    width: 35,
    height: 35,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },

  qtyText: {
    fontSize: 18,
    fontWeight: "700",
  },

  qty: {
    marginHorizontal: 15,
    fontSize: 18,
    fontWeight: "600",
  },

  cartBtn: {
    marginTop: 25,
    backgroundColor: "#1a8917",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  cartText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
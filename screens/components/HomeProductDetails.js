import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BASE_URL = "https://jekfarms.com.ng";

export default function ProductDetails({ route, navigation }) {
  const { product, addToCart } = route.params;

  const [qty, setQty] = useState(1);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    fetchRelated();
  }, []);

  const fetchRelated = async () => {
    try {
      const res = await fetch(`${BASE_URL}/data/products.php`);
      const data = await res.json();
      if (data.status === "success") {
        setRelated(data.products.slice(0, 5));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const discountPercent = product.old_price
    ? Math.round(
        ((product.old_price - product.price) /
          product.old_price) *
          100
      )
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* IMAGE SECTION */}
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: product.image }}
            style={styles.image}
          />

          {/* BACK BUTTON */}
          <TouchableOpacity
            style={styles.iconLeft}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#000" />
          </TouchableOpacity>

          {/* CART ICON */}
          <TouchableOpacity style={styles.iconRight}>
            <Ionicons name="cart-outline" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {/* DETAILS CARD */}
        <View style={styles.card}>
          <Text style={styles.title}>{product.name}</Text>

          {/* PRICE SECTION */}
          <View style={styles.priceRow}>
            {discountPercent && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>
                  {discountPercent}% OFF
                </Text>
              </View>
            )}

            <Text style={styles.price}>
              ₦{product.price}
            </Text>

            {product.old_price && (
              <Text style={styles.oldPrice}>
                ₦{product.old_price}
              </Text>
            )}

            {/* Quantity */}
            <View style={styles.qtyBox}>
              <TouchableOpacity
                onPress={() => qty > 1 && setQty(qty - 1)}
              >
                <Text style={styles.qtyBtn}>−</Text>
              </TouchableOpacity>

              <Text style={styles.qtyText}>{qty}</Text>

              <TouchableOpacity
                onPress={() => setQty(qty + 1)}
              >
                <Text style={styles.qtyBtn}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* TAGS */}
          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Import</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Fresh</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Non Fatty</Text>
            </View>
          </View>

          {/* DESCRIPTION */}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {product.description ||
              "High quality fresh farm product. Carefully selected and hygienically packed for delivery."}
          </Text>

          {/* RELATED PRODUCTS */}
          <Text style={styles.sectionTitle}>
            Related Products
          </Text>

          <FlatList
            horizontal
            data={related}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.relatedCard}
                onPress={() =>
                  navigation.push("ProductDetails", {
                    product: item,
                    addToCart,
                  })
                }
              >
                <Image
                  source={{ uri: item.image }}
                  style={styles.relatedImage}
                />
                <Text style={styles.relatedName}>
                  {item.name}
                </Text>
                <Text style={styles.relatedPrice}>
                  ₦{item.price}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </ScrollView>

      {/* ADD TO CART BUTTON */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() =>
            addToCart({ ...product, quantity: qty })
          }
        >
          <Ionicons
            name="cart-outline"
            size={18}
            color="#fff"
          />
          <Text style={styles.cartText}>
            Add to Cart
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  imageWrapper: { position: "relative" },
  image: { width: "100%", height: 320 },

  iconLeft: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 20,
  },

  iconRight: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 20,
  },

  card: {
    backgroundColor: "#fff",
    marginTop: -30,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },

  discountBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },

  discountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#10B981",
    marginRight: 10,
  },

  oldPrice: {
    textDecorationLine: "line-through",
    color: "#9CA3AF",
  },

  qtyBox: {
    marginLeft: "auto",
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 10,
    alignItems: "center",
  },

  qtyBtn: { fontSize: 18, paddingHorizontal: 10 },
  qtyText: { fontSize: 16 },

  tagRow: {
    flexDirection: "row",
    marginVertical: 10,
  },

  tag: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 10,
  },

  tagText: { fontSize: 12 },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 20,
  },

  description: {
    color: "#6B7280",
    marginTop: 6,
    lineHeight: 20,
  },

  relatedCard: {
    width: 130,
    marginRight: 15,
    marginTop: 15,
  },

  relatedImage: {
    width: "100%",
    height: 100,
    borderRadius: 12,
  },

  relatedName: {
    fontSize: 12,
    marginTop: 5,
  },

  relatedPrice: {
    fontWeight: "600",
    marginTop: 3,
  },

  bottomBar: {
    padding: 15,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  cartBtn: {
    backgroundColor: "#10B981",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },

  cartText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
});
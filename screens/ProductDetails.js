"use client";

import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "../CartContext";

const ProductDetails = ({ route, navigation }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const { product } = route.params || {};

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: "center", marginTop: 50 }}>
          No product data available
        </Text>
      </SafeAreaView>
    );
  }

  const relatedProducts = [
    {
      id: "1",
      name: "Australia karubi shabu meat",
      weight: "250-270g/pack",
      price: 55.0,
      image: "https://img.icons8.com/color/96/tomato.png",
    },
    {
      id: "2",
      name: "Beef meat ribeye",
      weight: "250-280g/pack",
      price: 40.0,
      image: "https://img.icons8.com/color/96/tomato.png",
    },
    {
      id: "3",
      name: "Beef meat rendang",
      weight: "450-500g/pack",
      price: 35.0,
      image: "https://img.icons8.com/color/96/tomato.png",
    },
  ];

  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
    Alert.alert("Success", `${product.name} added to cart!`);
    navigation.navigate("MainTabs", { screen: "Order" });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Product Details</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => navigation.navigate("ChatList")}
            style={styles.iconButton}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="chatbubble-outline" size={20} color="#10b981" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Product Image Card */}
        <View style={styles.imageCard}>
          <Image
            source={{
              uri: product.image_url
                ? `https://jekfarms.com.ng/jek/${product.image_url}`
                : product.image,
            }}
            style={styles.productImage}
          />
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.mainInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{product.name}</Text>
              <TouchableOpacity style={styles.favButton}>
                <Ionicons name="heart-outline" size={24} color="#ef4444" />
              </TouchableOpacity>
            </View>

            <View style={styles.metaRow}>
              {product.weight && (
                <View style={[styles.badge, styles.weightBadge]}>
                  <Ionicons name="cube-outline" size={14} color="#6b7280" />
                  <Text style={styles.weightText}>{product.weight}</Text>
                </View>
              )}
              <View style={[styles.badge, styles.stockBadge]}>
                <View style={styles.activeDot} />
                <Text style={styles.stockText}>In Stock</Text>
              </View>
            </View>

            <View style={styles.priceRow}>
              <View>
                <Text style={styles.priceLabel}>Price</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.currency}>₦</Text>
                  <Text style={styles.priceValue}>{product.price}</Text>
                </View>
              </View>

              {/* Quantity Selector */}
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  style={styles.qtyBtn}
                >
                  <Ionicons name="remove" size={20} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.qtyNumber}>{quantity}</Text>
                <TouchableOpacity
                  onPress={() => setQuantity(quantity + 1)}
                  style={styles.qtyBtn}
                >
                  <Ionicons name="add" size={20} color="#111827" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionHeading}>About Product</Text>
            <Text style={styles.descText}>
              {product.description || "Fresh and high-quality product from Jekfarms. Sourced directly from local farmers to ensure maximum freshness and nutritional value."}
            </Text>
          </View>

          {/* Related Products */}
          <View style={styles.relatedSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeading}>You May Also Like</Text>
              <TouchableOpacity>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={relatedProducts}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedList}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.relatedCard}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.relatedImage}
                  />
                  <Text style={styles.relatedName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.relatedPrice}>₦{item.price}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.totalValue}>₦{(product.price * quantity).toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.cartBtn} onPress={handleAddToCart}>
          <Ionicons name="cart" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.cartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageCard: {
    width: "100%",
    height: 300,
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    width: "80%",
    height: "80%",
    resizeMode: "contain",
  },
  detailsContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  mainInfo: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    flex: 1,
    marginRight: 16,
  },
  favButton: {
    padding: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 12,
  },
  weightBadge: {
    backgroundColor: "#f3f4f6",
  },
  stockBadge: {
    backgroundColor: "#f0fdf4",
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22c55e",
    marginRight: 6,
  },
  weightText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4b5563",
    marginLeft: 4,
  },
  stockText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#16a34a",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9ca3af",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  currency: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10b981",
    marginBottom: 4,
    marginRight: 2,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#10b981",
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 14,
    padding: 6,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  qtyNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginHorizontal: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 24,
  },
  descriptionSection: {
    marginBottom: 32,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  descText: {
    fontSize: 15,
    color: "#4b5563",
    lineHeight: 24,
  },
  relatedSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10b981",
  },
  relatedList: {
    paddingRight: 20,
  },
  relatedCard: {
    width: 140,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  relatedImage: {
    width: "100%",
    height: 100,
    resizeMode: "contain",
    marginBottom: 10,
  },
  relatedName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  relatedPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10b981",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9ca3af",
    marginBottom: 2,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  cartBtn: {
    backgroundColor: "#10b981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    height: 54,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cartText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

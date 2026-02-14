import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Platform
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import cart1Img from "../assets/cart1.png";
import cart2Img from "../assets/cart2.png";
import cart3Img from "../assets/cart3.png";
import subcart1Img from "../assets/subcart1.png";
import subcart2Img from "../assets/subcart2.png";
import subcart3Img from "../assets/subcart3.png";
import cartImg from "../assets/emptyCartState.png";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function ShoppingCartScreen() {
  const navigation = useNavigation();

  const DUMMY_CART = [
    { id: 1, name: "Omega chicken eggs", details: "0.9-1kg/pack", price: 15.0, quantity: 1, image: cart1Img, selected: true, discount: 0 },
    { id: 2, name: "Product Name Goes Here", details: "450-500gr/pack", price: 50.0, quantity: 1, image: cart2Img, selected: true, discount: 0.2 },
    { id: 3, name: "Cavendish baby banana", details: "450-500gr/pack", price: 9.0, quantity: 1, image: cart3Img, selected: true, discount: 0 },
  ];

  const DUMMY_RECOMMENDATIONS = [
    { id: 101, name: "Australia karubi shabu meat", details: "250-275gr/pack", price: 55.0, image: subcart1Img },
    { id: 102, name: "Beef meat ribeye meltic", details: "200-250gr/pack", price: 40.0, image: subcart2Img },
    { id: 103, name: "Beef meat rendang", details: "450-500gr/pack", price: 35.0, image: subcart3Img },
  ];

  const [localCart, setLocalCart] = useState(DUMMY_CART);
  const [selectAll, setSelectAll] = useState(true);

  useEffect(() => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: "none" } });

    // Cleanup when component unmounts
    return () => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: "flex" } });
    };
  }, []);

  const handleUpdateQuantity = (id, newQty) => {
    setLocalCart(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, newQty) } : item
      )
    );
  };

  const toggleItemSelection = (itemId) => {
    setLocalCart(prev => {
      const newCart = prev.map(item =>
        item.id === itemId ? { ...item, selected: !item.selected } : item
      );
      setSelectAll(newCart.every(item => item.selected));
      return newCart;
    });
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    setLocalCart(prev => prev.map(item => ({ ...item, selected: !selectAll })));
  };

  const subtotal = localCart
    .filter(item => item.selected)
    .reduce((sum, item) => sum + item.price * (1 - item.discount) * item.quantity, 0);

  const removeSelected = () => {
    setLocalCart((prevCart) => prevCart.filter((item) => !item.selected));
    setSelectAll(false);
  };

  if (!localCart || localCart.length === 0) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <Image
          source={cartImg}
          style={{size:20}}
         />
        <Text style={{ fontSize: 18, color: '#666' }}>Your cart is empty</Text>
        <TouchableOpacity
          style={{ marginTop: 20, backgroundColor: '#66A34A', padding: 12, borderRadius: 8 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Start Shopping</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Cart Items Card */}
        <View style={styles.cartCard}>
          {localCart.map(item => (
            <View key={item.id} style={styles.itemContainer}>
              <TouchableOpacity
                style={[styles.checkbox, item.selected && styles.checkboxSelected]}
                onPress={() => toggleItemSelection(item.id)}
              >
                {item.selected && <MaterialCommunityIcons name="check" size={18} color="#fff" />}
              </TouchableOpacity>

              <Image source={item.image} style={styles.itemImage} />

              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDetailsText}>{item.details}</Text>
                <Text style={styles.itemPrice}>₦{item.price.toFixed(2)}</Text>
              </View>

              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButtonDec}
                  onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                >
                  <Text style={styles.quantityButtonText}>−</Text>
                </TouchableOpacity>

                <Text style={styles.quantityText}>{item.quantity}</Text>

                <TouchableOpacity
                  style={styles.quantityButtonInc}
                  onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Recommendations Horizontal Scroll */}
        {/* <Text style={styles.recommendationTitle}>You may also like</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.recommendationList}
        >
          {DUMMY_RECOMMENDATIONS.map(item => (
            <View key={item.id} style={styles.recommendationCard}>
              <Image source={item.image} style={styles.recommendationImage} />
              <Text style={styles.recommendationName}>{item.name}</Text>
              <Text style={styles.recoDetails}>{item.details}</Text>
              <View style={styles.recoRow}>
                <Text style={styles.recommendationPrice}>₦{item.price.toFixed(2)}</Text>
                <TouchableOpacity style={styles.addButton}>
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView> */}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.checkoutRow}>
          <TouchableOpacity style={styles.selectAllBox} onPress={toggleSelectAll}>
            <View style={[styles.checkbox, selectAll && styles.checkboxSelected]}>
              {selectAll && <MaterialCommunityIcons name="check" size={18} color="#fff" />}
            </View>
            <Text style={styles.selectAllText}>Select all</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={removeSelected}
          >
            <MaterialCommunityIcons name="trash-can" size={18} color="#fff" />
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>₦{subtotal.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => navigation.navigate("Checkout", { cart: localCart, subtotal })}
          >
            <Text style={styles.checkoutButtonText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f3ededff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingTop: Platform.OS === "android" ? 50 : 20, // Added top padding for Android status bar
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    marginTop: 15,
  },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", fontWeight: "700", color: "#333" },
  container: { flex: 1 },
  cartCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkboxSelected: { backgroundColor: "#4CAF50", borderColor: "#4CAF50" },
  itemImage: { width: 100, height: 100, borderRadius: 6, marginRight: 10 },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_400Regular", color: "#333" },
  itemDetailsText: { fontSize: 12, color: "#666" },
  itemPrice: { marginTop: 15, fontFamily: "Inter_400Regular", fontWeight: "bold", fontSize: 15, color: "#1c7e41ff" },
  quantityContainer: { flexDirection: "row", alignItems: "center" },
  quantityButtonInc: { paddingHorizontal: 6, paddingVertical: 2, backgroundColor: "#c5e4c6ff", borderRadius: 10 },
  quantityButtonDec: { paddingHorizontal: 6, paddingVertical: 2, backgroundColor: "#eef0edff", borderRadius: 10 },
  quantityButtonText: { fontSize: 18, fontWeight: "bold" },
  quantityText: { marginHorizontal: 10, fontSize: 18, fontWeight: 'bold', fontFamily: "Inter_400Regular" },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  recoDetails: {
    marginVertical: 8,
    color: "#949090ff"
  },
  recoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 35
  },
  recommendationList: {
    paddingHorizontal: 16,
  },
  recommendationCard: {
    width: SCREEN_WIDTH * 0.3,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginRight: 12,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  recommendationImage: {
    width: "90%",
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
  },
  recommendationName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#333",
    height: 32,
  },
  recommendationPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#c5e4c6ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: { color: "#14a05fff", fontWeight: "bold", fontSize: 16 },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
    paddingTop: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    // Removed shadows and border radius for flat design
  },
  checkoutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  selectAllBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectAllText: {
    fontSize: 14,
    color: "#4b5563",
    marginLeft: 8,
    fontFamily: "Inter_400Regular",
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  removeButtonText: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  totalContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  totalLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    fontFamily: "Inter_700Bold",
  },
  checkoutButton: {
    flex: 1,
    backgroundColor: "#41B63E",
    paddingVertical: 16,
    borderRadius: 12, // Slightly reduced radius
    alignItems: "center",
    // Removed shadow from button as well
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
});

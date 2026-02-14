import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,

  StyleSheet,
  Dimensions,
  Platform,
  Modal,
  Alert,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../CartContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

import cart1Img from "../../assets/cart1.png";
import cart2Img from "../../assets/cart2.png";
import cart3Img from "../../assets/cart3.png";
import subcart1Img from "../../assets/subcart1.png";
import CartImg from "../../assets/emptyCartState.png";
import subcart2Img from "../../assets/subcart2.png";
import subcart3Img from "../../assets/subcart3.png";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function ShoppingCartScreen() {
  const navigation = useNavigation();

  // Add error handling for useCart
  let cartContext;
  try {
    cartContext = useCart();
  } catch (error) {
    console.error("CartContext error:", error);
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: '#ef4444', marginBottom: 10 }}>Cart Error</Text>
        <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginHorizontal: 20 }}>
          Cart is not available. Please restart the app.
        </Text>
      </SafeAreaView>
    );
  }

  // Now destructure after checking cartContext exists
  const { cartItems = [], updateQuantity, removeFromCart, subtotal = 0 } = cartContext || {};

  const [selectAll, setSelectAll] = useState(true);
  const [insufficientModal, setInsufficientModal] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: "none" } });
    fetchUserData();
    fetchRecommendations();

    return () => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: "flex" } });
    };
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch("https://jekfarms.com.ng/data/products.php?per_page=6");
      const data = await response.json();
      if (data.status === "success" && (data.products || data.data)) {
        const prods = data.products || data.data;
        // Filter out items already in cart if possible, or just take first 3
        setRecommendations(prods.slice(0, 4));
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  // Fetch user data including wallet balance
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        setUserData(user);

        if (user.wallet_balance !== undefined) {
          setWalletBalance(parseFloat(user.wallet_balance) || 0);
        } else if (user.balance !== undefined) {
          setWalletBalance(parseFloat(user.balance) || 0);
        }
      }

      fetchWalletBalance();
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch wallet balance from API
  const fetchWalletBalance = async () => {
    try {
      const walletString = await AsyncStorage.getItem('walletBalance');
      if (walletString) {
        setWalletBalance(parseFloat(walletString));
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  const handleUpdateQuantity = (id, newQty) => {
    if (updateQuantity) {
      updateQuantity(id, newQty);
    }
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
  };

  const removeSelected = () => {
    if (removeFromCart && cartItems) {
      cartItems.forEach(item => {
        if (item.selected) {
          removeFromCart(item.id);
        }
      });
      setSelectAll(false);
    }
  };

  const handleCheckout = () => {
    if (!cartItems || cartItems.length === 0) {
      Alert.alert("Empty Cart", "Please add items to your cart first.");
      return;
    }

    if (walletBalance < subtotal) {
      setInsufficientModal(true);
      return;
    }

    // Navigate to checkout with cart data
    navigation.navigate("Checkout", {
      cartItems,
      subtotal,
      deliveryFee: 20,
      totalAmount: subtotal + 20,
      walletBalance,
      userData
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#66A34A" />
      </SafeAreaView>
    );
  }

  const renderEmptyCart = () => (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', flex: 1, paddingHorizontal: 20 }]}>
      <Image source={CartImg} style={{ marginBottom: 20, width: 200, height: 200, resizeMode: 'contain' }} />
      <Text style={styles.memptyText}>Empty Cart</Text>
      <Text style={{ fontSize: 18, color: '#666', marginBottom: 30, textAlign: 'center' }}>Oops! your cart is empty</Text>
      <TouchableOpacity
        style={{ backgroundColor: '#66A34A', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 8 }}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  if (!cartItems || cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {/* Single header for both empty and non-empty states */}

        {renderEmptyCart()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>


      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={styles.cartCard}>
          {cartItems.map(item => (
            <View key={item.id} style={styles.itemContainer}>
              <TouchableOpacity
                style={[styles.checkbox, selectAll && styles.checkboxSelected]}
                onPress={() => { }}
              >
                {selectAll && <MaterialCommunityIcons name="check" size={18} color="#fff" />}
              </TouchableOpacity>

              <Image source={item.image || cart1Img} style={styles.itemImage} />

              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDetailsText}>{item.description || item.details}</Text>
                <Text style={styles.itemPrice}>₦{(item.price || item.originalPrice || 0).toFixed(2)}</Text>
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

        {/* Wallet Balance Display */}
        <View style={styles.walletContainer}>
          <View style={styles.walletBalanceRow}>
            <Text style={styles.walletLabel}>Wallet Balance:</Text>
            <Text style={[
              styles.walletAmount,
              { color: walletBalance < subtotal ? '#ef4444' : '#10b981' }
            ]}>
              ₦{walletBalance.toFixed(2)}
            </Text>
          </View>
          {walletBalance < subtotal && (
            <Text style={styles.insufficientText}>
              You need ₦{(subtotal - walletBalance).toFixed(2)} more to checkout
            </Text>
          )}
        </View>

        <Text style={styles.recommendationTitle}>You may also like</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recommendationList}
        >
          {recommendations.map(item => (
            <View key={item.id} style={styles.recommendationCard}>
              <Image
                source={item.image_url ? { uri: item.image_url.startsWith('http') ? item.image_url : `https://jekfarms.com.ng/${item.image_url}` } : cart1Img}
                style={styles.recommendationImage}
              />
              <Text style={styles.recommendationName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.recoDetails}>{item.category_name || "Farm Produce"}</Text>
              <View style={styles.recoRow}>
                <Text style={styles.recommendationPrice}>₦{parseFloat(item.price || 0).toFixed(2)}</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    if (addToCart) {
                      addToCart(item);
                      Alert.alert("Added", `${item.name} added to cart`);
                    }
                  }}
                >
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </ScrollView>

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
            style={[
              styles.checkoutButton,
              walletBalance < subtotal && styles.checkoutButtonDisabled
            ]}
            onPress={handleCheckout}
            disabled={walletBalance < subtotal}
          >
            <Text style={styles.checkoutButtonText}>
              {walletBalance < subtotal ? 'Insufficient Funds' : 'Checkout'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Insufficient Balance Modal */}
      <Modal
        visible={insufficientModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setInsufficientModal(false)}
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 24, width: "80%", maxWidth: 400 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>Insufficient Balance</Text>
            <Text style={{ fontSize: 16, color: "#666", marginBottom: 8 }}>
              Current Balance: ₦{walletBalance.toFixed(2)}
            </Text>
            <Text style={{ fontSize: 16, color: "#666", marginBottom: 8 }}>
              Order Total: ₦{subtotal.toFixed(2)}
            </Text>
            <Text style={{ fontSize: 16, color: "#666", marginBottom: 20 }}>
              You need ₦{(subtotal - walletBalance).toFixed(2)} more to place this order.
              Add funds to your wallet to continue.
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <TouchableOpacity
                style={{ flex: 1, padding: 12, alignItems: "center", marginRight: 8 }}
                onPress={() => setInsufficientModal(false)}
              >
                <Text style={{ color: "#666" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: "#10b981", padding: 12, borderRadius: 8, alignItems: "center", marginLeft: 8 }}
                onPress={() => {
                  setInsufficientModal(false);
                  navigation.navigate("WalletBalanceScreen", {
                    refreshBalance: fetchWalletBalance
                  });
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Add Funds</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },



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
    borderWidth: 1,
    borderColor: "#f0f0f0",
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
  quantityButtonInc: { paddingHorizontal: 6, paddingVertical: 2, backgroundColor: "#c5e4c6ff", color: "#14a05fff", borderRadius: 10 },
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
    width: SCREEN_WIDTH * 0.42,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginRight: 12,
    padding: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  recommendationImage: {
    width: "100%",
    height: 110,
    borderRadius: 8,
    marginBottom: 8,
    resizeMode: "cover",
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

  walletContainer: {
    marginHorizontal: 12,
    backgroundColor: '#5dca87ff',
    marginVertical: 10,
    borderRadius: 8,
    padding: 16
  },

  walletAmount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    backgroundColor: "#fff",
    padding: 4,
    borderRadius: 5,
    width: 100
  },

  walletLabel: {
    color: '#fff',
    fontFamily: "Inter_400Regular"
  },
  insufficientText: {
    color: '#fff'
  },

  memptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 26,
    fontWeight: "600",
    marginVertical: 10
  },

  // --- Footer Styles ---
  footer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 54,
    paddingTop: 20,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  checkoutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
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
    backgroundColor: "#EF4444",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  removeButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
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
    borderRadius: 12,
    alignItems: "center",
  },
  checkoutButtonDisabled: {
    backgroundColor: "#ccc",
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  walletBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: "#66A34A",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});
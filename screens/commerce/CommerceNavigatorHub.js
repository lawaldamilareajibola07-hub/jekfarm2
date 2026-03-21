import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

const commerceScreens = [
  { title: "Marketplace", route: "Marketplace" },
  { title: "Product Details", route: "ProductDetails" },
  { title: "Product Image Gallery", route: "ProductGallery" },

  { title: "Cart Screen", route: "Cart" },
  { title: "Add To Cart", route: "AddToCart" },
  { title: "Empty Cart", route: "EmptyCart" },

  { title: "Checkout", route: "Checkout" },
  { title: "Order Success", route: "OrderSuccess" },

  { title: "Orders", route: "Orders" },
  { title: "Order Detail", route: "OrderDetail" },
  { title: "Order Tracking", route: "OrderTracking" },
  { title: "Order Review", route: "OrderReview" },
  { title: "Order Cancel Refund", route: "OrderCancelRefund" },
  { title: "Delivery Confirmation", route: "DeliveryConfirmation" },

  { title: "Search", route: "SearchProducts" },
  { title: "Filter & Sort", route: "FilterSort" },

  { title: "Wishlist", route: "Wishlist" },
  { title: "Empty Cart ", route: "EmptyCart" },
  { title: "Empty Wishlist", route: "EmptyWishlist" },

  { title: "Notifications", route: "Notifications" },

  { title: "Profile", route: "Profile" },
  { title: "Transaction History", route: "TransactionHistory" },
  { title: "Wallet", route: "Wallet" },

  { title: "Payment Methods", route: "PaymentMethods" },
  { title: "Add/Edit Payment Method", route: "AddEditPaymentMethod" },

  { title: "My Reviews", route: "MyReviews" },

  { title: "Vendor Store", route: "VendorStore" },

  { title: "Address List", route: "AddressList" },
  { title: "Add/Edit Address", route: "AddEditAddress" },

  { title: "Promo Screen", route: "Promo" },

  { title: "FAQ / Help", route: "FAQ" },

  { title: "Dispute Detail", route: "DisputeDetail" },

  { title: "Terms & Policies", route: "TermsPolicies" },
];

export default function CommerceNavigatorHub() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Commerce Screens</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {commerceScreens.map((item, index) => (
          <Animated.View
            key={index}
            entering={FadeInDown.delay(index * 70).springify()}
          >
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate(item.route)}
            >
              <Ionicons name="arrow-forward-circle" size={20} color="#2F80ED" />
              <Text style={styles.text}>{item.title}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  header: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 25,
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },

    elevation: 3,
  },

  text: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: "500",
  },
});
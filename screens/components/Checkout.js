import React, { useState, useEffect } from "react";
import { 
   View, Text, FlatList, TouchableOpacity, 
  Alert, ActivityIndicator, Modal, StyleSheet,
  Image, Dimensions 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
// Corrected import for CartContext
import { useCart } from "../../context/CartContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Add this import for your image (update the path as needed)
import confirmOrderBg from "../../assets/AgreonIcon.jpeg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Checkout() {
  const navigation = useNavigation();
  const route = useRoute();
  const { clearCart } = useCart();
  
  const { 
    cartItems = [], 
    subtotal = 0, 
    totalAmount = 0,
    walletBalance = 0,
    userData: routeUserData
  } = route.params || {};

  const [placingOrder, setPlacingOrder] = useState(false);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [orderId, setOrderId] = useState(null);

  // Calculate total from cart items to ensure accuracy
  const calculatedSubtotal = cartItems.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  // Use calculated subtotal if it doesn't match passed totalAmount
  const finalTotal = totalAmount === subtotal ? totalAmount : calculatedSubtotal;

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('user');
      if (data) {
        setUserData(JSON.parse(data));
      } else if (routeUserData) {
        setUserData(routeUserData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handlePlaceOrder = async () => {
    if (walletBalance < finalTotal) {
      setShowInsufficientModal(true);
      return;
    }

    // Show the custom confirm modal
    setShowConfirmModal(true);
  };

  const handleConfirmOrder = () => {
    setShowConfirmModal(false);
    processOrder();
  };

  const handleCancelOrder = () => {
    setShowConfirmModal(false);
  };

  const processOrder = async () => {
    try {
      setPlacingOrder(true);
      
      // 1. First, create the order
      const orderPayload = {
        order_type: "single",
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }))
      };

      console.log("Creating order with payload:", orderPayload);

      const createOrderResponse = await fetch("https://jekfarms.com.ng/orders/create_order.php", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(orderPayload)
      });

      const orderResult = await createOrderResponse.json();
      console.log("Order creation response:", orderResult);

      if (!createOrderResponse.ok) {
        throw new Error(orderResult.message || "Failed to create order");
      }

      if (orderResult.status === "success" && orderResult.order_id) {
        const createdOrderId = orderResult.order_id;
        setOrderId(createdOrderId);
        
        // 2. Now pay for the order
        await processPayment(createdOrderId);
      } else {
        throw new Error(orderResult.message || "Invalid response from server");
      }
    } catch (error) {
      console.error("Order processing error:", error);
      Alert.alert(
        "Order Failed", 
        error.message || "An error occurred while creating your order. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  const processPayment = async (orderId) => {
    try {
      console.log("Processing payment for order:", orderId);
      
      const paymentResponse = await fetch("https://jekfarms.com.ng/orders/pay_order.php", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ order_id: orderId })
      });

      const paymentResult = await paymentResponse.json();
      console.log("Payment response:", paymentResult);

      if (!paymentResponse.ok) {
        throw new Error(paymentResult.message || "Payment failed");
      }

      if (paymentResult.status === "success") {
        // Payment successful
        await handleSuccessfulOrder(orderId, paymentResult);
      } else {
        throw new Error(paymentResult.message || "Payment was not successful");
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      throw error;
    }
  };

  const handleSuccessfulOrder = async (orderId, paymentResult) => {
    try {
      // 1. Update wallet balance locally
      const newBalance = walletBalance - finalTotal;
      await AsyncStorage.setItem('walletBalance', newBalance.toString());
      
      // 2. Update user data in AsyncStorage if needed
      const currentUser = await AsyncStorage.getItem('user');
      if (currentUser) {
        const userObj = JSON.parse(currentUser);
        userObj.wallet_balance = newBalance;
        await AsyncStorage.setItem('user', JSON.stringify(userObj));
      }
      
      // 3. Clear the cart
      if (clearCart) {
        clearCart();
      }
      
      // 4. Navigate to success screen
      navigation.replace("OrderSuccess", { 
        orderId: orderId,
        totalAmount: finalTotal,
        customerName: userData?.name || "Customer",
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        transactionId: paymentResult.transaction_id || `TXN-${Date.now()}`,
        paymentMethod: "Wallet",
        items: cartItems
      });
    } catch (error) {
      console.error("Error in post-order processing:", error);
      navigation.replace("OrderSuccess", { 
        orderId: orderId,
        totalAmount: finalTotal,
        customerName: userData?.name || "Customer",
        date: new Date().toLocaleDateString(),
        transactionId: paymentResult.transaction_id || `TXN-${Date.now()}`,
        paymentMethod: "Wallet"
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={cartItems}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <View>
              <Text style={styles.itemName}>{item.name} x {item.quantity}</Text>
              <Text style={styles.itemPrice}>₦{item.price?.toFixed(2)}</Text>
            </View>
            <Text style={styles.itemTotal}>₦{(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footerInfo}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            
            {/* Show only one amount - the total */}
            <View style={[styles.summaryRow, {marginTop: 10}]}>
              <Text style={[styles.bold, {fontSize: 18}]}>Total</Text>
              <Text style={styles.totalText}>₦{finalTotal.toFixed(2)}</Text>
            </View>
            
            <View style={styles.walletBox}>
              <Text>Wallet Balance:</Text>
              <Text style={{
                color: walletBalance < finalTotal ? 'red' : 'green', 
                fontWeight: 'bold'
              }}>
                ₦{walletBalance.toFixed(2)}
              </Text>
            </View>
            
            {walletBalance < finalTotal && (
              <Text style={styles.insufficientWarning}>
                You need ₦{(finalTotal - walletBalance).toFixed(2)} more to complete this order
              </Text>
            )}
          </View>
        }
      />

      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[
            styles.payButton, 
            (walletBalance < finalTotal || placingOrder) && styles.payButtonDisabled
          ]}
          onPress={handlePlaceOrder}
          disabled={walletBalance < finalTotal || placingOrder}
        >
          {placingOrder ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>
              Place Order (₦{finalTotal.toFixed(2)})
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Order Confirmation Modal - Covers whole page */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={handleCancelOrder}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContent}>
            
           
            
            {/* Overlay for better text visibility */}
            <View style={styles.confirmModalOverlayLayer} />
            
            {/* Modal Content */}
            <View style={styles.confirmModalInner}>
              <Text style={styles.confirmModalTitle}>Confirm Order</Text>
              
              <View style={styles.confirmModalAmountContainer}>
                <Text style={styles.confirmModalAmountLabel}>Total Amount</Text>
                <Text style={styles.confirmModalAmount}>₦{finalTotal.toFixed(2)}</Text>
              </View>
              
              <Text style={styles.confirmModalPaymentMethod}>
                Payment Method: <Text style={styles.confirmModalPaymentMethodHighlight}>Wallet</Text>
              </Text>
              
              <Text style={styles.confirmModalQuestion}>Proceed with this order?</Text>
              
              <View style={styles.confirmModalButtons}>
                <TouchableOpacity 
                  style={[styles.confirmModalButton, styles.confirmModalCancelButton]}
                  onPress={handleCancelOrder}
                >
                  <Text style={styles.confirmModalCancelText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.confirmModalButton, styles.confirmModalConfirmButton]}
                  onPress={handleConfirmOrder}
                >
                  {placingOrder ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.confirmModalConfirmText}>Place Order</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Insufficient Funds Modal */}
      <Modal 
        visible={showInsufficientModal} 
        transparent 
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={() => setShowInsufficientModal(false)}
      >
        <View style={styles.fullScreenModalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Insufficient Funds</Text>
            <Text style={styles.modalText}>
              Your wallet balance (₦{walletBalance.toFixed(2)}) is insufficient to pay for this order (₦{finalTotal.toFixed(2)}).
            </Text>
            <Text style={styles.modalText}>
              You need ₦{(finalTotal - walletBalance).toFixed(2)} more.
            </Text>
            <TouchableOpacity 
              style={styles.modalBtn} 
              onPress={() => setShowInsufficientModal(false)}
            >
              <Text style={styles.modalBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingTop:30
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  footerInfo: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#66A34A',
  },
  walletBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  insufficientWarning: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  bottomBar: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  payButton: {
    backgroundColor: '#66A34A',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 60
  },
  payButtonDisabled: {
    backgroundColor: '#ccc',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Confirm Order Modal Styles - Covers whole page
  confirmModalOverlay: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmModalContent: {
    width: '100%',
    height: '100%',
    maxWidth: 400,
    maxHeight: 500,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  confirmModalBg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  confirmModalOverlayLayer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(63, 61, 61, 0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  confirmModalInner: {
    flex: 1,
    padding: 25,
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 1,
  },
  confirmModalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  confirmModalAmountContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  confirmModalAmountLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  confirmModalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#66A34A',
  },
  confirmModalPaymentMethod: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  confirmModalPaymentMethodHighlight: {
    fontWeight: 'bold',
    color: '#FFD700',
  },
  confirmModalQuestion: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 25,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  confirmModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  confirmModalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmModalCancelButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  confirmModalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmModalConfirmButton: {
    backgroundColor: '#66A34A',
  },
  confirmModalConfirmText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  
  // Full Screen Insufficient Funds Modal
  fullScreenModalOverlay: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  modalBtn: {
    backgroundColor: '#66A34A',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
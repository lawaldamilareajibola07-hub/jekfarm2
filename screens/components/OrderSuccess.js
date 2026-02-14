import React, { useState, useEffect } from "react";
import { 
  View, Text, TouchableOpacity, 
  ScrollView, StyleSheet, ActivityIndicator, Alert,
  Modal, Image, Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import modal background image
import modalBgImage from "../../assets/AgreonIcon.jpeg";

const { width, height } = Dimensions.get('window');

export default function OrderSuccess() {
  const navigation = useNavigation();
  const route = useRoute();
  
  const {
    orderId = "N/A",
    totalAmount = 0,
    customerName = "Customer",
    date = new Date().toLocaleDateString(),
    transactionId = "N/A",
    paymentMethod = "Wallet",
    items = []
  } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [updatedWalletBalance, setUpdatedWalletBalance] = useState(null);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);

  useEffect(() => {
    fetchUpdatedWalletBalance();
  }, []);

  const fetchUpdatedWalletBalance = async () => {
    try {
      const walletString = await AsyncStorage.getItem('walletBalance');
      if (walletString) {
        setUpdatedWalletBalance(parseFloat(walletString));
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  const handleContinueShopping = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }]
    });
  };

  const handleViewOrderDetails = () => {
    // Show the custom modal instead of Alert.alert
    setShowOrderDetailsModal(true);
  };

  const handleCloseOrderDetailsModal = () => {
    setShowOrderDetailsModal(false);
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "N/A") {
      return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return dateString;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
        
        <Text style={styles.title}>Order Successful!</Text>
        <Text style={styles.subtitle}>
          Thank you {customerName}, your order #{orderId} has been received.
        </Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Order ID</Text>
            <Text style={styles.val}>{orderId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Transaction ID</Text>
            <Text style={styles.val}>{transactionId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date & Time</Text>
            <Text style={styles.val}>{formatDate(date)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Method</Text>
            <Text style={styles.val}>{paymentMethod}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.labelBold}>Total Paid</Text>
            <Text style={styles.totalVal}>₦{parseFloat(totalAmount).toFixed(2)}</Text>
          </View>
          
          {updatedWalletBalance !== null && (
            <View style={styles.row}>
              <Text style={styles.label}>Remaining Wallet Balance</Text>
              <Text style={[styles.val, { color: '#10b981', fontWeight: 'bold' }]}>
                ₦{updatedWalletBalance.toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        {items && items.length > 0 && (
          <View style={styles.itemsBox}>
            <Text style={styles.label}>Items Ordered:</Text>
            {items.slice(0, 3).map((item, index) => (
              <Text key={index} style={styles.itemText}>
                • {item.name} x {item.quantity}
              </Text>
            ))}
            {items.length > 3 && (
              <Text style={styles.moreItemsText}>
                ...and {items.length - 3} more items
              </Text>
            )}
          </View>
        )}

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>Note:</Text>
          <Text style={styles.noteText}>
            Your order will be processed and delivered as soon as possible. 
            You can track your order in the Orders section.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.secondaryBtn} 
          onPress={handleViewOrderDetails}
        >
          <Text style={styles.secondaryBtnText}>View Order Details</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.primaryBtn} 
          onPress={handleContinueShopping}
        >
          <Text style={styles.primaryBtnText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>

      {/* Order Details Modal - EXACTLY like Confirm Order Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showOrderDetailsModal}
        statusBarTranslucent={true}
        onRequestClose={handleCloseOrderDetailsModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
           
            
            {/* Overlay for better text visibility */}
            <View style={styles.modalOverlayLayer} />
            
            {/* Modal Content */}
            <View style={styles.modalInner}>
              <Text style={styles.modalTitle}>Order Details</Text>
              
              <View style={styles.modalAmountContainer}>
                <Text style={styles.modalAmountLabel}>Total Amount</Text>
                <Text style={styles.modalAmount}>₦{parseFloat(totalAmount).toFixed(2)}</Text>
              </View>
              
              <View style={styles.modalInfoContainer}>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Order ID:</Text>
                  <Text style={styles.modalInfoValue}>{orderId}</Text>
                </View>
                
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Transaction ID:</Text>
                  <Text style={styles.modalInfoValue}>{transactionId}</Text>
                </View>
                
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Date & Time:</Text>
                  <Text style={styles.modalInfoValue}>{formatDate(date)}</Text>
                </View>
              </View>
              
              <Text style={styles.modalPaymentMethod}>
                Payment Method: <Text style={styles.modalPaymentMethodHighlight}>{paymentMethod}</Text>
              </Text>
              
              {items && items.length > 0 && (
                <View style={styles.modalItemsContainer}>
                  <Text style={styles.modalItemsTitle}>Order Items:</Text>
                  <ScrollView 
                    style={styles.modalItemsScroll} 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.modalItemsContent}
                  >
                    {items.slice(0, 5).map((item, index) => (
                      <View key={index} style={styles.modalItemRow}>
                        <Text style={styles.modalItemName}>• {item.name}</Text>
                        <View style={styles.modalItemDetails}>
                          <Text style={styles.modalItemQuantity}>x{item.quantity}</Text>
                          <Text style={styles.modalItemPrice}>₦{(item.price * item.quantity).toFixed(2)}</Text>
                        </View>
                      </View>
                    ))}
                    {items.length > 5 && (
                      <Text style={styles.modalMoreItems}>
                        ...and {items.length - 5} more items
                      </Text>
                    )}
                  </ScrollView>
                </View>
              )}
              
              {updatedWalletBalance !== null && (
                <Text style={styles.modalWalletBalance}>
                  Remaining Balance: <Text style={styles.modalWalletBalanceHighlight}>₦{updatedWalletBalance.toFixed(2)}</Text>
                </Text>
              )}
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={handleCloseOrderDetailsModal}
                >
                  <Text style={styles.modalCancelText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 20,
  },
  checkMark: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  labelBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  val: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalVal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#66A34A',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },
  itemsBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemText: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
  },
  moreItemsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 6,
  },
  noteBox: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0369a1',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#0c4a6e',
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal:7,
    marginBottom:30,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#66A34A',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  secondaryBtnText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Modal Styles - EXACTLY like Confirm Order Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 26, 26, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    height: '100%',
    maxWidth: 400,
    maxHeight: 600,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  modalBg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  modalOverlayLayer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  modalInner: {
    flex: 1,
    padding: 25,
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  modalAmountContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  modalAmountLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  modalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#66A34A',
  },
  modalInfoContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  modalInfoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  modalInfoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  modalPaymentMethod: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  modalPaymentMethodHighlight: {
    fontWeight: 'bold',
    color: '#FFD700',
  },
  modalItemsContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    maxHeight: 150,
  },
  modalItemsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalItemsScroll: {
    flex: 1,
  },
  modalItemsContent: {
    paddingBottom: 5,
  },
  modalItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemName: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  modalItemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalItemQuantity: {
    fontSize: 13,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modalItemPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#66A34A',
  },
  modalMoreItems: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 5,
    textAlign: 'center',
  },
  modalWalletBalance: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  modalWalletBalanceHighlight: {
    fontWeight: 'bold',
    color: '#FFD700',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});
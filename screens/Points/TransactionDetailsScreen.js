import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Share,
  Clipboard,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');

export default function TransactionDetailsScreen({ navigation, route }) {
  const {
    success = false,
    amount = 0,
    reference = '',
    bankDetails = {},
    fundingType = 'local',
    transferType = 'local',
    status = 'pending',
    description = '',
    timestamp = new Date().toISOString(),
    response = {},
    swiftCode = '',
    iban = '',
    accountVerified = false,
    verificationData = null
  } = route.params || {};
  
  const [isLoading, setIsLoading] = useState(false);
  const [generatingReceipt, setGeneratingReceipt] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(status);
  const [estimatedTime, setEstimatedTime] = useState('24 hours');
  const [userData, setUserData] = useState(null);
  
  // Create ref for the receipt view
  const viewShotRef = useRef();

  useEffect(() => {
    if (!success) {
      Alert.alert('Error', 'Transfer was not successful');
      navigation.goBack();
    }
    loadUserData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (success && transactionStatus === 'pending') {
        const timer = setTimeout(() => {
          checkTransactionStatus();
        }, 10000);
        
        return () => clearTimeout(timer);
      }
    }, [success, transactionStatus])
  );

  const loadUserData = async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        setUserData(JSON.parse(userString));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const formatAmount = (val) => {
    if (!val) return '0.00';
    const num = parseFloat(val);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = () => {
    switch (transactionStatus) {
      case 'completed': return '#41B63E';
      case 'success': return '#41B63E';
      case 'pending': return '#FF9800';
      case 'processing': return '#FF9800';
      case 'failed': return '#F44336';
      case 'error': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusIcon = () => {
    switch (transactionStatus) {
      case 'completed':
      case 'success': return 'checkmark-circle';
      case 'pending':
      case 'processing': return 'time';
      case 'failed':
      case 'error': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const getStatusText = () => {
    switch (transactionStatus) {
      case 'completed':
      case 'success': return 'Completed';
      case 'pending': return 'Pending Verification';
      case 'processing': return 'Processing';
      case 'failed':
      case 'error': return 'Failed';
      default: return 'Processing';
    }
  };

  const checkTransactionStatus = async () => {
    if (!reference) {
      Alert.alert('Error', 'No transaction reference found');
      return;
    }

    setIsLoading(true);
    
    try {
      const userString = await AsyncStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      const token = await AsyncStorage.getItem('token');

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const requestData = {
        transaction_reference: reference,
        user_id: user.id,
        action: 'check_status'
      };

      const response = await fetch('https://jekfarms.com.ng/data/pay/send-money.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestData),
        timeout: 15000,
      });

      const result = await response.json();

      if (result.status === 'success' || result.status === 'completed') {
        setTransactionStatus('completed');
        
        if (result.wallet_balance && userData) {
          const updatedUser = {
            ...userData,
            wallet_balance: parseFloat(result.wallet_balance),
            balance: parseFloat(result.wallet_balance)
          };
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
          setUserData(updatedUser);
        }

        Alert.alert(
          'Transfer Successful!',
          `Your transfer of ₦${formatAmount(amount)} has been completed successfully.`,
          [{ text: 'OK' }]
        );
      } else if (result.status === 'pending' || result.status === 'processing') {
        setTransactionStatus('pending');
        Alert.alert('Still Processing', 'Your transfer is still being processed. Please check again later.');
      } else {
        setTransactionStatus('failed');
        Alert.alert('Transfer Failed', result.message || 'Transfer could not be completed.');
      }

    } catch (error) {
      console.error('Status check error:', error);
      Alert.alert('Error', 'Failed to check transaction status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Simple image sharing function
  const shareImageReceipt = async () => {
    try {
      setGeneratingReceipt(true);
      
      if (!viewShotRef.current) {
        Alert.alert('Error', 'Cannot generate receipt at this time');
        return;
      }

      // Capture the receipt as image
      const uri = await viewShotRef.current.capture();
      
      // Share the image
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share Receipt',
        UTI: 'image/png'
      });
      
    } catch (error) {
      console.error('Error generating receipt:', error);
      
      // Fallback to text sharing if image fails
      Alert.alert(
        'Image Generation Failed',
        'Falling back to text receipt. For image receipts, please use a development build.',
        [
          {
            text: 'Share as Text',
            onPress: shareTextReceipt
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } finally {
      setGeneratingReceipt(false);
    }
  };

  const shareTextReceipt = async () => {
    try {
      const message = `💰 JekFarms Transaction Receipt\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🔢 Reference: ${reference}\n` +
        `💵 Amount: ₦${formatAmount(amount)}\n` +
        `✅ Status: ${getStatusText()}\n` +
        `👤 Recipient: ${bankDetails.accountName || 'N/A'}\n` +
        `📊 Account: ${bankDetails.accountNumber || 'N/A'}\n` +
        `🏦 Bank: ${bankDetails.bankName || 'N/A'}\n` +
        `📅 Date: ${formatDate(timestamp)}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📱 JekFarms App\n` +
        `📧 support@jekfarms.com.ng`;
      
      await Share.share({
        message: message,
        title: 'Transaction Receipt'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share transaction details');
    }
  };

  const copyReference = async () => {
    await Clipboard.setString(reference);
    Alert.alert('Copied!', 'Reference number copied to clipboard');
  };

  const getPaymentMethod = () => {
    if (fundingType === 'crypto') return 'Cryptocurrency';
    if (transferType === 'foreign') return 'Foreign Transfer';
    return 'Bank Transfer';
  };

  const makeAnotherTransfer = () => {
    navigation.navigate('SendMoneyScreen');
  };

  const goToMainApp = () => {
  navigation.navigate('MainTabs', { screen: 'Wallet' });
  };

  const getTransactionType = () => {
    if (transferType === 'foreign') return 'International Transfer';
    return 'Local Transfer';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Hidden receipt for capturing - positioned off-screen */}
      <View style={styles.hiddenReceiptContainer}>
        <ViewShot
          ref={viewShotRef}
          options={{ format: 'png', quality: 1.0 }}
          style={styles.receiptView}
        >
          <View style={styles.receiptContent}>
            {/* Receipt Header */}
            <View style={styles.receiptHeader}>
              <Text style={styles.receiptTitle}>JekFarms</Text>
              <Text style={styles.receiptSubtitle}>Transaction Receipt</Text>
            </View>

            {/* Status */}
            <View style={[styles.receiptStatus, { backgroundColor: getStatusColor() + '20' }]}>
              <Ionicons name={getStatusIcon()} size={20} color={getStatusColor()} />
              <Text style={[styles.receiptStatusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>

            {/* Amount */}
            <View style={styles.receiptAmountSection}>
              <Text style={styles.receiptAmountLabel}>TRANSFER AMOUNT</Text>
              <Text style={styles.receiptAmount}>₦{formatAmount(amount)}</Text>
            </View>

            {/* Transaction Details */}
            <View style={styles.receiptSection}>
              <Text style={styles.receiptSectionTitle}>TRANSACTION DETAILS</Text>
              
              <View style={styles.receiptDetailRow}>
                <Text style={styles.receiptDetailLabel}>Reference:</Text>
                <Text style={styles.receiptDetailValue}>{reference}</Text>
              </View>
              
              <View style={styles.receiptDetailRow}>
                <Text style={styles.receiptDetailLabel}>Type:</Text>
                <Text style={styles.receiptDetailValue}>{getTransactionType()}</Text>
              </View>
              
              <View style={styles.receiptDetailRow}>
                <Text style={styles.receiptDetailLabel}>Date:</Text>
                <Text style={styles.receiptDetailValue}>{formatDate(timestamp)}</Text>
              </View>
              
              {description && (
                <View style={styles.receiptDetailRow}>
                  <Text style={styles.receiptDetailLabel}>Description:</Text>
                  <Text style={styles.receiptDetailValue}>{description}</Text>
                </View>
              )}
            </View>

            {/* Recipient Details */}
            <View style={styles.receiptSection}>
              <Text style={styles.receiptSectionTitle}>RECIPIENT DETAILS</Text>
              
              {bankDetails.accountName && (
                <View style={styles.receiptDetailRow}>
                  <Text style={styles.receiptDetailLabel}>Name:</Text>
                  <Text style={styles.receiptDetailValue}>{bankDetails.accountName}</Text>
                </View>
              )}
              
              {bankDetails.accountNumber && (
                <View style={styles.receiptDetailRow}>
                  <Text style={styles.receiptDetailLabel}>Account:</Text>
                  <Text style={styles.receiptDetailValue}>{bankDetails.accountNumber}</Text>
                </View>
              )}
              
              {bankDetails.bankName && (
                <View style={styles.receiptDetailRow}>
                  <Text style={styles.receiptDetailLabel}>Bank:</Text>
                  <Text style={styles.receiptDetailValue}>{bankDetails.bankName}</Text>
                </View>
              )}
            </View>

           
          </View>
        </ViewShot>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Details</Text>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Verification Status */}
        {accountVerified && (
          <View style={styles.verificationBanner}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <View style={styles.verificationBannerContent}>
              <Text style={styles.verificationBannerTitle}>
                {verificationData?.status === 'manual' 
                  ? 'Manual Transfer' 
                  : 'Verified Account Transfer'}
              </Text>
              <Text style={styles.verificationBannerText}>
                {verificationData?.status === 'manual' 
                  ? 'Transfer initiated with manually entered details' 
                  : 'Account was verified before transfer'}
              </Text>
            </View>
          </View>
        )}

        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: `${getStatusColor()}20` }]}>
          <Ionicons 
            name={getStatusIcon()} 
            size={32} 
            color={getStatusColor()} 
          />
          <View style={styles.statusContent}>
            <Text style={[styles.statusTitle, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
            <Text style={styles.statusSubtitle}>
              {transactionStatus === 'completed' || transactionStatus === 'success'
                ? 'Transfer completed successfully'
                : transactionStatus === 'pending'
                ? 'Your transfer is being processed'
                : 'Transfer failed - Contact support'}
            </Text>
          </View>
        </View>

        {/* Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Transfer Amount</Text>
          <Text style={styles.amountValue}>₦{formatAmount(amount)}</Text>
          <Text style={styles.amountNote}>
            {transactionStatus === 'completed' || transactionStatus === 'success'
              ? 'Successfully transferred to recipient'
              : transactionStatus === 'pending'
              ? `Estimated completion: ${estimatedTime}`
              : 'Transaction failed'}
          </Text>
        </View>

        {/* Transaction Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Transaction Details</Text>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Reference Number:</Text>
            <View style={styles.detailValueRow}>
              <Text style={styles.detailValue}>{reference}</Text>
              <TouchableOpacity 
                style={styles.copyButton}
                onPress={copyReference}
              >
                <Ionicons name="copy" size={18} color="#41B63E" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Transaction Type:</Text>
            <Text style={styles.detailValue}>{getTransactionType()}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Payment Method:</Text>
            <Text style={styles.detailValue}>{getPaymentMethod()}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Date & Time:</Text>
            <Text style={styles.detailValue}>{formatDate(timestamp)}</Text>
          </View>
          
          {description && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Description:</Text>
              <Text style={styles.detailValue}>{description}</Text>
            </View>
          )}
        </View>

        {/* Recipient Details Card */}
        {bankDetails && (bankDetails.accountNumber || bankDetails.bankName) && (
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Recipient Details</Text>
            
            {bankDetails.accountName && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Recipient Name:</Text>
                <Text style={styles.detailValue}>{bankDetails.accountName}</Text>
              </View>
            )}
            
            {bankDetails.accountNumber && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Account Number:</Text>
                <Text style={styles.detailValue}>{bankDetails.accountNumber}</Text>
              </View>
            )}
            
            {bankDetails.bankName && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Bank Name:</Text>
                <Text style={styles.detailValue}>{bankDetails.bankName}</Text>
              </View>
            )}
            
            {swiftCode && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>SWIFT Code:</Text>
                <Text style={styles.detailValue}>{swiftCode}</Text>
              </View>
            )}
            
            {iban && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>IBAN:</Text>
                <Text style={styles.detailValue}>{iban}</Text>
              </View>
            )}
          </View>
        )}

       
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {transactionStatus === 'pending' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.checkButton]}
            onPress={checkTransactionStatus}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="refresh" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.checkButtonText}>Check Status</Text>
              </>
            )}
          </TouchableOpacity>
        )}
        
        {/* Image Receipt Button */}
        <TouchableOpacity 
          style={[styles.actionButton, styles.imageReceiptButton]}
          onPress={shareImageReceipt}
          disabled={generatingReceipt}
        >
          {generatingReceipt ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="image" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.imageReceiptButtonText}>Save as Image</Text>
            </>
          )}
        </TouchableOpacity>
        
      
        {/* Go to App Button */}
        <TouchableOpacity 
          style={[styles.actionButton, styles.appButton]}
          onPress={goToMainApp}
        >
          <Ionicons name="home" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.appButtonText}>Go to App</Text>
        </TouchableOpacity>
        
       
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  hiddenReceiptContainer: {
    position: 'absolute',
    left: -1000,
    opacity: 0,
  },
  receiptView: {
    width: 400,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  receiptContent: {
    width: 360,
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#41B63E',
    paddingBottom: 15,
  },
  receiptTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#41B63E',
    marginBottom: 5,
  },
  receiptSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  receiptStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  receiptStatusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  receiptAmountSection: {
    alignItems: 'center',
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  receiptAmountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    letterSpacing: 1,
  },
  receiptAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#41B63E',
  },
  receiptSection: {
    marginBottom: 20,
  },
  receiptSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  receiptDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  receiptDetailLabel: {
    fontSize: 14,
    color: '#666',
  },
  receiptDetailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  receiptFooter: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  receiptFooterText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  receiptContact: {
    fontSize: 11,
    color: '#41B63E',
    marginBottom: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 30,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    backgroundColor: '#e8e9e8ff',
    padding: 10,
    borderRadius: 50,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#15791aff',
    backgroundColor: '#e3f3e4ff',
    width: "100%",
    textAlign: 'center',
    borderRadius: 23,
    paddingHorizontal: 15,
    paddingVertical: 16,
    marginTop: 40,
    position: 'absolute',
    left: 0,
    right: 0,
  },
  verificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9f0',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  verificationBannerContent: {
    marginLeft: 12,
    flex: 1,
  },
  verificationBannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 4,
  },
  verificationBannerText: {
    fontSize: 14,
    color: '#666',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 200,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  statusContent: {
    marginLeft: 16,
    flex: 1,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  amountCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  amountLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#41B63E',
    marginBottom: 8,
  },
  amountNote: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  copyButton: {
    padding: 8,
    marginLeft: 8,
  },
  supportCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  supportContent: {
    flex: 1,
    marginLeft: 16,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  supportContact: {
    fontSize: 13,
    color: '#41B63E',
    fontWeight: '500',
    marginBottom: 2,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  checkButton: {
    backgroundColor: '#41B63E',
  },
  imageReceiptButton: {
    backgroundColor: '#FF9800',
  },

  appButton: {
    backgroundColor: '#333',
  },
  transferButton: {
    backgroundColor: '#41B63E',
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imageReceiptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  appButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  transferButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
});
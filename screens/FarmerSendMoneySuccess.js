import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Share,
  Alert,
  Clipboard,
  Animated,
  Easing,
  BackHandler,
  ActivityIndicator
} from 'react-native';
import { Ionicons as Icon } from "@expo/vector-icons";
import { useNavigation, useRoute } from '@react-navigation/native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

const FarmerSendMoneySuccess = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    success = true,
    amount = 0,
    reference = '',
    status = 'completed',
    bankDetails = {},
    description = '',
    timestamp = new Date().toISOString(),
    previousBalance = 0,
    newBalance = 0,
    transactionId = ''
  } = route.params || {};

  const [scaleAnim] = React.useState(new Animated.Value(0.5));
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [generatingImage, setGeneratingImage] = React.useState(false);

  // Create ref for the receipt view
  const receiptRef = useRef();

  useEffect(() => {
    // Animate success icon
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.ease,
        useNativeDriver: true,
      })
    ]).start();

    // Handle Android hardware back button
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        handleDone();
        return true; // Prevent default back action
      }
    );

    return () => backHandler.remove();
  }, []);

  const formatAmount = (num) => {
    return `₦${parseFloat(num).toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCopyReference = () => {
    Clipboard.setString(reference);
    Alert.alert('Copied!', 'Transaction reference copied to clipboard');
  };

  // Function to generate and share receipt as image
  const handleShareImageReceipt = async () => {
    try {
      setGeneratingImage(true);

      if (!receiptRef.current) {
        throw new Error('Cannot generate receipt at this time');
      }

      // Capture the receipt as image
      const uri = await receiptRef.current.capture({
        format: 'png',
        quality: 1.0,
      });

      // Share the image
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share Receipt',
        UTI: 'image/png'
      });

    } catch (error) {
      console.error('Error generating image receipt:', error);

      // Fallback to text sharing
      Alert.alert(
        'Image Generation Failed',
        'Falling back to text receipt.',
        [
          {
            text: 'Share as Text',
            onPress: handleShareTextReceipt
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleShareTextReceipt = async () => {
    try {
      const shareContent = `💰 Money Transfer Receipt\n\n` +
        `Amount: ${formatAmount(amount)}\n` +
        `To: ${bankDetails.accountName}\n` +
        `Account: ${bankDetails.accountNumber}\n` +
        `Bank: ${bankDetails.bankName}\n` +
        `Reference: ${reference}\n` +
        `Date: ${formatDate(timestamp)}\n` +
        `Status: ${status}\n\n` +
        `Thank you for using JekFarms!`;

      await Share.share({
        message: shareContent,
        title: 'Money Transfer Receipt'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDone = () => {
    // Reset navigation stack and go back to WalletMain
    navigation.reset({
      index: 0,
      routes: [{ name: 'WalletMain' }],
    });
  };

  const handleSendAnother = () => {
    // Navigate back to send money screen with cleared form
    navigation.reset({
      index: 0,
      routes: [
        { name: 'WalletMain' },
        { name: 'FarmerSendMoney' }
      ],
    });
  };

  const handleViewTransactions = () => {
    Alert.alert('Coming Soon', 'Transaction history feature will be available soon!');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Hidden receipt for image capture */}
      <View style={styles.hiddenReceiptContainer}>
        <ViewShot
          ref={receiptRef}
          options={{ format: 'png', quality: 1.0 }}
          style={styles.receiptView}
        >
          {/* Receipt Content for Image */}
          <View style={styles.receiptContent}>
            {/* Receipt Header */}
            <View style={styles.receiptHeader}>
              <Text style={styles.receiptTitle}>JekFarms</Text>
              <Text style={styles.receiptSubtitle}>Money Transfer Receipt</Text>
            </View>

            {/* Status */}
            <View style={styles.receiptStatusSection}>
              <Icon
                name="checkmark-circle"
                size={24}
                color="#4CAF50"
              />
              <Text style={styles.receiptStatusText}>Transfer Successful</Text>
            </View>

            {/* Amount */}
            <View style={styles.receiptAmountSection}>
              <Text style={styles.receiptAmountLabel}>AMOUNT TRANSFERRED</Text>
              <Text style={styles.receiptAmount}>{formatAmount(amount)}</Text>
            </View>

            {/* Transaction Details */}
            <View style={styles.receiptDetails}>
              <Text style={styles.receiptSectionTitle}>TRANSACTION DETAILS</Text>

              <View style={styles.receiptDetailRow}>
                <Text style={styles.receiptDetailLabel}>Reference:</Text>
                <Text style={styles.receiptDetailValue}>{reference}</Text>
              </View>

              <View style={styles.receiptDetailRow}>
                <Text style={styles.receiptDetailLabel}>Date:</Text>
                <Text style={styles.receiptDetailValue}>{formatDate(timestamp)}</Text>
              </View>

              <View style={styles.receiptDetailRow}>
                <Text style={styles.receiptDetailLabel}>Status:</Text>
                <Text style={styles.receiptDetailValue}>{status}</Text>
              </View>
            </View>

            {/* Recipient Details */}
            <View style={styles.receiptDetails}>
              <Text style={styles.receiptSectionTitle}>RECIPIENT DETAILS</Text>

              <View style={styles.receiptDetailRow}>
                <Text style={styles.receiptDetailLabel}>Name:</Text>
                <Text style={styles.receiptDetailValue}>{bankDetails.accountName}</Text>
              </View>

              <View style={styles.receiptDetailRow}>
                <Text style={styles.receiptDetailLabel}>Account:</Text>
                <Text style={styles.receiptDetailValue}>{bankDetails.accountNumber}</Text>
              </View>

              <View style={styles.receiptDetailRow}>
                <Text style={styles.receiptDetailLabel}>Bank:</Text>
                <Text style={styles.receiptDetailValue}>{bankDetails.bankName}</Text>
              </View>
            </View>

            {/* Footer */}

          </View>
        </ViewShot>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Success Animation/Icon */}
        <View style={styles.successIconContainer}>
          <Animated.View
            style={[
              styles.successIconWrapper,
              {
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim
              }
            ]}
          >
            <View style={styles.successIcon}>
              <Icon name="checkmark" size={60} color="#fff" />
            </View>
          </Animated.View>

          {/* Success Message */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.successTitle}>Transfer Successful!</Text>
            <Text style={styles.successSubtitle}>
              Your money has been sent successfully
            </Text>
          </Animated.View>
        </View>

        {/* Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount Sent</Text>
          <Text style={styles.amountValue}>{formatAmount(amount)}</Text>
          <Text style={styles.amountNote}>
            Previous: {formatAmount(previousBalance)} → New: {formatAmount(newBalance)}
          </Text>
        </View>

        {/* Transaction Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Transaction Details</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Status</Text>
              <View style={styles.statusBadge}>
                <Icon
                  name={status === 'completed' ? 'checkmark-circle' : 'time'}
                  size={16}
                  color={status === 'completed' ? '#4CAF50' : '#FF9800'}
                />
                <Text style={[
                  styles.statusText,
                  { color: status === 'completed' ? '#4CAF50' : '#FF9800' }
                ]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailValue}>{formatDate(timestamp)}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Transaction ID</Text>
              <Text style={styles.detailValue}>{transactionId || 'N/A'}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Reference</Text>
              <TouchableOpacity onPress={handleCopyReference}>
                <View style={styles.referenceContainer}>
                  <Text style={styles.detailValue} numberOfLines={1}>
                    {reference || 'N/A'}
                  </Text>
                  <Icon name="copy-outline" size={16} color="#4CAF50" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Recipient Details */}
        <View style={styles.recipientCard}>
          <Text style={styles.recipientTitle}>Recipient Details</Text>

          <View style={styles.recipientInfo}>
            <View style={styles.recipientIcon}>
              <Icon name="person-circle" size={40} color="#4CAF50" />
            </View>
            <View style={styles.recipientDetails}>
              <Text style={styles.recipientName}>{bankDetails.accountName}</Text>
              <Text style={styles.recipientAccount}>
                {bankDetails.accountNumber} • {bankDetails.bankName}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {description && (
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{description}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {/* Image Receipt Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.imageButton]}
            onPress={handleShareImageReceipt}
            disabled={generatingImage}
          >
            {generatingImage ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Icon name="camera-outline" size={20} color="#fff" />
                <Text style={[styles.actionButtonText, { color: '#fff' }]}>
                  Image Receipt
                </Text>
              </>
            )}
          </TouchableOpacity>



          {/* Send Another Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.anotherButton]}
            onPress={handleSendAnother}
          >
            <Icon name="repeat-outline" size={20} color="#4CAF50" />
            <Text style={[styles.actionButtonText, { color: '#4CAF50' }]}>
              Send Another
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Done Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneButtonText}>Back to Wallet</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  // Hidden receipt styles
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
    borderBottomColor: '#4CAF50',
    paddingBottom: 15,
  },
  receiptTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  receiptSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  receiptStatusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    marginBottom: 20,
  },
  receiptStatusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
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
    color: '#4CAF50',
  },
  receiptDetails: {
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
    color: '#4CAF50',
    marginBottom: 2,
  },
  // Existing styles remain the same
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 100,
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  successIconWrapper: {
    marginBottom: 20,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  amountCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  amountNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
    marginHorizontal: 5,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#212121',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  referenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  recipientCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  recipientTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipientIcon: {
    marginRight: 12,
  },
  recipientDetails: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  recipientAccount: {
    fontSize: 14,
    color: '#666',
  },
  descriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
  },
  imageButton: {
    backgroundColor: '#FF9800',
  },

  anotherButton: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  doneButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default FarmerSendMoneySuccess;
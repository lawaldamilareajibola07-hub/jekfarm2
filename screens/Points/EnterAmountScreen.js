import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,

  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons as Icon } from "@expo/vector-icons";
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBalance } from '../components/Contexthook';

const EnterAmountScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    accountNumber,
    selectedBank,
    selectedBankCode,
    recipientName,
    fundingType = 'bank',
    transferType = 'local',
    swiftCode,
    iban,
    verificationData,
    accountVerified = false
  } = route.params || {};

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [userData, setUserData] = useState(null);

  // Predefined amounts
  const quickAmounts = [500, 1000, 5000, 10000, 20000, 50000];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        setUserData(user);
        setWalletBalance(user.wallet_balance || user.balance || 0);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleAmountSelect = (selectedAmount) => {
    setAmount(selectedAmount.toString());
  };

  const validateInputs = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }

    const transferAmount = parseFloat(amount);
    if (transferAmount > walletBalance) {
      Alert.alert('Insufficient Funds', `Your balance is ₦${walletBalance.toFixed(2)}. Please enter a lower amount.`);
      return false;
    }

    if (transferAmount < 100) {
      Alert.alert('Error', 'Minimum transfer amount is ₦100');
      return false;
    }

    return true;
  };

  const handleContinue = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const userData = await AsyncStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;

      if (!user?.id || !user?.email) {
        throw new Error('User not authenticated');
      }

      // EXACT JSON payload that  PHP backend expects
      const transferData = {
        amount: amount,
        narration: description || 'Money Transfer',
        bankCode: selectedBankCode,
        accountNumber: accountNumber,
        email: user.email,
        userId: user.id,
        timestamp: new Date().toISOString(),
        transactionReference: `TRF${Date.now()}${Math.floor(Math.random() * 1000)}`
      };

      console.log('Sending JSON payload to PHP:', JSON.stringify(transferData, null, 2));

      const response = await fetch('https://jekfarms.com.ng/data/pay/send-money.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(transferData),
      });

      console.log('Response status:', response.status);

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let cleanResponse = responseText;

      if (responseText.includes('<br />') || responseText.includes('<b>')) {
        cleanResponse = responseText
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<b>/gi, '')
          .replace(/<\/b>/gi, '')
          .replace(/<[^>]*>/g, '')
          .trim();
      }

      console.log('Cleaned response:', cleanResponse);

      let result;
      try {
        result = JSON.parse(cleanResponse);
      } catch (parseError) {
        console.log('Could not parse as JSON, trying to extract JSON...');

        const jsonMatch = cleanResponse.match(/\{.*\}/s);
        if (jsonMatch) {
          try {
            result = JSON.parse(jsonMatch[0]);
          } catch (e) {
            console.error('Failed to extract JSON:', e);
            throw new Error(`Server response: ${cleanResponse.substring(0, 100)}...`);
          }
        } else {
          if (cleanResponse.toLowerCase().includes('success')) {
            result = { status: 'success', message: cleanResponse };
          } else if (cleanResponse.toLowerCase().includes('fail') ||
            cleanResponse.toLowerCase().includes('error') ||
            cleanResponse.toLowerCase().includes('invalid')) {
            throw new Error(cleanResponse);
          } else {
            result = { status: 'unknown', raw: cleanResponse };
          }
        }
      }

      console.log('Parsed result:', result);

      // Handle success
      if (result.status === 'success' || result.success === true) {
        // AUTO-REFRESH BALANCE: Subtract transferred amount immediately
        const transferAmount = parseFloat(amount);
        const newBalance = walletBalance - transferAmount;

        // Update React state (immediate UI update)
        setWalletBalance(newBalance);

        // Update AsyncStorage (persist the change)
        if (user) {
          const updatedUser = {
            ...user,
            balance: newBalance,
            wallet_balance: newBalance
          };
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
          console.log(`Balance updated in AsyncStorage: ₦${newBalance.toLocaleString()}`);
        }

        //  Success! Navigate to transaction details
        navigation.navigate('TransactionDetailsScreen', {
          success: true,
          amount: transferAmount,
          reference: result.transaction_reference || result.reference || transferData.transactionReference,
          status: result.status || 'processing',
          bankDetails: {
            bankName: selectedBank,
            accountNumber: accountNumber,
            accountName: recipientName,
          },
          fundingType: fundingType,
          transferType: transferType,
          description: description || 'Money Transfer',
          timestamp: new Date().toISOString(),
          response: result,
          // Pass the updated balance to next screen
          previousBalance: walletBalance,
          newBalance: newBalance
        });

        console.log(`Balance auto-refreshed: ₦${walletBalance.toLocaleString()} → ₦${newBalance.toLocaleString()}`);

      } else {
        // Handle error from server
        const errorMessage = result.message ||
          result.error ||
          'Transfer failed without specific error message';
        throw new Error(errorMessage);
      }

    } catch (error) {
      console.error('Transfer error:', error);

      Alert.alert(
        'Transfer Failed',
        error.message || 'An unexpected error occurred. Please try again.',
        [
          {
            text: 'View Details',
            onPress: () => {
              Alert.alert(
                'Error Details',
                error.message || 'No details available',
                [{ text: 'OK' }]
              );
            }
          },
          { text: 'OK' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };
  const formatAmount = (num) => {
    return `₦${parseFloat(num).toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Rest of your component remains the same...
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.goBack} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Enter Amount</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Account Verification Status */}
          {accountVerified && (
            <View style={styles.verificationCard}>
              <Icon name="checkmark-circle" size={24} color="#4CAF50" />
              <View style={styles.verificationContent}>
                <Text style={styles.verificationTitle}>Account Verified</Text>
                <Text style={styles.verificationText}>
                  {verificationData?.status === 'manual'
                    ? 'Proceeding with manual entry'
                    : 'Account details verified successfully'}
                </Text>
              </View>
            </View>
          )}

          {/* Recipient Info Card */}
          <View style={styles.recipientCard}>
            <View style={styles.recipientHeader}>
              <Icon name="person-circle-outline" size={40} color="#41B63E" />
              <View style={styles.recipientInfo}>
                <Text style={styles.recipientName}>{recipientName || 'Recipient'}</Text>
                <Text style={styles.accountNumber}>Account: {accountNumber}</Text>
                <Text style={styles.bankName}>{selectedBank}</Text>
                {transferType === 'foreign' && (
                  <>
                    {swiftCode && <Text style={styles.swiftCode}>SWIFT: {swiftCode}</Text>}
                    {iban && <Text style={styles.iban}>IBAN: {iban}</Text>}
                  </>
                )}
              </View>
            </View>
          </View>

          {/* Your Balance */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Your Balance</Text>
            <Text style={styles.balanceAmount}>{formatAmount(walletBalance)}</Text>
          </View>

          {/* Amount Input */}
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Enter Amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>₦</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
                placeholderTextColor="#999"
                autoFocus={false}
              />
            </View>

            {/* Quick Amounts */}
            <Text style={styles.quickAmountsLabel}>Quick Select</Text>
            <View style={styles.quickAmountsContainer}>
              {quickAmounts.map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  style={[
                    styles.quickAmountButton,
                    amount === quickAmount.toString() && styles.quickAmountButtonSelected
                  ]}
                  onPress={() => handleAmountSelect(quickAmount)}
                >
                  <Text style={[
                    styles.quickAmountText,
                    amount === quickAmount.toString() && styles.quickAmountTextSelected
                  ]}>
                    ₦{quickAmount.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description Input */}
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionLabel}>Description (Optional)</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Add a note for this transfer"
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={100}
            />
            <Text style={styles.charCount}>{description.length}/100</Text>
          </View>

          {/* Transfer Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Transfer Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Amount</Text>
              <Text style={styles.summaryValue}>{amount ? formatAmount(amount) : '₦0.00'}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Fee</Text>
              <Text style={styles.summaryValue}>₦0.00</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={styles.summaryTotal}>{amount ? formatAmount(amount) : '₦0.00'}</Text>
            </View>
          </View>

          {/* Transfer Button */}
          <TouchableOpacity
            style={[styles.transferButton, (!amount || loading) && styles.transferButtonDisabled]}
            onPress={handleContinue}
            disabled={!amount || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="paper-plane-outline" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.transferButtonText}>
                  {transferType === 'foreign' ? 'Send International Transfer' : 'Send Money'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Disclaimer */}
          <View style={styles.disclaimerCard}>
            <Icon name="shield-checkmark-outline" size={16} color="#41B63E" />
            <Text style={styles.disclaimerText}>
              Your money is safe with us. Transfers are secured with bank-level encryption.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#41B63E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#41B63E',
  },
  goBack: {
    marginRight: 15,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  verificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9f0',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  verificationContent: {
    marginLeft: 12,
    flex: 1,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 4,
  },
  verificationText: {
    fontSize: 14,
    color: '#666',
  },
  recipientCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recipientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipientInfo: {
    marginLeft: 12,
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  bankName: {
    fontSize: 14,
    color: '#41B63E',
    fontWeight: '500',
  },
  swiftCode: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  iban: {
    fontSize: 12,
    color: '#888',
  },
  balanceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#41B63E',
  },
  amountCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#41B63E',
    paddingBottom: 10,
    marginBottom: 20,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333',
    marginRight: 5,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '600',
    color: '#333',
    padding: 0,
  },
  quickAmountsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  quickAmountsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickAmountButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quickAmountButtonSelected: {
    backgroundColor: '#41B63E',
    borderColor: '#41B63E',
  },
  quickAmountText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  quickAmountTextSelected: {
    color: 'white',
  },
  descriptionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  descriptionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#333',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 5,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  summaryTotal: {
    fontSize: 18,
    color: '#41B63E',
    fontWeight: '700',
  },
  transferButton: {
    backgroundColor: '#41B63E',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  transferButtonDisabled: {
    backgroundColor: '#a0d9a0',
  },
  buttonIcon: {
    marginRight: 10,
  },
  transferButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9f0',
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
});

export default EnterAmountScreen;
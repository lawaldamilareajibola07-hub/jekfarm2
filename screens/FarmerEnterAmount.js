import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing,
  BackHandler
} from 'react-native';
import { Ionicons as Icon } from "@expo/vector-icons";
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FarmerEnterAmountScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    accountNumber,
    selectedBank,
    selectedBankCode,
    recipientName,
    description = '',
    userEmail,
    farmerId,
    currentBalance = 0
  } = route.params || {};

  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [transferNotes, setTransferNotes] = useState(description);
  const [userData, setUserData] = useState(null);
  const [shakeAnimation] = useState(new Animated.Value(0));
  const [transferFee] = useState(0);

  // Predefined amounts
  const quickAmounts = [1000, 5000, 10000, 20000, 50000, 100000];

  useEffect(() => {
    loadUserData();
  }, []);

  // Handle hardware back button
  useEffect(() => {
    const backAction = () => {
      if (amount && amount !== '') {
        Alert.alert(
          'Discard Amount?',
          'You have entered an amount. Are you sure you want to go back?',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => { } },
            {
              text: 'Discard',
              style: 'destructive',
              onPress: () => navigation.goBack()
            }
          ]
        );
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [amount, navigation]);

  const loadUserData = async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        setUserData(user);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleAmountSelect = (selectedAmount) => {
    setAmount(selectedAmount.toString());
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const validateInputs = () => {
    if (!amount || parseFloat(amount) <= 0) {
      triggerShake();
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return false;
    }

    const transferAmount = parseFloat(amount);

    if (transferAmount > currentBalance) {
      triggerShake();
      Alert.alert(
        'Insufficient Funds',
        `Your balance is ${formatAmount(currentBalance)}.\nYou need ${formatAmount(transferAmount - currentBalance)} more.`
      );
      return false;
    }

    if (transferAmount < 100) {
      triggerShake();
      Alert.alert('Minimum Amount', 'Minimum transfer amount is ₦100');
      return false;
    }

    if (transferAmount > 10000000) {
      Alert.alert('Amount Limit', 'Maximum transfer amount is ₦10,000,000');
      return false;
    }

    if (!accountNumber || !selectedBankCode || !recipientName) {
      Alert.alert('Missing Information', 'Please go back and complete recipient details');
      return false;
    }

    return true;
  };

  const handleSendMoney = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const user = userData || JSON.parse(await AsyncStorage.getItem('user'));

      if (!user?.email) {
        throw new Error('User email not found');
      }

      const transferData = {
        amount: amount,
        narration: transferNotes || 'Money Transfer',
        bankCode: selectedBankCode,
        accountNumber: accountNumber,
        email: user.email
      };

      console.log('Sending transfer data:', transferData);

      const response = await fetch('https://jekfarms.com.ng/data/pay/transfer.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',

        },
        body: JSON.stringify(transferData),
      });

      const responseText = await response.text();
      console.log('API Response:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        const cleanText = responseText.replace(/<[^>]*>/g, '').trim();
        if (cleanText.toLowerCase().includes('success')) {
          result = { status: 'success', message: cleanText };
        } else {
          throw new Error(cleanText || 'Transfer failed');
        }
      }

      if (result.status === 'success') {
        const transferAmount = parseFloat(amount);
        const newBalance = currentBalance - transferAmount;

        if (user) {
          const updatedUser = {
            ...user,
            wallet_balance: newBalance,
            balance: newBalance
          };
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        }

        // IMPORTANT: Use replace instead of navigate to clean the stack
        navigation.replace('FarmerSendMoneySuccess', {
          success: true,
          amount: transferAmount,
          reference: result.transaction_reference || `TRF${Date.now()}`,
          status: result.status || 'completed',
          bankDetails: {
            bankName: selectedBank,
            accountNumber: accountNumber,
            accountName: recipientName,
          },
          description: transferNotes || 'Money Transfer',
          timestamp: new Date().toISOString(),
          previousBalance: currentBalance,
          newBalance: newBalance,
          transactionId: result.transaction_id || Date.now().toString()
        });

      } else {
        throw new Error(result.message || result.error || 'Transfer failed');
      }

    } catch (error) {
      console.error('Transfer error:', error);
      Alert.alert(
        'Transfer Failed',
        error.message || 'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
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

  const calculateTotal = () => {
    const amountNum = parseFloat(amount) || 0;
    return amountNum + transferFee;
  };

  const renderRecipientInfo = () => (
    <View style={styles.recipientCard}>
      <View style={styles.recipientHeader}>
        <View style={styles.recipientAvatar}>
          <Icon name="person-outline" size={24} color="#4CAF50" />
        </View>
        <View style={styles.recipientInfo}>
          <Text style={styles.recipientName}>{recipientName}</Text>
          <Text style={styles.recipientDetails}>
            {accountNumber} • {selectedBank}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          {
            transform: [{ translateX: shakeAnimation }]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.goBackButton}
          onPress={() => {
            if (amount && amount !== '') {
              Alert.alert(
                'Discard Amount?',
                'You have entered an amount. Are you sure you want to go back?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Discard',
                    style: 'destructive',
                    onPress: () => navigation.goBack()
                  }
                ]
              );
            } else {
              navigation.goBack();
            }
          }}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Enter Amount</Text>
          <Text style={styles.headerSubtitle}>How much do you want to send?</Text>
        </View>
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Recipient Info */}
          {renderRecipientInfo()}

          {/* Balance Display */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>{formatAmount(currentBalance)}</Text>
          </View>

          {/* Amount Input Section */}
          <View style={styles.amountSection}>
            <Text style={styles.sectionTitle}>Enter Amount</Text>

            {/* Amount Input */}
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>₦</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9.]/g, '');
                  const parts = cleaned.split('.');
                  if (parts.length <= 2) {
                    setAmount(cleaned);
                  }
                }}
                placeholderTextColor="#999"
                autoFocus={true}
                maxLength={15}
              />
            </View>

            {/* Quick Amounts */}
            <Text style={styles.quickAmountsLabel}>Quick Select</Text>
            <View style={styles.quickAmountsGrid}>
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

          {/* Transfer Notes */}
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Transfer Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add a note for this transfer"
              value={transferNotes}
              onChangeText={setTransferNotes}
              multiline
              maxLength={100}
              placeholderTextColor="#999"
            />
            <Text style={styles.charCount}>{transferNotes.length}/100</Text>
          </View>

          {/* Transfer Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Transfer Summary</Text>

            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Amount</Text>
                <Text style={styles.summaryValue}>
                  {amount ? formatAmount(amount) : '₦0.00'}
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Fee</Text>
                <Text style={styles.summaryValue}>₦0.00</Text>
              </View>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total to Send</Text>
              <Text style={styles.summaryTotal}>
                {amount ? formatAmount(calculateTotal()) : '₦0.00'}
              </Text>
            </View>
          </View>

          {/* Send Button */}
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!amount || loading) && styles.sendButtonDisabled
            ]}
            onPress={handleSendMoney}
            disabled={!amount || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Icon name="paper-plane-outline" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.sendButtonText}>Send Money</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Security Info */}
          <View style={styles.securityInfo}>
            <Icon name="shield-checkmark" size={16} color="#4CAF50" />
            <Text style={styles.securityText}>
              Secured with bank-level encryption • No hidden fees
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
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  goBackButton: {
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  recipientCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  recipientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  recipientDetails: {
    fontSize: 14,
    color: '#666',
  },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  amountSection: {
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
    paddingBottom: 12,
    marginBottom: 24,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#212121',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#212121',
    padding: 0,
    height: 40,
  },
  quickAmountsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  quickAmountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  quickAmountButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 100,
    alignItems: 'center',
  },
  quickAmountButtonSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  quickAmountText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  quickAmountTextSelected: {
    color: '#fff',
  },
  notesSection: {
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
  notesInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 100,
    fontSize: 16,
    color: '#212121',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  summaryCard: {
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
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 16,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  summaryTotal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  sendButtonDisabled: {
    backgroundColor: '#C8E6C9',
  },
  buttonIcon: {
    marginRight: 10,
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  securityText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
});

export default FarmerEnterAmountScreen;
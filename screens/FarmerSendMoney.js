import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons as Icon } from "@expo/vector-icons";
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://jekfarms.com.ng';

const FarmerSendMoneyScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [accountNumber, setAccountNumber] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedBankCode, setSelectedBankCode] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [description, setDescription] = useState('');
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [banks, setBanks] = useState([]);
  const [filteredBanks, setFilteredBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [farmerId, setFarmerId] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [accountVerificationError, setAccountVerificationError] = useState(null);

  useEffect(() => {
    loadUserData();
    fetchBanks();
  }, []);

  useEffect(() => {
    if (route.params?.farmerId) {
      setFarmerId(route.params.farmerId);
    }
    if (route.params?.userEmail) {
      setUserEmail(route.params.userEmail);
    }
    if (route.params?.currentBalance) {
      const balanceStr = route.params.currentBalance.toString().replace(/[₦,]/g, '');
      setCurrentBalance(parseFloat(balanceStr) || 0);
    }
  }, [route.params]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBanks(banks);
    } else {
      const filtered = banks.filter(bank =>
        bank.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBanks(filtered);
    }
  }, [searchQuery, banks]);

  // Auto-verifying account when both fields are filled
  useEffect(() => {
    const verifyAccountDetails = async () => {
      // Only verify if we have both account number (10 digits) and bank code
      if (accountNumber.length === 10 && selectedBankCode && !verifyingAccount) {
        await verifyAccount();
      }
    };

    // A delay to prevent too many API calls while typing
    const timer = setTimeout(() => {
      verifyAccountDetails();
    }, 1000); // 1 second delay

    return () => clearTimeout(timer);
  }, [accountNumber, selectedBankCode]);

  const loadUserData = async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        setFarmerId(user.id?.toString());
        setUserEmail(user.email || '');
        setCurrentBalance(user.wallet_balance || user.balance || 0);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const fetchBanks = async () => {
    try {
      setLoadingBanks(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/data/banks.php`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        timeout: 10000,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Handle different response formats
      let bankList = [];

      if (data.status === 'success' && data.data && Array.isArray(data.data)) {
        bankList = data.data.map(bank => ({
          id: bank.id || bank.code,
          name: bank.name || bank.bankName || '',
          code: bank.code || bank.bankCode || '',
        }));
      } else if (Array.isArray(data)) {
        bankList = data.map(bank => ({
          id: bank.id || bank.code,
          name: bank.name || bank.bankName || '',
          code: bank.code || bank.bankCode || '',
        }));
      } else if (data.banks && Array.isArray(data.banks)) {
        bankList = data.banks.map(bank => ({
          id: bank.id || bank.code,
          name: bank.name || bank.bankName || '',
          code: bank.code || bank.bankCode || '',
        }));
      }

      bankList = bankList.filter(bank => bank.name && bank.name.trim() !== '');

      if (bankList.length === 0) {
        setError('No banks available from server');
        setBanks([]);
        setFilteredBanks([]);
      } else {
        setBanks(bankList);
        setFilteredBanks(bankList);
      }

    } catch (error) {
      console.error('Error fetching banks:', error);
      setError(`Failed to load banks: ${error.message}`);
      setBanks([]);
      setFilteredBanks([]);

    } finally {
      setLoadingBanks(false);
    }
  };

  // Function to verify account details using POST method
  const verifyAccount = async () => {
    if (!accountNumber || !selectedBankCode) {
      return;
    }

    setVerifyingAccount(true);
    setAccountVerificationError(null);

    try {
      const payload = {
        accountNumber: accountNumber.trim(),
        bankCode: selectedBankCode.trim()
      };

      const response = await fetch(`${BASE_URL}/data/banks.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
        timeout: 15000,
      });

      const data = await response.json();

      // Check for success response
      if (data.status === 'success' && data.data && data.data.accountName) {
        // Auto-populate the recipient name field
        setRecipientName(data.data.accountName);
        setAccountVerificationError(null);
      } else if (data.status === 'success' && data.message === 'Account validated') {
        setRecipientName(data.data?.accountName || '');
        setAccountVerificationError(null);
      } else {
        // Clear recipient name if verification fails
        setRecipientName('');
        setAccountVerificationError(data.message || 'Account verification failed');
      }
    } catch (error) {
      console.error('Error verifying account:', error);
      setAccountVerificationError('Unable to verify account. Please check network connection.');
      setRecipientName('');
    } finally {
      setVerifyingAccount(false);
    }
  };

  const closeModal = () => {
    setBankModalVisible(false);
    setSearchQuery('');
  };

  const handleSelectBank = (bank) => {
    setSelectedBank(bank.name);
    setSelectedBankCode(bank.code);

    // Clear recipient name when bank changes
    setRecipientName('');
    setAccountVerificationError(null);

    closeModal();
  };

  const handleAccountNumberChange = (text) => {
    // Only allow numbers
    const cleanedText = text.replace(/[^0-9]/g, '');
    setAccountNumber(cleanedText);

    // Clear recipient name and errors when account number changes
    if (recipientName) {
      setRecipientName('');
    }
    if (accountVerificationError) {
      setAccountVerificationError(null);
    }
  };

  const validateAndProceed = () => {
    if (!accountNumber || !selectedBank || !recipientName) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (accountNumber.length !== 10) {
      Alert.alert('Invalid Account', 'Account number must be 10 digits.');
      return;
    }

    if (recipientName.trim().length < 2) {
      Alert.alert('Invalid Name', 'Please enter a valid recipient name.');
      return;
    }

    if (!farmerId || !userEmail) {
      Alert.alert('Authentication Error', 'Please login again to continue.');
      return;
    }

    Alert.alert(
      'Confirm Recipient Details',
      `Please verify these details carefully:\n\n` +
      `Account Number: ${accountNumber}\n` +
      `Bank: ${selectedBank}\n` +
      `Recipient: ${recipientName}\n\n` +
      `⚠️ Transfers cannot be reversed if sent to wrong account.`,
      [
        {
          text: 'Edit Details',
          style: 'cancel'
        },
        {
          text: 'Yes, Proceed',
          onPress: () => navigateToAmountScreen(),
          style: 'default'
        }
      ]
    );
  };

  const navigateToAmountScreen = () => {
    navigation.navigate("FarmerEnterAmount", {
      accountNumber,
      selectedBank,
      selectedBankCode,
      recipientName: recipientName.trim(),
      description: description.trim(),
      userEmail,
      farmerId,
      currentBalance
    });
  };

  const handleGoBack = () => {
    setAccountNumber('');
    setRecipientName('');
    setDescription('');
    setSelectedBank('');
    setSelectedBankCode('');
    setAccountVerificationError(null);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.goBackButton}
              onPress={handleGoBack}
            >
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Send Money</Text>
              <Text style={styles.headerSubtitle}>Transfer to bank account</Text>
            </View>
          </View>

          {/* Balance Display */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>{formatBalance(currentBalance)}</Text>
          </View>

          {/* Transfer Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Recipient Information</Text>

            {/* Account Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Account Number *</Text>
              <View style={styles.accountInputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter 10-digit account number"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  maxLength={10}
                  value={accountNumber}
                  onChangeText={handleAccountNumberChange}
                />
                {verifyingAccount && (
                  <ActivityIndicator
                    size="small"
                    color="#4CAF50"
                    style={styles.verificationIndicator}
                  />
                )}
              </View>
            </View>

            {/* Bank Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Select Bank *</Text>
              <TouchableOpacity
                style={styles.bankSelector}
                onPress={() => setBankModalVisible(true)}
                disabled={loadingBanks}
              >
                <View style={styles.bankSelectorLeft}>
                  <Icon name="business-outline" size={20} color="#666" />
                  {loadingBanks ? (
                    <Text style={styles.bankPlaceholderText}>
                      Loading banks...
                    </Text>
                  ) : (
                    <Text style={[
                      styles.bankSelectorText,
                      selectedBank ? styles.bankSelectedText : styles.bankPlaceholderText
                    ]}>
                      {selectedBank || 'Select bank'}
                    </Text>
                  )}
                </View>
                {loadingBanks ? (
                  <ActivityIndicator size="small" color="#666" />
                ) : (
                  <Icon name="chevron-down" size={20} color="#666" />
                )}
              </TouchableOpacity>
            </View>

            {/* Recipient Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Recipient Name *</Text>
              {recipientName ? (
                <View style={styles.recipientDisplay}>
                  <Icon name="person-circle-outline" size={20} color="#4CAF50" style={styles.recipientIcon} />
                  <Text style={styles.recipientNameText}>{recipientName}</Text>
                </View>
              ) : (
                <View style={styles.recipientPlaceholder}>
                  <Text style={styles.recipientPlaceholderText}>
                    {verifyingAccount ? 'Verifying account...' : 'Account name will appear here after verification'}
                  </Text>
                </View>
              )}
              {verifyingAccount && !recipientName && (
                <View style={styles.verificationStatus}>
                  <ActivityIndicator size="small" color="#4CAF50" />
                  <Text style={styles.verificationStatusText}>Verifying account...</Text>
                </View>
              )}
              {accountVerificationError && !verifyingAccount && (
                <View style={styles.verificationError}>
                  <Icon name="warning-outline" size={16} color="#F44336" />
                  <Text style={styles.verificationErrorText}>{accountVerificationError}</Text>
                </View>
              )}
            </View>

            {/* Description (Optional) */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add a note for this transfer"
                placeholderTextColor="#999"
                value={description}
                onChangeText={setDescription}
                multiline
                maxLength={100}
              />
              <Text style={styles.charCount}>{description.length}/100</Text>
            </View>

            {/* Error Display */}
            {error && (
              <View style={styles.errorContainer}>
                <Icon name="warning-outline" size={20} color="#F44336" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Account Verification Status */}
            {recipientName && !accountVerificationError && !verifyingAccount && (
              <View style={styles.successContainer}>
                <Icon name="checkmark-circle-outline" size={20} color="#4CAF50" />
                <Text style={styles.successText}>Account verified successfully!</Text>
              </View>
            )}

            {/* Warning Message */}
            <View style={styles.warningBox}>
              <Icon name="shield-checkmark-outline" size={18} color="#4CAF50" />
              <Text style={styles.warningText}>
                All transfers are secure and encrypted. Double-check details before sending.
              </Text>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              style={[
                styles.continueButton,
                (!accountNumber || !selectedBank || !recipientName || loadingBanks || verifyingAccount) &&
                styles.continueButtonDisabled
              ]}
              onPress={validateAndProceed}
              disabled={!accountNumber || !selectedBank || !recipientName || loadingBanks || verifyingAccount}
            >
              <Text style={styles.continueButtonText}>
                {verifyingAccount ? 'Verifying...' : (loadingBanks ? 'Loading...' : 'Continue to Amount')}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bank Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={bankModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.dragHandle} />
              <Text style={styles.modalTitle}>Select Bank</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={closeModal}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Icon name="search-outline" size={20} color="#999" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search bank by name..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={true}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Icon name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            {/* Loading State */}
            {loadingBanks ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Loading banks...</Text>
              </View>
            ) : (
              <>
                {/* Bank Count */}
                <View style={styles.bankCountContainer}>
                  <Text style={styles.bankCountText}>
                    {filteredBanks.length} banks available
                  </Text>
                </View>

                {/* Bank List */}
                <FlatList
                  data={filteredBanks}
                  keyExtractor={(item) => item.id?.toString() || item.code || item.name}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.bankItem,
                        selectedBank === item.name && styles.bankItemSelected
                      ]}
                      onPress={() => handleSelectBank(item)}
                    >
                      <View style={styles.bankItemLeft}>
                        <View style={styles.bankIconContainer}>
                          <Icon name="business-outline" size={20} color="#4CAF50" />
                        </View>
                        <View style={styles.bankInfo}>
                          <Text style={styles.bankName}>{item.name}</Text>
                          {item.code && (
                            <Text style={styles.bankCode}>Code: {item.code}</Text>
                          )}
                        </View>
                      </View>
                      {selectedBank === item.name && (
                        <Icon name="checkmark-circle" size={24} color="#4CAF50" />
                      )}
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <View style={styles.emptyList}>
                      <Icon name="search" size={40} color="#DDD" />
                      <Text style={styles.emptyText}>No banks found</Text>
                    </View>
                  }
                  contentContainerStyle={styles.flatListContent}
                  showsVerticalScrollIndicator={true}
                />
              </>
            )}

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={closeModal}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Add formatBalance function
const formatBalance = (balance) => {
  return `₦${parseFloat(balance).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
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
  balanceCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -15,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
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
  formCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  accountInputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#212121',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  verificationIndicator: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  verificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  verificationStatusText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 8,
  },
  verificationError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  verificationErrorText: {
    fontSize: 14,
    color: '#F44336',
    marginLeft: 8,
    flex: 1,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  successText: {
    fontSize: 14,
    color: '#2E7D32',
    marginLeft: 8,
    flex: 1,
  },
  bankSelector: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  bankSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bankSelectorText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  bankSelectedText: {
    color: '#212121',
  },
  bankPlaceholderText: {
    color: '#999',
  },
  // Recipient name display styles
  recipientDisplay: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  recipientIcon: {
    marginRight: 12,
  },
  recipientNameText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '500',
    flex: 1,
  },
  recipientPlaceholder: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  recipientPlaceholderText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    marginLeft: 8,
    flex: 1,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 14,
    color: '#2E7D32',
    marginLeft: 8,
    flex: 1,
  },
  continueButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#C8E6C9',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
    maxHeight: '90%',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  modalCloseButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
    marginLeft: 12,
    padding: 0,
  },
  loadingContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  bankCountContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    marginBottom: 10,
  },
  bankCountText: {
    fontSize: 14,
    color: '#666',
  },
  flatListContent: {
    paddingBottom: 10,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  bankItemSelected: {
    backgroundColor: '#F0F9F0',
  },
  bankItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bankIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 2,
  },
  bankCode: {
    fontSize: 12,
    color: '#666',
  },
  emptyList: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  cancelButton: {
    marginTop: 20,
    paddingVertical: 14,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 120,
  },
});

export default FarmerSendMoneyScreen;
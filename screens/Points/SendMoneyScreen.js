import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons as Icon } from "@expo/vector-icons";
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://jekfarms.com.ng';

const SendMoneyScreen = () => {
  const [accountNumber, setAccountNumber] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedBankCode, setSelectedBankCode] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [description, setDescription] = useState(''); // Added description state
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [transferType, setTransferType] = useState('local');
  const [swiftCode, setSwiftCode] = useState('');
  const [iban, setIban] = useState('');

  // API states
  const [banks, setBanks] = useState([]);
  const [filteredBanks, setFilteredBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [error, setError] = useState(null);

  // Account verification states
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [accountVerificationError, setAccountVerificationError] = useState(null);

  const navigation = useNavigation();
  const route = useRoute();

  // Get transfer type from navigation params
  useEffect(() => {
    if (route.params?.transferType) {
      setTransferType(route.params.transferType);
    }
  }, [route.params]);

  // Fetch banks from API using GET method
  useEffect(() => {
    fetchBanks();
  }, []);

  // Filter banks when search query changes
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
      // Only verify if we have both account number and bank code
      if (accountNumber.length >= 8 && selectedBankCode && !verifyingAccount && transferType === 'local') {
        await verifyAccount();
      }
    };

    // A delay to prevent too many API calls while typing
    const timer = setTimeout(() => {
      verifyAccountDetails();
    }, 1000); // 1 second delay

    return () => clearTimeout(timer);
  }, [accountNumber, selectedBankCode]);

  const fetchBanks = async () => {
    try {
      setLoadingBanks(true);
      setError(null);

      // Use GET method to fetch banks
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
      } else if (data.data && Array.isArray(data.data)) {
        bankList = data.data.map(bank => ({
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
      setError(`Failed to load banks: ${error.message}`);
      setBanks([]);
      setFilteredBanks([]);

    } finally {
      setLoadingBanks(false);
    }
  };

  // Function to verify account details using POST method
  const verifyAccount = async () => {
    if (!accountNumber || !selectedBankCode || transferType !== 'local') {
      return;
    }

    setVerifyingAccount(true);
    setAccountVerificationError(null);

    try {
      const payload = {
        accountNumber: accountNumber.trim(),
        bankCode: selectedBankCode.trim()
      };

      // Use POST method to verify account
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
      setAccountVerificationError('Unable to verify account. Please check network connection.');
      setRecipientName('');
    } finally {
      setVerifyingAccount(false);
    }
  };

  // Validate inputs and show confirmation warning
  const validateAndProceed = () => {
    // Basic validation
    if (!accountNumber || !selectedBank || !recipientName) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    if (transferType === 'local' && accountNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit account number.');
      return;
    }

    if (recipientName.trim().length < 2) {
      Alert.alert('Error', 'Please enter a valid recipient name.');
      return;
    }

    // For foreign transfers - additional validation
    if (transferType === 'foreign') {
      if (!swiftCode || !iban) {
        Alert.alert('Error', 'Please enter SWIFT code and IBAN for foreign transfer.');
        return;
      }
    }

    // Show confirmation warning
    Alert.alert(
      ' IMPORTANT: Confirm Details',
      `Please verify these details carefully:\n\n` +
      `Account Number: ${accountNumber}\n` +
      `Bank: ${selectedBank}\n` +
      `Recipient: ${recipientName}\n` +
      `${description ? `Description: ${description}\n` : ''}` +
      `${transferType === 'foreign' ? `SWIFT: ${swiftCode}\nIBAN: ${iban}\n` : ''}\n` +
      `Transfers to wrong accounts cannot be automatically reversed.\n` +
      `Ensure all information is correct before proceeding.`,
      [
        {
          text: 'Go Back and Edit',
          style: 'cancel'
        },
        {
          text: 'Yes, Details are Correct',
          onPress: () => navigateToAmountScreen(),
          style: 'destructive'
        }
      ]
    );
  };

  // Navigate to EnterAmountScreen
  const navigateToAmountScreen = () => {
    const transferData = {
      accountNumber,
      selectedBank,
      selectedBankCode,
      recipientName: recipientName.trim(),
      description: description.trim(), // Include description
      fundingType: transferType === 'foreign' ? 'foreign' : 'bank',
      transferType,
    };

    // Add foreign transfer fields if applicable
    if (transferType === 'foreign') {
      transferData.swiftCode = swiftCode;
      transferData.iban = iban;
    }

    navigation.navigate('EnterAmountScreen', transferData);
  };

  const handleSelectBank = (bank) => {
    setSelectedBank(bank.name);
    setSelectedBankCode(bank.code);

    // Clear recipient name when bank changes (for local transfers only)
    if (transferType === 'local') {
      setRecipientName('');
      setAccountVerificationError(null);
    }

    closeModal();
  };

  const handleAccountNumberChange = (text) => {
    // Only allow numbers
    const cleanedText = text.replace(/[^0-9]/g, '');
    setAccountNumber(cleanedText);

    // Clear recipient name and errors when account number changes (for local transfers only)
    if (transferType === 'local') {
      if (recipientName) {
        setRecipientName('');
      }
      if (accountVerificationError) {
        setAccountVerificationError(null);
      }
    }
  };

  // Clear search when modal closes
  const closeModal = () => {
    setBankModalVisible(false);
    setSearchQuery('');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.goBack} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>
          {transferType === 'foreign' ? 'Foreign Transfer' : 'Send Money'}
        </Text>
      </View>

      {/* Form Card */}
      <View style={styles.card}>
        <Text style={styles.label}>Recipient Account</Text>

        {/* Account Number Input */}
        <View style={styles.accountInputContainer}>
          <TextInput
            style={styles.input}
            placeholder={
              transferType === 'foreign'
                ? "Enter account number..."
                : "Enter account number"
            }
            keyboardType="numeric"
            maxLength={transferType === 'foreign' ? 20 : 10}
            value={accountNumber}
            onChangeText={handleAccountNumberChange}
          />
          {verifyingAccount && transferType === 'local' && (
            <ActivityIndicator
              size="small"
              color="#0ab14fff"
              style={styles.verificationIndicator}
            />
          )}
        </View>

        {/* Bank Selector */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setBankModalVisible(true)}
          disabled={loadingBanks}
        >
          <Icon
            name="business-outline"
            size={20}
            color="#555"
            style={{ marginRight: 8 }}
          />
          {loadingBanks ? (
            <Text style={{ flex: 1, color: '#999' }}>Loading banks...</Text>
          ) : (
            <Text style={{ flex: 1, color: selectedBank ? '#000' : '#999' }}>
              {selectedBank || 'Select Bank'}
            </Text>
          )}
          {loadingBanks ? (
            <ActivityIndicator size="small" color="#555" />
          ) : (
            <Icon name="chevron-down" size={20} color="#555" />
          )}
        </TouchableOpacity>

        {/* Recipient Name */}
        {transferType === 'local' ? (
          <View style={styles.recipientGroup}>
            {recipientName ? (
              <View style={styles.recipientDisplay}>
                <Icon name="person-circle-outline" size={20} color="#0ab14fff" style={styles.recipientIcon} />
                <Text style={styles.recipientNameText}>{recipientName}</Text>
              </View>
            ) : (
              <TextInput
                style={[
                  styles.input,
                  verifyingAccount && styles.verifyingInput
                ]}
                placeholder={
                  verifyingAccount
                    ? "Verifying account..."
                    : "Account name will appear here after verification"
                }
                value={recipientName}
                editable={false}
                placeholderTextColor="#999"
              />
            )}
            {verifyingAccount && !recipientName && (
              <View style={styles.verificationStatus}>
                <ActivityIndicator size="small" color="#0ab14fff" />
                <Text style={styles.verificationStatusText}>Verifying account...</Text>
              </View>
            )}
            {accountVerificationError && !verifyingAccount && (
              <View style={styles.verificationErrorContainer}>
                <Icon name="warning-outline" size={16} color="#FF6B6B" />
                <Text style={styles.verificationErrorText}>{accountVerificationError}</Text>
              </View>
            )}
          </View>
        ) : (
          <TextInput
            style={styles.input}
            placeholder="Recipient Full Name"
            value={recipientName}
            onChangeText={setRecipientName}
          />
        )}

        {/* Foreign Transfer Specific Fields */}
        {transferType === 'foreign' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="SWIFT/BIC Code"
              value={swiftCode}
              onChangeText={setSwiftCode}
              autoCapitalize="characters"
            />

            <TextInput
              style={styles.input}
              placeholder="IBAN"
              value={iban}
              onChangeText={setIban}
              autoCapitalize="characters"
            />
          </>
        )}

        {/* Description Field */}
        <View style={styles.descriptionContainer}>
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Add description (optional)"
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={100}
          />
          <Text style={styles.charCount}>{description.length}/100</Text>
        </View>

        {/* Warning Message - Only show for foreign transfers */}
        {transferType === 'foreign' && (
          <View style={styles.warningContainer}>
            <Icon name="warning-outline" size={18} color="#FF9800" />
            <Text style={styles.warningText}>
              ⚠️ No automatic verification available. Please double-check all details carefully.
            </Text>
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Icon name="warning-outline" size={20} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}



        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.button,
            (!accountNumber || !selectedBank || !recipientName || loadingBanks || verifyingAccount) && styles.buttonDisabled
          ]}
          onPress={validateAndProceed}
          disabled={!accountNumber || !selectedBank || !recipientName || loadingBanks || verifyingAccount}
        >
          <Text style={styles.buttonText}>
            {verifyingAccount ? 'Verifying...' : 'Continue to Amount'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bank Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={bankModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Drag handle */}
            <View style={styles.dragHandle} />

            <Text style={styles.modalTitle}>Select Bank</Text>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Icon name="search-outline" size={20} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search bank by name..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
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
              <View style={styles.loadingContainerModal}>
                <ActivityIndicator size="large" color="#0ab14fff" />
                <Text style={styles.loadingTextModal}>Loading banks...</Text>
              </View>
            ) : (
              <>
                {/* Bank Count */}
                <View style={styles.bankCountContainer}>
                  <Text style={styles.bankCountText}>
                    {filteredBanks.length} banks {searchQuery ? 'found' : 'available'}
                  </Text>
                </View>

                {/* Bank List Container */}
                <View style={styles.bankListContainer}>
                  <FlatList
                    data={filteredBanks}
                    keyExtractor={(item) => item.id?.toString() || item.code || item.name}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.bankItem}
                        onPress={() => handleSelectBank(item)}
                      >
                        <Icon
                          name="business-outline"
                          size={24}
                          color="#444"
                          style={styles.bankIcon}
                        />

                        <View style={styles.bankInfo}>
                          <Text style={styles.bankName}>{item.name}</Text>
                          {item.code && (
                            <Text style={styles.bankCode}>Code: {item.code}</Text>
                          )}
                        </View>

                        {selectedBank === item.name && (
                          <Icon
                            name="checkmark-circle"
                            size={24}
                            color="#0ab14fff"
                          />
                        )}
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                      <View style={styles.emptyList}>
                        <Icon name="search" size={40} color="#ddd" />
                        <Text style={styles.emptyText}>No banks found</Text>
                      </View>
                    }
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={styles.flatListContent}
                  />
                </View>
              </>
            )}

            {/* Done Button */}
            <View style={styles.doneButtonContainer}>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={closeModal}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SendMoneyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f1f1ff',
    paddingHorizontal: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    marginHorizontal: 12,
  },
  goBack: {
    backgroundColor: "#0ab14fff",
    padding: 14,
    color: "#fff",
    borderRadius: 100,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    width: 250,
    textAlign: 'center',
    fontFamily: "Inter_400Regular",
    paddingVertical: 20,
    color: '#000',
    backgroundColor: "#f2f8f2ff",
    borderRadius: 26
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingBottom: 50,
    paddingTop: 16,
    elevation: 2,
  },
  label: {
    fontWeight: '600',
    marginBottom: 16,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  accountInputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#eee',
    borderRadius: 28,
    paddingHorizontal: 15,
    color: "#979595ff",
    paddingVertical: 20,
    fontSize: 14,
    marginBottom: 20,
    fontFamily: "Inter_400Regular",
  },
  verifyingInput: {
    backgroundColor: '#fff8e1',
    color: '#FF9800',
  },
  verificationIndicator: {
    position: 'absolute',
    right: 15,
    top: 20,
  },
  recipientGroup: {
    marginBottom: 20,
  },
  recipientDisplay: {
    backgroundColor: '#f0f9f0',
    borderRadius: 28,
    paddingHorizontal: 15,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  recipientIcon: {
    marginRight: 12,
  },
  recipientNameText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
    flex: 1,
    fontFamily: "Inter_400Regular",
  },
  verificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  verificationStatusText: {
    fontSize: 12,
    color: '#0ab14fff',
    marginLeft: 8,
    fontFamily: "Inter_400Regular",
  },
  verificationErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  verificationErrorText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginLeft: 8,
    flex: 1,
    fontFamily: "Inter_400Regular",
  },
  descriptionContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  descriptionInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
    fontFamily: "Inter_400Regular",
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    fontFamily: "Inter_400Regular",
    borderRadius: 24,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#0ab14fff",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    fontFamily: "Inter_400Regular",
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8e1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    marginTop: 10,
  },
  warningText: {
    fontSize: 12,
    color: '#FF9800',
    marginLeft: 8,
    flex: 1,
    fontFamily: "Inter_400Regular",
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginLeft: 8,
    flex: 1,
    fontFamily: "Inter_400Regular",
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9f0',
    padding: 8,
    borderRadius: 8,
    marginBottom: 15,
  },


  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    height: '85%',
  },
  dragHandle: {
    width: 50,
    height: 5,
    backgroundColor: '#d1d5db',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
    fontFamily: "Inter_400Regular",
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontFamily: "Inter_400Regular",
  },
  bankCountContainer: {
    paddingVertical: 8,
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  bankCountText: {
    fontSize: 14,
    color: '#666',
    fontFamily: "Inter_400Regular",
  },
  bankListContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 10,
  },
  flatListContent: {
    paddingVertical: 5,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bankIcon: {
    marginRight: 15,
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    color: '#333',
    fontFamily: "Inter_400Regular",
    marginBottom: 2,
  },
  bankCode: {
    fontSize: 12,
    color: '#666',
    fontFamily: "Inter_400Regular",
  },
  doneButtonContainer: {
    marginTop: 10,
  },
  doneButton: {
    backgroundColor: '#0ab14fff',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  emptyList: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    fontFamily: "Inter_400Regular",
  },
  loadingContainerModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingTextModal: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    fontFamily: "Inter_400Regular",
  },
});
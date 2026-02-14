import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Clipboard,
  Animated,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const { width } = Dimensions.get('window');

// API configuration
const API_BASE_URL = 'https://jekfarms.com.ng';
const PERMANENT_ACCOUNT_ENDPOINT = '/data/pay/permanent.php';

export default function DepositScreen({ navigation, route }) {
  const { fundingType, transferType } = route.params || {};

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userAccount, setUserAccount] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // User's reference number from api
  const [userReference, setUserReference] = useState(null);

  // Animation for copy feedback
  const copyAnim = useRef(new Animated.Value(0)).current;

  // Load user data and account on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Load user data from AsyncStorage
  const loadUserData = async () => {
    try {
      setIsLoading(true);

      const possibleKeys = ['userData', 'user', 'user_info', 'auth_user'];
      let foundUserName = '';
      let foundUserEmail = '';
      let foundUserId = null;

      for (const key of possibleKeys) {
        const userData = await AsyncStorage.getItem(key);
        if (userData) {
          try {
            const parsedData = JSON.parse(userData);
            foundUserId = parsedData.id || parsedData.user_id || parsedData.uid;
            foundUserEmail = parsedData.email || parsedData.user_email;

            // Extract name from various possible fields
            foundUserName = parsedData.name ||
              parsedData.full_name ||
              parsedData.fullName ||
              parsedData.first_name ||
              parsedData.username ||
              (foundUserId ? `User ${foundUserId}` : 'User');

            if (foundUserName && foundUserEmail) break;
          } catch (error) {
            console.error(`Error parsing data from "${key}":`, error);
          }
        }
      }

      if (!foundUserName || !foundUserEmail) {
        throw new Error("User information not found. Please login again.");
      }

      setUserName(foundUserName);
      setUserEmail(foundUserEmail);

      // Load KYC status
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsed = JSON.parse(userData);
        const hasKyc = parsed.customer_bvn || parsed.nin_number || parsed.has_bvn || parsed.has_nin;
        if (!hasKyc) {
          setErrorMessage('KYC_REQUIRED');
          setIsLoading(false);
          return;
        }
      }

      // Now load or generate account
      await loadOrGenerateAccount(foundUserName, foundUserEmail);

    } catch (error) {
      console.error('Error loading user data:', error);
      setErrorMessage('User session expired. Please login again.');
      setIsLoading(false);
    }
  };

  // Function to load existing account or generate new one
  const loadOrGenerateAccount = async (userName, userEmail) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      // Try to load existing account from storage
      const storageKey = `user_dedicated_account_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const savedAccount = await AsyncStorage.getItem(storageKey);

      if (savedAccount) {
        console.log("Found saved dedicated account for:", userEmail);
        const accountData = JSON.parse(savedAccount);

        // Verify account hasn't expired
        const accountAge = Date.now() - new Date(accountData.generatedAt).getTime();
        const daysOld = accountAge / (1000 * 60 * 60 * 24);

        // If account is less than 30 days old, use it
        if (daysOld < 30) {
          setUserAccount(accountData);
          if (accountData.reference) {
            setUserReference(accountData.reference);
          }
          setIsLoading(false);
          return;
        } else {
          console.log("Account expired, generating new one");
          await AsyncStorage.removeItem(storageKey);
        }
      }

      // If no saved account or expired, generate a new one
      await generatePermanentAccount(userName, userEmail);

    } catch (error) {
      console.error('Error loading/generating account:', error);
      setErrorMessage('Failed to load account details. Please try again.');
      setIsLoading(false);
    }
  };

  // Generate permanent account from backend - FIXED FOR APK
  const generatePermanentAccount = async (userName, userEmail) => {
    try {
      setIsGenerating(true);
      setErrorMessage(null);
      console.log('Generating permanent account for:', userName);

      // 1. GET USER ID 
      let userId = null;
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          userId = userData.id || userData.user_id || userData.uid || userData.userId;
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }

      if (!userId) {
        userId = `temp_${Date.now()}`;
      }

      // 2. SIMPLIFIED PAYLOAD
      const requestData = {
        action: 'init',
        name: userName,
        email: userEmail,
        user_id: userId
      };

      console.log('Full URL:', `https://jekfarms.com.ng/data/pay/permanent.php`);
      console.log('Payload:', JSON.stringify(requestData));

      // 3. SIMPLIFIED CONFIG FOR APK (no complex headers)
      const config = {
        timeout: 30000, // 30 seconds timeout for mobile networks
        headers: {
          'Content-Type': 'application/json',
        }
      };

      const response = await axios.post(
        `https://jekfarms.com.ng/data/pay/permanent.php`,
        requestData,
        config
      );

      console.log('Response Status:', response.status);
      console.log('Response Data:', response.data);

      // 4. HANDLE RESPONSE
      let responseData = response.data;

      // If response is string, try to parse it
      if (typeof responseData === 'string') {
        try {
          responseData = JSON.parse(responseData);
        } catch (e) {
          throw new Error(`Server returned non-JSON: ${responseData.substring(0, 100)}`);
        }
      }

      // 5. PARSE SUCCESS RESPONSE
      if (responseData.status === 'success' && responseData.data) {
        const accountData = responseData.data;

        if (!accountData.accounts || accountData.accounts.length === 0) {
          throw new Error('API returned no bank accounts');
        }

        const firstAccount = accountData.accounts[0];

        const accountDetails = {
          bankName: firstAccount.bankName,
          accountNumber: firstAccount.accountNumber,
          accountName: firstAccount.accountName,
          bankCode: firstAccount.bankCode,
          reference: accountData.accountReference || `JEK_${userName.substring(0, 3)}_${Date.now().toString().slice(-8)}`,
          customerName: accountData.customerName,
          isPermanent: true,
          generatedAt: new Date().toISOString(),
          userName: userName,
          userEmail: userEmail
        };

        console.log('Account Created:', JSON.stringify(accountDetails, null, 2));

        // Store and update state
        setUserAccount(accountDetails);
        setUserReference(accountDetails.reference);

        const storageKey = `user_dedicated_account_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
        await AsyncStorage.setItem(storageKey, JSON.stringify(accountDetails));

        Alert.alert(
          'Success',
          'Your permanent account has been generated successfully!',
          [{ text: 'OK' }]
        );

        return; // Success!

      } else if (responseData.status === 'error') {
        throw new Error(responseData.message || 'API error');
      } else {
        throw new Error('Unexpected response format: ' + JSON.stringify(responseData));
      }

    } catch (error) {
      console.error('Account Generation Error:', {
        name: error.name,
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });

      // Detailed error message
      let errorMsg = 'Failed to generate account. ';

      if (error.code === 'ECONNABORTED') {
        errorMsg = 'Request timeout. Please check your internet connection and try again.';
      } else if (error.message.includes('Network Error')) {
        errorMsg = 'Network error. Please check your internet connection.';
      } else if (error.response) {
        errorMsg += `Server ${error.response.status}: `;
        if (error.response.data) {
          errorMsg += JSON.stringify(error.response.data);
        }
      } else {
        errorMsg += error.message;
      }

      setErrorMessage(errorMsg);

      Alert.alert(
        'Account Generation Failed',
        errorMsg,
        [
          {
            text: 'Try Again',
            onPress: () => generatePermanentAccount(userName, userEmail)
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );

    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text, fieldName) => {
    try {
      await Clipboard.setString(text);
      setCopiedField(fieldName);

      Animated.sequence([
        Animated.timing(copyAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(copyAnim, {
          toValue: 0,
          duration: 200,
          delay: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCopiedField(null);
      });

      Alert.alert('Copied!', `${fieldName} copied to clipboard`);
    } catch (error) {
      console.error('Copy failed:', error);
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  const generateNewReference = () => {
    const newRef = `JEK_${userName.substring(0, 3)}_${Date.now().toString().slice(-8)}`;
    setUserReference(newRef);

    if (userAccount) {
      const updatedAccount = { ...userAccount, reference: newRef };
      setUserAccount(updatedAccount);
      const storageKey = `user_dedicated_account_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
      AsyncStorage.setItem(storageKey, JSON.stringify(updatedAccount));
    }

    Alert.alert('New Reference', `New reference generated: ${newRef}`);
  };

  // Loading screen
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Deposit via Bank Transfer</Text>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#41B63E" />
          <Text style={styles.loadingText}>
            {isGenerating ? 'Generating your dedicated account...' : 'Loading...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // KYC Required state
  if (errorMessage === 'KYC_REQUIRED') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Account Setup Required</Text>
        </View>

        <View style={styles.errorContainer}>
          <Ionicons name="shield-checkmark" size={60} color="#10B981" />
          <Text style={styles.errorTitle}>KYC Verification Needed</Text>
          <Text style={styles.errorMessage}>
            To generate a dedicated account for bank transfers, you need to provide your BVN or NIN for verification.
          </Text>

          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: '#10B981', width: '90%' }]}
            onPress={() => navigation.navigate('CreateVirtualAccount')}
          >
            <Ionicons name="person-add" size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.retryButtonText}>Complete Verification</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#666', marginTop: 15, width: '90%' }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.retryButtonText, { color: '#666' }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (errorMessage && !userAccount) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Deposit via Bank Transfer</Text>
        </View>

        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color="#FF6B6B" />
          <Text style={styles.errorTitle}>Unable to Generate Account</Text>
          <Text style={styles.errorMessage}>{errorMessage}</Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadUserData}
          >
            <Ionicons name="refresh" size={20} color="white" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Main render
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Dedicated Account</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Banner */}
        <View style={styles.successBanner}>
          <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
          <View style={styles.bannerTextContainer}>
            <Text style={styles.successTitle}>Personal Account Generated</Text>
            <Text style={styles.successSubtext}>For: {userName}</Text>
          </View>
        </View>

        {/* Account Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-circle" size={28} color="#41B63E" />
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>Account Details</Text>
              <Text style={styles.cardSubtitle}>Use for all deposits</Text>
            </View>
          </View>

          {/* Bank Name */}
          <View style={styles.detailRow}>
            <View style={styles.detailLabelContainer}>
              <Ionicons name="bank" size={20} color="#666" />
              <Text style={styles.detailLabel}>Bank:</Text>
            </View>
            <View style={styles.detailValueContainer}>
              <Text style={styles.detailValue}>{userAccount?.bankName}</Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(userAccount?.bankName, 'Bank Name')}
              >
                <Ionicons
                  name={copiedField === 'Bank Name' ? "checkmark" : "copy"}
                  size={18}
                  color={copiedField === 'Bank Name' ? "#41B63E" : "#666"}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Account Number */}
          <View style={styles.detailRow}>
            <View style={styles.detailLabelContainer}>
              <Ionicons name="card" size={20} color="#666" />
              <Text style={styles.detailLabel}>Account No:</Text>
            </View>
            <View style={styles.detailValueContainer}>
              <Text style={[styles.detailValue, styles.importantValue]}>
                {userAccount?.accountNumber}
              </Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(userAccount?.accountNumber, 'Account Number')}
              >
                <Ionicons
                  name={copiedField === 'Account Number' ? "checkmark" : "copy"}
                  size={18}
                  color={copiedField === 'Account Number' ? "#41B63E" : "#666"}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Account Holder */}
          <View style={styles.detailRow}>
            <View style={styles.detailLabelContainer}>
              <Ionicons name="person" size={20} color="#666" />
              <Text style={styles.detailLabel}>Account Holder:</Text>
            </View>
            <View style={styles.detailValueContainer}>
              <Text style={styles.detailValue}>{userAccount?.accountName}</Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(userAccount?.accountName, 'Account Holder')}
              >
                <Ionicons
                  name={copiedField === 'Account Holder' ? "checkmark" : "copy"}
                  size={18}
                  color={copiedField === 'Account Holder' ? "#41B63E" : "#666"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Reference Card */}
        <View style={styles.detailsCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={28} color="#FF9800" />
            <Text style={styles.cardTitle}>Payment Reference</Text>
          </View>
          <View style={styles.referenceContainer}>
            <Text style={styles.referenceValue}>{userReference}</Text>
            <TouchableOpacity
              onPress={() => copyToClipboard(userReference, 'Reference')}
            >
              <Ionicons
                name={copiedField === 'Reference' ? "checkmark" : "copy"}
                size={22}
                color="#41B63E"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.referenceNote}>Use as narration when transferring</Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.paymentButton]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="checkmark-circle" size={22} color="#fff" />
          <Text style={styles.paymentButtonText}>I've Made Payment</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paadingTop: 20
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#41B63E',
    paddingHorizontal: 30,
    paddingVertical: 30,
    marginTop: 50
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1E88E5',
    marginLeft: 12,
    lineHeight: 20,
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowIcon: {
    marginRight: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  importantValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#41B63E',
  },
  copyButton: {
    padding: 8,
    marginLeft: 8,
  },
  referenceContainer: {
    marginTop: 8,
  },
  referenceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  referenceValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  referenceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#41B63E',
    flex: 1,
    letterSpacing: 1,
  },
  referenceNote: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f9f0',
    borderRadius: 8,
  },
  generateButtonText: {
    fontSize: 14,
    color: '#41B63E',
    fontWeight: '500',
    marginLeft: 6,
  },
  instructionsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  instructionsContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  notesCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9800',
    marginLeft: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  noteItem: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    marginLeft: 4,
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
  paymentButton: {
    backgroundColor: '#41B63E',
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20
  },
  testButton: {
    backgroundColor: '#f0f9f0',
    borderWidth: 1,
    borderColor: '#41B63E',
  },
  testButtonText: {
    color: '#41B63E',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center'
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginTop: 16
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#41B63E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50'
  },
  successTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32'
  },
  successSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  bannerTextContainer: {
    marginLeft: 12,
    flex: 1
  },
  cardTitleContainer: {
    marginLeft: 12
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#666'
  },
});
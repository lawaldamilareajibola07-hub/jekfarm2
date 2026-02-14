import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Feather as Icon } from "@expo/vector-icons";
import { useNavigation, useRoute } from '@react-navigation/native';

const SwapSuccessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { amount, fundingType, transferType } = route.params || {};

  const getSuccessMessage = () => {
    if (fundingType === "crypto") {
      return "Crypto Funding Successful!";
    } else if (transferType === "foreign") {
      return "Foreign Transfer Successful!";
    } else {
      return "Local Transfer Successful!";
    }
  };

  const getSubtitle = () => {
    if (fundingType === "crypto") {
      return `Your cryptocurrency funding was processed successfully.`;
    } else if (transferType === "foreign") {
      return `Your international transfer of $${amount || '0.00'} was completed.`;
    } else {
      return `Your local transfer of ₦${amount || '0.00'} was completed.`;
    }
  };

  const handleGoToWallet = () => {
    console.log("Navigating to Wallet...");

    // Navigate to MainTabs and set the Wallet tab as active
    navigation.navigate('MainTabs', {
      screen: 'Wallet'  // This is the tab name in MainTabNavigator
    });
  };

  const handleViewTransactions = () => {
    // For now, just go to wallet (you could create a Transactions screen later)
    handleGoToWallet();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.circle}>
          <Icon name="check" size={50} color="#fff" />
        </View>

        {/* Success Title */}
        <Text style={styles.title}>{getSuccessMessage()}</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>{getSubtitle()}</Text>

        {/* Transaction Details */}
        <View style={styles.detailsBox}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction Type:</Text>
            <Text style={styles.detailValue}>
              {fundingType === "crypto" ? "Crypto Funding" :
                transferType === "foreign" ? "Foreign Transfer" : "Local Transfer"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={styles.detailValue}>
              {transferType === 'foreign' ? '$' : '₦'}{amount || '0.00'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date & Time:</Text>
            <Text style={styles.detailValue}>
              {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Completed</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reference:</Text>
            <Text style={styles.detailValue}>
              REF-{Date.now().toString().slice(-10)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleGoToWallet}
          >
            <Icon name="wallet" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>Go to Wallet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleViewTransactions}
          >
            <Icon name="list" size={20} color="#28a745" style={styles.buttonIcon} />
            <Text style={styles.secondaryButtonText}>View Transactions</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SwapSuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  circle: {
    backgroundColor: '#28a745',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  detailsBox: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  statusBadge: {
    backgroundColor: '#d4edda',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#155724',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#28a745',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#28a745',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
});
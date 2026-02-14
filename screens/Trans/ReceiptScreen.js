import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const ReceiptScreen = ({ route }) => {
  // Get the transaction data passed from Points screen
  const { transaction } = route.params || {};
  
  // If no transaction data, show a fallback
  if (!transaction) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.errorText}>⚠</Text>
          <Text style={styles.title}>No Transaction Data</Text>
        </View>
        <Text style={styles.message}>
          Transaction details not available. Please go back and try again.
        </Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Extract transaction details
  const {
    title,
    amount,
    type,
    time,
    source,
    reference,
    originalData
  } = transaction;

  // Format amount with proper sign
  const formattedAmount = `${amount > 0 ? '+' : ''}₦${Math.abs(amount).toLocaleString()}`;
  
  // Determine status based on transaction type
  const isCredit = amount > 0;
  const statusText = isCredit ? 'Credit Completed!' : 'Debit Completed!';
  const statusEmoji = isCredit ? '✔' : '➖';

  // Format date from originalData or use current time
  const getFormattedDate = () => {
    if (originalData?.created_at) {
      try {
        const date = new Date(originalData.created_at);
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      } catch (e) {
        return new Date().toLocaleString();
      }
    }
    return new Date().toLocaleString();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={[styles.statusEmoji, { color: isCredit ? '#139F2E' : '#EF4444' }]}>
          {statusEmoji}
        </Text>
        <Text style={styles.title}>{statusText}</Text>
        <Text style={styles.transactionType}>
          {type === 'credit' ? 'Deposit' : type === 'debit' ? 'Payment' : 'Transaction'}
        </Text>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={[styles.amount, { color: isCredit ? '#139F2E' : '#EF4444' }]}>
          {formattedAmount}
        </Text>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Transaction Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.value}>{title}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.label}>Transaction Type</Text>
            <Text style={styles.value}>
              {type === 'credit' ? 'Credit (Money In)' : 
               type === 'debit' ? 'Debit (Money Out)' : 'Transaction'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.label}>Payment Source</Text>
            <Text style={styles.value}>
              {source === 'INTERNAL' ? 'Internal Wallet' : 
               source === 'MONNIFY_DEPOSIT' ? 'Monnify Deposit' : 
               source || 'Wallet'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.label}>Reference Number</Text>
            <Text style={[styles.value, styles.reference]}>{reference}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.label}>Transaction Time</Text>
            <Text style={styles.value}>{time}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.label}>Transaction Date</Text>
            <Text style={styles.value}>{getFormattedDate()}</Text>
          </View>
        </View>

     
      </View>

     
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  statusEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 60,
    color: '#F59E0B',
  },
  title: {
    fontSize: 24,
    color: '#374151',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  transactionType: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginVertical: 30,
    paddingHorizontal: 20,
  },
  detailsContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  amount: {
    fontSize: 32,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 30,
  },
  detailSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  reference: {
    fontFamily: 'monospace',
    fontSize: 13,
  },
  buttonContainer: {
    gap: 12,
  },
  shareButton: {
    backgroundColor: '#22c55e',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  doneButton: {
    backgroundColor: '#F3F4F6',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  doneButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#3B82F6',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Debug section
  debugSection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#1F2937',
    borderRadius: 8,
  },
  debugTitle: {
    color: '#60A5FA',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  debugText: {
    color: '#D1D5DB',
    fontSize: 11,
    fontFamily: 'monospace',
  },
});

export default ReceiptScreen;
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons as Icon } from "@expo/vector-icons";

const SendCryptoScreen = () => {
  const [amount, setAmount] = React.useState('0');
  const [crypto, setCrypto] = React.useState('Bitcoin');

  const handleScanQR = () => {
    // Placeholder for QR scan functionality
    Alert.alert('QR Scan', 'QR scanning would be implemented here.');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Send</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>Cryptocurrency</Text>

      {/* Warning Box */}
      <View style={styles.warningBox}>
        <Text style={styles.warningText}>
          Only send to selected cryptocurrency{'\n'}
          Sending to a different address may result in loss of funds
        </Text>
      </View>

      {/* Selected Crypto */}
      <View style={styles.cryptoRow}>
        <Text style={styles.cryptoLabel}>Bitcoin</Text>
        <Icon name="arrow-drop-down" size={24} color="#000" />
      </View>

      {/* Amount Input */}
      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>Wallet token</Text>
        <TextInput
          style={styles.amountInput}
          value={amount}
          onChangeText={setAmount}
          placeholder="0"
          keyboardType="numeric"
        />
        <Text style={styles.amountUnit}>BTC</Text>
      </View>

      {/* QR Scan Button */}
      <TouchableOpacity style={styles.qrButton} onPress={handleScanQR}>
        <View style={styles.qrIcon}>
          {/* Placeholder for QR code icon or actual QR scanner preview */}
          <Icon name="qr-code-scanner" size={100} color="#ccc" />
        </View>
        <Text style={styles.qrText}>Scan QR code to get receive address</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    margin: 16,
  },
  warningBox: {
    backgroundColor: '#f0f9f0',
    borderWidth: 1,
    borderColor: '#4caf50',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    color: '#2e7d32',
    textAlign: 'center',
    lineHeight: 20,
  },
  cryptoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cryptoLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  amountContainer: {
    padding: 16,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  amountUnit: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  qrButton: {
    alignItems: 'center',
    padding: 16,
  },
  qrIcon: {
    width: 200,
    height: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  qrText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default SendCryptoScreen;
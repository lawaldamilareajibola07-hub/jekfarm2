import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  Clipboard,
  Image
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const CryptoFundingScreen = ({ navigation, route }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [cryptos, setCryptos] = useState([]);
  const [filteredCryptos, setFilteredCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddress, setShowAddress] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);
  const [userId, setUserId] = useState(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchCryptos();
    }
  }, [userId]);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredCryptos(cryptos);
    } else {
      const searchTerm = search.toLowerCase();
      const filtered = cryptos.filter((crypto) => {
        return (
          crypto.name.toLowerCase().includes(searchTerm) ||
          crypto.symbol.toLowerCase().includes(searchTerm)
        );
      });
      setFilteredCryptos(filtered);
    }
  }, [search, cryptos]);

  const getUserId = async () => {
    try {
      // Try to get user_id from route params first
      const routeUserId = route.params?.userId;
      if (routeUserId) {
        setUserId(routeUserId);
        return;
      }

      // If not in route params, get from AsyncStorage
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        const userData = JSON.parse(userString);
        const userId = userData.id || userData.user_id;
        if (userId) {
          setUserId(userId.toString());
        } else {
          setError("User ID not found. Please login again.");
          setLoading(false);
        }
      } else {
        setError("User not found. Please login again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error getting user ID:", err);
      setError("Failed to get user ID. Please login again.");
      setLoading(false);
    }
  };

  const fetchCryptos = async () => {
    if (!userId) {
      setError("User ID not available");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching wallets for user ID:", userId);
      
      const response = await fetch(
        `https://jekfarms.com.ng/jekfarm/api/bitnob_get_wallets.php?user_id=${encodeURIComponent(userId)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
      );
      
      console.log("API Response status:", response.status);
      
      const responseText = await response.text();
      console.log("API Response text:", responseText);
      
      if (!response.ok) {
        // Try to parse error message
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.error) {
            throw new Error(errorData.error);
          }
        } catch (parseError) {
          // If can't parse JSON, use status text
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse JSON:", parseError);
        throw new Error("Invalid response from server");
      }
      
      console.log("API Response data:", JSON.stringify(data, null, 2));
      
      // Handle error response
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Handle BITNOB_MODE error
      if (data.error && data.error.includes('BITNOB_MODE')) {
        throw new Error("Bitcoin service is currently unavailable. Please try again later.");
      }
      
      let extractedCryptos = [];
      
      // Check different response formats
      if (data.bitnob && Array.isArray(data.bitnob)) {
        // Filter only BTC and USDT wallets
        data.bitnob.forEach((wallet) => {
          if (wallet && wallet.currency) {
            const currency = wallet.currency.toUpperCase();
            if (currency === "BTC" || currency === "USDT") {
              extractedCryptos.push({
                id: wallet.id || `wallet-${currency}-${Date.now()}`,
                name: currency === "BTC" ? "Bitcoin" : "Tether",
                symbol: currency,
                address: wallet.address || null,
                qr_code: wallet.qr_code || null,
                balance: wallet.balance || "0",
                label: wallet.label || `${currency} Wallet`
              });
            }
          }
        });
      } 
      // Alternative format: check for wallets array
      else if (data.wallets && Array.isArray(data.wallets)) {
        data.wallets.forEach((wallet) => {
          if (wallet && wallet.currency) {
            const currency = wallet.currency.toUpperCase();
            if (currency === "BTC" || currency === "USDT") {
              extractedCryptos.push({
                id: wallet.id || `wallet-${currency}-${Date.now()}`,
                name: currency === "BTC" ? "Bitcoin" : "Tether",
                symbol: currency,
                address: wallet.address || null,
                qr_code: wallet.qr_code || null,
                balance: wallet.balance || "0",
                label: wallet.label || `${currency} Wallet`
              });
            }
          }
        });
      }
      // Check for direct format
      else if (data.currency) {
        const currency = data.currency.toUpperCase();
        if (currency === "BTC" || currency === "USDT") {
          extractedCryptos.push({
            id: data.id || `wallet-${currency}-${Date.now()}`,
            name: currency === "BTC" ? "Bitcoin" : "Tether",
            symbol: currency,
            address: data.address || null,
            qr_code: data.qr_code || null,
            balance: data.balance || "0",
            label: data.label || `${currency} Wallet`
          });
        }
      }
      
      // If no BTC or USDT wallets found, check if we have any response
      if (extractedCryptos.length === 0) {
        if (data.status === "success" || data.ok === true) {
          // API returned success but no wallet data
          setError("No Bitcoin or USDT wallet found. Please contact support to create a wallet.");
        } else if (data.message) {
          setError(data.message);
        } else {
          setError("No wallet data available");
        }
      } else {
        setCryptos(extractedCryptos);
        setFilteredCryptos(extractedCryptos);
      }
      
    } catch (err) {
      console.error("Error fetching cryptos:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [500, 0],
  });

  const handleSelectCrypto = (crypto) => {
    setSelected(crypto);
    setShowAddress(true);
    setAddressCopied(false);
    closeModal();
  };

  const copyAddressToClipboard = () => {
    if (selected && selected.address) {
      Clipboard.setString(selected.address);
      setAddressCopied(true);
      Alert.alert("Copied!", "Wallet address copied to clipboard");
      
      // Reset copied status after 3 seconds
      setTimeout(() => {
        setAddressCopied(false);
      }, 3000);
    }
  };

  const handleMadePayment = () => {
    Alert.alert(
      "Payment Received",
      "Your payment is being processed. It may take a few minutes to reflect in your wallet.",
      [
        {
          text: "Go Back",
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34C759" />
          <Text style={styles.loadingText}>Loading wallets...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading wallets</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchCryptos}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.supportButton}
            onPress={() => Alert.alert("Contact Support", "Please contact customer support for assistance.")}
          >
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!selected) {
      return (
        <View style={styles.cryptoListContainer}>
          <Text style={styles.cryptoListTitle}>Select a Cryptocurrency</Text>
          
          {cryptos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No wallets available</Text>
              <Text style={styles.emptyText}>
                Bitcoin or USDT wallet not found
              </Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={fetchCryptos}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filteredCryptos}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cryptoItem}
                  onPress={() => handleSelectCrypto(item)}
                >
                  <View style={styles.cryptoItemLeft}>
                    <View style={styles.cryptoIcon}>
                      <Text style={styles.cryptoIconText}>
                        {item.symbol === "BTC" ? "₿" : item.symbol === "USDT" ? "$" : "C"}
                      </Text>
                    </View>
                    <View style={styles.cryptoInfo}>
                      <Text style={styles.cryptoName}>{item.name}</Text>
                      <Text style={styles.cryptoSymbol}>{item.symbol}</Text>
                      {item.balance && (
                        <Text style={styles.cryptoBalance}>Balance: {item.balance} {item.symbol}</Text>
                      )}
                    </View>
                  </View>
                  <Text style={styles.selectText}>Select →</Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      );
    }

    if (selected && showAddress) {
      return (
        <View style={styles.addressContainer}>
          <View style={styles.selectedHeader}>
            <View style={styles.selectedCryptoIcon}>
              <Text style={styles.selectedCryptoIconText}>
                {selected.symbol === "BTC" ? "₿" : selected.symbol === "USDT" ? "$" : "C"}
              </Text>
            </View>
            <View style={styles.selectedCryptoInfo}>
              <Text style={styles.selectedCryptoName}>{selected.name}</Text>
              <Text style={styles.selectedCryptoSymbol}>{selected.symbol}</Text>
            </View>
            <TouchableOpacity 
              style={styles.changeButton}
              onPress={openModal}
            >
              <Text style={styles.changeButtonText}>Change</Text>
            </TouchableOpacity>
          </View>

          {/* Balance */}
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>{selected.balance} {selected.symbol}</Text>
          </View>

          {/* Address Section */}
          {selected.address ? (
            <>
              <View style={styles.addressSection}>
                <Text style={styles.addressLabel}>Deposit Address</Text>
                <View style={styles.addressBox}>
                  <Text style={styles.addressText} selectable={true}>
                    {selected.address}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={[styles.copyButton, addressCopied && styles.copyButtonCopied]}
                  onPress={copyAddressToClipboard}
                >
                  <Text style={styles.copyButtonText}>
                    {addressCopied ? "✓ Copied" : "Copy Address"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* QR Code Section - Only show if API provides QR code */}
              {selected.qr_code ? (
                <View style={styles.qrSection}>
                  <Text style={styles.qrLabel}>QR Code</Text>
                  <View style={styles.qrContainer}>
                    <Image 
                      source={{ uri: selected.qr_code }} 
                      style={styles.qrImage}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.qrNote}>Scan to deposit {selected.symbol}</Text>
                </View>
              ) : (
                <View style={styles.qrSection}>
                  <Text style={styles.qrLabel}>QR Code</Text>
                  <View style={styles.qrPlaceholder}>
                    <Text style={styles.qrPlaceholderText}>
                      QR Code not available
                    </Text>
                  </View>
                </View>
              )}

              {/* Instructions */}
              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsTitle}>Instructions:</Text>
                <Text style={styles.instructionsText}>
                  1. Send only {selected.symbol} to this address{"\n"}
                  2. Network confirmations may take 10-30 minutes{"\n"}
                  3. Minimum deposit: {selected.symbol === "BTC" ? "0.0001 BTC" : "10 USDT"}{"\n"}
                  4. Contact support if deposit doesn't appear after 1 hour
                </Text>
              </View>

              {/* Have Made Payment Button */}
              <TouchableOpacity 
                style={styles.paymentButton}
                onPress={handleMadePayment}
              >
                <Text style={styles.paymentButtonText}>I have made payment</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.noAddressContainer}>
              <Text style={styles.noAddressTitle}>Address Not Available</Text>
              <Text style={styles.noAddressText}>
                {selected.name} wallet address is not available. Please contact support.
              </Text>
            </View>
          )}
        </View>
      );
    }

    if (selected) {
      return (
        <View style={styles.selectedContainer}>
          <Text style={styles.selectedLabel}>Selected:</Text>
          <View style={styles.selectedCrypto}>
            <View style={styles.selectedCryptoIcon}>
              <Text style={styles.selectedCryptoIconText}>
                {selected.symbol === "BTC" ? "₿" : selected.symbol === "USDT" ? "$" : "C"}
              </Text>
            </View>
            <View style={styles.selectedCryptoInfo}>
              <Text style={styles.selectedCryptoName}>{selected.name}</Text>
              <Text style={styles.selectedCryptoSymbol}>{selected.symbol}</Text>
            </View>
            <TouchableOpacity 
              style={styles.viewAddressButton}
              onPress={() => setShowAddress(true)}
            >
              <Text style={styles.viewAddressButtonText}>View Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={{ color: "#fff", fontSize: 18 }}>←</Text>
        </TouchableOpacity>

        <View style={styles.iconContainer}>
          <Text style={{ color: "#34C759", fontWeight: "bold" }}>₿</Text>
        </View>

        <Text style={styles.headerText}>Crypto Funding</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search Bitcoin or USDT..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          placeholderTextColor="#999"
        />
        {search.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setSearch("")}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Warning Box */}
      <View style={styles.warningBox}>
        <Text style={styles.warningText}>
          ⚠️ Only send {selected?.symbol || "the selected cryptocurrency"} to this address.
          Sending other coins will result in permanent loss.
        </Text>
      </View>

      {/* Main Content */}
      {renderContent()}

      {/* Bottom Sheet Modal for wallet selection */}
      <Modal transparent visible={modalVisible} animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[styles.bottomSheet, { transform: [{ translateY }] }]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Cryptocurrency</Text>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {cryptos.length === 0 ? (
              <View style={styles.modalEmptyContainer}>
                <Text style={styles.modalEmptyText}>
                  No wallets available
                </Text>
              </View>
            ) : (
              <FlatList
                data={cryptos}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalListItem}
                    onPress={() => handleSelectCrypto(item)}
                  >
                    <View style={styles.modalListItemLeft}>
                      <View style={styles.modalListIcon}>
                        <Text style={styles.modalListIconText}>
                          {item.symbol === "BTC" ? "₿" : item.symbol === "USDT" ? "$" : "C"}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.modalListItemName}>{item.name}</Text>
                        <Text style={styles.modalListItemSymbol}>{item.symbol}</Text>
                        {item.balance && (
                          <Text style={styles.modalListItemBalance}>{item.balance} {item.symbol}</Text>
                        )}
                      </View>
                    </View>
                    {selected?.id === item.id && (
                      <Text style={styles.modalCheckmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
export default CryptoFundingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 30
  },
  backButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "#34C759",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "#e4fce8",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  headerText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: "600",
    color: "#3C2003",
  },
  searchContainer: {
    position: "relative",
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: "#f2f2f2",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: "#000",
    paddingRight: 40,
  },
  clearButton: {
    position: "absolute",
    right: 15,
    top: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  warningBox: {
    backgroundColor: "#FFF3CD",
    borderWidth: 1,
    borderColor: "#FFEAA7",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  warningText: {
    color: "#856404",
    fontSize: 13,
    lineHeight: 18,
  },
  selectedContainer: {
    marginBottom: 20,
  },
  selectedLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  selectedCrypto: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e4fce8",
    borderRadius: 15,
    padding: 15,
  },
  selectedCryptoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#34C759",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  selectedCryptoIconText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  selectedCryptoInfo: {
    flex: 1,
  },
  selectedCryptoName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  selectedCryptoSymbol: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  viewAddressButton: {
    backgroundColor: "#34C759",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  viewAddressButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  changeButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#34C759",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  changeButtonText: {
    color: "#34C759",
    fontSize: 12,
    fontWeight: "600",
  },
  addressContainer: {
    flex: 1,
  },
  selectedHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e4fce8",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  balanceContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#34C759",
  },
  addressSection: {
    marginBottom: 20,
  },
  addressLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  addressBox: {
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  addressText: {
    fontSize: 12,
    color: "#333",
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  copyButton: {
    backgroundColor: "#34C759",
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: "center",
  },
  copyButtonCopied: {
    backgroundColor: "#28A745",
  },
  copyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  qrSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  qrLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  qrContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    marginBottom: 10,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  qrPlaceholder: {
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    marginBottom: 10,
  },
  qrPlaceholderText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  qrNote: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  instructionsContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
  },
  paymentButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  paymentButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  noAddressContainer: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "#FFF3CD",
    borderRadius: 10,
    marginBottom: 20,
  },
  noAddressTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#856404",
    marginBottom: 10,
  },
  noAddressText: {
    fontSize: 14,
    color: "#856404",
    textAlign: "center",
    lineHeight: 20,
  },
  cryptoListContainer: {
    flex: 1,
  },
  cryptoListTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3C2003",
    marginBottom: 15,
  },
  cryptoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    marginBottom: 10,
  },
  cryptoItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cryptoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#34C759",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cryptoIconText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  cryptoInfo: {
    flex: 1,
  },
  cryptoName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  cryptoSymbol: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  cryptoBalance: {
    fontSize: 11,
    color: "#34C759",
    marginTop: 2,
  },
  selectText: {
    color: "#34C759",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
  },
  errorContainer: {
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3B30",
    marginBottom: 8,
    textAlign: "center",
  },
  errorSubtext: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  emptyText: {
    color: "#999",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#34C759",
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  closeButton: {
    fontSize: 20,
    color: "#666",
  },
  modalListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalListItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  modalListIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#34C759",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  modalListIconText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalListItemName: {
    fontSize: 16,
    color: "#000",
    marginBottom: 2,
  },
  modalListItemSymbol: {
    fontSize: 12,
    color: "#666",
  },
  modalListItemBalance: {
    fontSize: 11,
    color: "#34C759",
    marginTop: 2,
  },
  modalCheckmark: {
    color: "#34C759",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalEmptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  modalEmptyText: {
    color: "#666",
    fontSize: 14,
  },
});
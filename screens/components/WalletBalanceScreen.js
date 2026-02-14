import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api/api';
import useravatar from "../../assets/useravatar.png";
import notification from "../../assets/direct-notification.png";
import recieveImg from "../../assets/Receive.png";
import sendImg from "../../assets/Send.png";
import BTCconvertImg from "../../assets/BTCconvert.png";
import converImg from "../../assets/Convert.png";
import { SafeAreaView } from 'react-native-safe-area-context';
import KYCBanner from '../../components/KYCBanner';

const WalletBalanceScreen = () => {
  const navigation = useNavigation();
  const [balance, setBalance] = useState('₦0.00');
  const [btcBalance, setBtcBalance] = useState('0.00 BTC');
  const [usdBalance, setUsdBalance] = useState('$0.00');
  const [btcAmount, setBtcAmount] = useState(0);
  const [usdAmount, setUsdAmount] = useState(0);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [btcLoading, setBtcLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(0);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(null);

  // Get user data from storage
  const getUserData = async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        const parsedData = JSON.parse(userString);
        setUserData(parsedData);
        setUserEmail(parsedData.email || '');
        return parsedData;
      }
      return null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  };

  // Update the displayed balance and storage
  const updateDisplayBalance = (amount, userData) => {
    const formattedBalance = `₦${amount.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

    setBalance(formattedBalance);

    // Update stored user data with new balance
    const updatedUser = {
      ...userData,
      wallet_balance: amount,
      balance: amount
    };

    AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    setUserData(updatedUser);

    return updatedUser;
  };

  // Sync with API - PRIORITIZE FAST RESPONSE
  const syncWithApi = async (userData) => {
    try {
      const email = userData.email;
      const userId = userData.id || userData.user_id;

      // Quick API call with short timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch('https://jekfarms.com.ng/jekfarm/api/data/pay/get_wallet_balance.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, user_id: userId }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();

        if (data?.balance || data?.wallet_balance) {
          let balanceValue = data.balance || data.wallet_balance;
          const cleanBalance = balanceValue.toString().replace(/[₦$,]/g, '').trim();
          const numericBalance = parseFloat(cleanBalance);

          if (!isNaN(numericBalance)) {
            // Always update to API value
            return updateDisplayBalance(numericBalance, userData);
          }
        }
      }
    } catch (error) {
      console.log("Quick sync failed:", error.message);
      // Return current user data if sync fails
      return userData;
    }

    return userData;
  };

  // Fast balance fetch - uses stored data first, then tries quick API sync
  const fetchWalletBalance = async (showAlert = false, forceSync = false) => {
    try {
      setRefreshing(true);

      let userData = await getUserData();
      if (!userData || !userData.email) {
        Alert.alert("Error", "Please login again");
        return;
      }

      /// Use stored balance from login (instant display)
      const storedBalance = userData.wallet_balance || userData.balance || 0;
      userData = updateDisplayBalance(storedBalance, userData);

      // Try quick API sync in background
      if (forceSync || Date.now() - lastSyncTime > 5000) { // Only sync every 5 seconds max
        setLastSyncTime(Date.now());

        setTimeout(async () => {
          try {
            const updatedUserData = await syncWithApi(userData);

            // If balance changed from sync, show notification
            const oldBalance = storedBalance;
            const newBalance = updatedUserData.wallet_balance || updatedUserData.balance || 0;

            if (showAlert && Math.abs(newBalance - oldBalance) > 0.01) {
              Alert.alert(
                "Balance Updated",
                `New balance: ₦${newBalance.toLocaleString('en-NG', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}`,
                [{ text: "OK" }]
              );
            }
          } catch (syncError) {
            // Silent fail for background sync
          }
        }, 100); // Small delay to let UI update first
      }
    } catch (error) {
      console.error("Error in fetchWalletBalance:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Crypto balances - simplified
  const fetchCryptoWalletBalances = async () => {
    try {
      setBtcLoading(true);

      const userData = await getUserData();
      if (!userData || !userData.id) {
        console.log("No user ID found for crypto balance");
        return;
      }

      const userId = userData.id || userData.user_id;

      try {
        const response = await fetch(`https://jekfarms.com.ng/jekfarm/api/bitnob_get_wallets.php?user_id=${encodeURIComponent(userId)}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();

          // Extract BTC and USD balances
          let btcBalance = 0;
          let usdBalance = 0;

          if (data.balances) {
            btcBalance = parseFloat(data.balances.btc) || 0;
            usdBalance = parseFloat(data.balances.usd) || 0;
          }

          setBtcAmount(btcBalance);
          setUsdAmount(usdBalance);

          setBtcBalance(`${btcBalance.toFixed(8)} BTC`);
          setUsdBalance(`$${usdBalance.toFixed(2)}`);
        }
      } catch (error) {
        console.log("Crypto fetch failed:", error.message);
      }

    } catch (error) {
      console.error("Error in fetchCryptoWalletBalances:", error);
    } finally {
      setBtcLoading(false);
    }
  };

  // Combined refresh function
  const refreshAllBalances = async (showAlert = false) => {
    // Force sync for manual refresh
    await fetchWalletBalance(showAlert, true);

    // Refresh crypto balances
    await fetchCryptoWalletBalances();
  };

  // Load on mount
  useEffect(() => {
    const init = async () => {
      await getUserData();
      await fetchWalletBalance();

      // Get cached crypto balances immediately
      await getCachedWalletBalances();

      // Try to fetch fresh crypto balances less frequently
      setTimeout(async () => {
        await fetchCryptoWalletBalances(false, false);
      }, 2000);
    };
    init();

    return () => {
      // No intervals to clear
    };
  }, []);

  // Auto-refresh balance logic removed
  useEffect(() => {
    // Polling removed at user request
  }, []);

  // Refresh when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      refreshAllBalances();
    }, [])
  );

  // Manual refresh
  const handleRefresh = () => {
    refreshAllBalances(true);
  };

  // Navigate to Add Money screen - with immediate update callback
  const goToAddMoney = () => {
    navigation.navigate("AddMoney", {
      onSuccess: async () => {
        // Immediately update balance after funding
        await fetchWalletBalance(true, true);
      }
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#41B63E" />
        <Text style={styles.loadingText}>Loading wallet balances...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* KYC Banner - Only show if incomplete */}
        {userData && (!userData.has_bvn && !userData.has_nin) && (
          <KYCBanner />
        )}

        {/* Header */}
        <View style={styles.header}>
          <Image
            source={useravatar}
            style={styles.avatar}
          />
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={handleRefresh} disabled={refreshing || btcLoading}>
              <View style={styles.notification}>
                <Image
                  source={notification}
                  style={styles.notificationIcon}
                />
                <View style={styles.redDot} />
                {(refreshing || btcLoading) && (
                  <View style={styles.refreshIndicator}>
                    <ActivityIndicator size="small" color="#41B63E" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              style={styles.profileButton}
            >
              <Image
                source={useravatar}
                style={styles.profileIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Wallet Balance */}
        <View style={styles.balanceBox}>
          <Text style={styles.balanceLabel}>Wallet Balance</Text>

          <View style={styles.balanceRow}>
            <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
              <Text style={styles.balanceAmount}>{balance}</Text>
            </TouchableOpacity>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={goToAddMoney}
              >
                <Image
                  source={recieveImg}
                  style={styles.actionIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate("SendMoneyScreen")}
              >
                <Image
                  source={sendImg}
                  style={styles.actionIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Image
                  source={converImg}
                  style={styles.actionIcon}
                />
              </TouchableOpacity>
            </View>
          </View>

        </View>

        {/* Crypto Balances Box - Simplified */}
        <View style={styles.cryptoBox}>
          {/* BTC Balance */}
          <View style={styles.cryptoRow}>
            <View style={styles.cryptoInfo}>
              <Text style={styles.cryptoLabel}>Bitcoin</Text>
              <Text style={styles.cryptoAmount}>
                {btcLoading ? 'Loading...' : btcBalance}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => Alert.alert("Coming Soon", "Crypto features coming soon!")}
              disabled={btcLoading}
            >
              <Image
                source={BTCconvertImg}
                style={[
                  styles.cryptoIcon,
                  btcLoading && styles.disabledIcon
                ]}
              />
            </TouchableOpacity>
          </View>

          {/* USD Balance */}
          <View style={[styles.cryptoRow, styles.usdRow]}>
            <View style={styles.cryptoInfo}>
              <Text style={styles.cryptoLabel}>USD</Text>
              <Text style={styles.cryptoAmount}>
                {btcLoading ? 'Loading...' : usdBalance}
              </Text>
            </View>
          </View>

          {/* Coming Soon Message */}
          <View style={styles.comingSoonContainer}>
            <Text style={styles.comingSoonText}>🚀 Crypto features coming soon!</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#41B63E',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#41B63E',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#41B63E',
    padding: 20,
    paddingBottom: 80,
    margin: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatar: {
    width: 43,
    height: 43,
    resizeMode: "contain",
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#41B63E',
  },
  profileIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  notification: {
    position: 'relative',
  },
  notificationIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  redDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    backgroundColor: 'red',
    borderRadius: 5,
  },
  refreshIndicator: {
    position: 'absolute',
    top: 25,
    right: -5,
  },
  balanceBox: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 20,
    marginTop: 30,
    position: 'relative',
    width: 320
  },
  balanceLabel: {
    color: '#817d7d',
    fontSize: 12,
    marginBottom: 5,
  },
  balanceAmount: {
    color: '#f7f4f4ff',
    fontSize: 30,
    fontWeight: 'bold',
    marginRight: 20
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#41B63E',
    borderRadius: 20,
    padding: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    width: 26,
    height: 26,
    resizeMode: "contain",
  },
  cryptoBox: {
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
    width: '100%',
    maxWidth: 320,
  },
  cryptoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  usdRow: {
    marginBottom: 0,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  cryptoInfo: {
    flex: 1,
  },
  cryptoLabel: {
    fontSize: 12,
    color: 'rgba(248, 250, 252, 0.7)',
    marginBottom: 2,
  },
  cryptoAmount: {
    fontSize: 16,
    color: '#f8fafcff',
    fontWeight: '500',
  },
  cryptoIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  disabledIcon: {
    opacity: 0.5,
  },
  comingSoonContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  comingSoonText: {
    color: 'rgba(248, 250, 252, 0.7)',
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default WalletBalanceScreen;
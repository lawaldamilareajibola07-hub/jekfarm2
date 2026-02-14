import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  Clipboard,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api";

export default function WalletScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [farmerId, setFarmerId] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

  // Account data
  const [walletData, setWalletData] = useState({
    balance: "₦0.00",
    income: "₦0",
    expense: "₦0",
    disburseBalance: "₦0.00",
  });

  const [userAccount, setUserAccount] = useState(null);
  const [disbursementWallet, setDisbursementWallet] = useState(null);
  const [monnifyTransactions, setMonnifyTransactions] = useState([]);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const userString = await AsyncStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);
        setFarmerId(user.id?.toString());
        setUserEmail(user.email || "");
        setUserName(user.name || "");

        if (user.id) fetchWalletData(user.id.toString());

        // Load stored accounts
        const storageKey = `user_dedicated_account_${user.email?.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const savedAccount = await AsyncStorage.getItem(storageKey);
        if (savedAccount) setUserAccount(JSON.parse(savedAccount));

        const savedDisburse = await AsyncStorage.getItem("disbursementWallet");
        if (savedDisburse) {
          const wallet = JSON.parse(savedDisburse);
          setDisbursementWallet(wallet);
          fetchMonnifyData(wallet.walletReference);
        }
      }
    } catch (error) {
      console.error("Load initial data error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWalletData = async (id) => {
    try {
      const response = await api.get(`/farmerinterface/wallet/balance.php?farmer_id=${id}`);
      if (response.data?.status === "success") {
        const d = response.data.data;
        setWalletData(prev => ({
          ...prev,
          balance: `₦${parseFloat(d.balance || 0).toLocaleString()}`,
          income: `₦${parseFloat(d.income || 0).toLocaleString()}`,
          expense: `₦${parseFloat(d.expense || 0).toLocaleString()}`,
        }));
      }
    } catch (e) {
      console.log("General wallet fetch failed", e);
    }
  };

  const fetchMonnifyData = async (reference) => {
    if (!reference) return;
    try {
      const balRes = await fetch(`https://jekfarms.com.ng/pay/monnify/get_disbursement_balance.php?reference=${reference}`);
      const balData = await balRes.json();
      if (balData.status === "success") {
        setWalletData(prev => ({
          ...prev,
          disburseBalance: `₦${parseFloat(balData.data.availableBalance).toLocaleString()}`
        }));
      }

      const txRes = await fetch(`https://jekfarms.com.ng/pay/monnify/get_wallet_transactions.php?reference=${reference}`);
      const txData = await txRes.json();
      if (txData.status === "success") {
        setMonnifyTransactions(txData.data.content || []);
      }
    } catch (e) {
      console.log("Monnify fetch failed", e);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (farmerId) fetchWalletData(farmerId);
    if (disbursementWallet) fetchMonnifyData(disbursementWallet.walletReference);
    setRefreshing(false);
  };

  const copyToClipboard = (text, field) => {
    Clipboard.setString(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    Alert.alert("Copied", `${field} copied to clipboard`);
  };

  const renderTx = (item) => (
    <View key={item.transactionReference} style={styles.txRow}>
      <View style={[styles.txIcon, { backgroundColor: item.transactionType === 'DEBIT' ? '#FEF2F2' : '#F0FDF4' }]}>
        <Ionicons
          name={item.transactionType === 'DEBIT' ? 'arrow-up' : 'arrow-down'}
          size={16}
          color={item.transactionType === 'DEBIT' ? '#EF4444' : '#10B981'}
        />
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txTitle}>{item.narration || 'Transaction'}</Text>
        <Text style={styles.txDate}>{new Date(item.createdOn).toLocaleDateString()}</Text>
      </View>
      <Text style={[styles.txAmount, { color: item.transactionType === 'DEBIT' ? '#EF4444' : '#10B981' }]}>
        {item.transactionType === 'DEBIT' ? '-' : '+'}{parseFloat(item.amount).toLocaleString()}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Financial Hub</Text>
        <TouchableOpacity onPress={() => setShowAccountDropdown(!showAccountDropdown)}>
          <Ionicons name="card-outline" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {showAccountDropdown && (
        <View style={styles.dropdown}>
          <Text style={styles.dropdownTitle}>Funding Accounts</Text>
          {userAccount && (
            <View style={styles.accountBox}>
              <Text style={styles.accountLabel}>DEDICATED ACCOUNT</Text>
              <Text style={styles.accountBank}>{userAccount.bankName}</Text>
              <TouchableOpacity onPress={() => copyToClipboard(userAccount.accountNumber, "Account Number")}>
                <Text style={styles.accountNum}>{userAccount.accountNumber} <Ionicons name="copy-outline" size={12} /></Text>
              </TouchableOpacity>
            </View>
          )}
          {disbursementWallet && (
            <View style={styles.accountBox}>
              <Text style={styles.accountLabel}>DISBURSEMENT WALLET</Text>
              <Text style={styles.accountBank}>{disbursementWallet.topUpAccountDetails?.bankName}</Text>
              <TouchableOpacity onPress={() => copyToClipboard(disbursementWallet.accountNumber, "Wallet Number")}>
                <Text style={styles.accountNum}>{disbursementWallet.accountNumber} <Ionicons name="copy-outline" size={12} /></Text>
              </TouchableOpacity>
            </View>
          )}
          {!userAccount && !disbursementWallet && (
            <TouchableOpacity style={styles.setupBtn} onPress={() => navigation.navigate("CreateVirtualAccount")}>
              <Text style={styles.setupText}>Setup Funding Account</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <LinearGradient colors={['#1F2937', '#111827']} style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Disbursement Balance</Text>
          <Text style={styles.balanceAmount}>{walletData.disburseBalance}</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("CreateVirtualAccount")}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.actionText}>Top Up</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("WithdrawFunds", { wallet: disbursementWallet, balance: walletData.disburseBalance })}>
              <Ionicons name="paper-plane" size={18} color="#fff" />
              <Text style={styles.actionText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Income</Text>
            <Text style={styles.statValue}>{walletData.income}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Expense</Text>
            <Text style={styles.statValue}>{walletData.expense}</Text>
          </View>
        </View>

        <View style={styles.txSection}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {monnifyTransactions.length > 0 ? (
            monnifyTransactions.map(renderTx)
          ) : (
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={40} color="#D1D5DB" />
              <Text style={styles.emptyText}>No transactions found</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  scrollContent: { padding: 20 },
  dropdown: { backgroundColor: "#fff", padding: 20, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  dropdownTitle: { fontSize: 13, fontWeight: "bold", color: "#6B7280", marginBottom: 15 },
  accountBox: { marginBottom: 15 },
  accountLabel: { fontSize: 10, color: "#9CA3AF", marginBottom: 4 },
  accountBank: { fontSize: 14, fontWeight: "600" },
  accountNum: { fontSize: 16, fontWeight: "bold", color: "#10B981" },
  setupBtn: { backgroundColor: "#10B981", padding: 12, borderRadius: 8, alignItems: "center" },
  setupText: { color: "#fff", fontWeight: "bold" },
  balanceCard: { borderRadius: 20, padding: 25, marginBottom: 20 },
  balanceLabel: { color: "#9CA3AF", fontSize: 12, marginBottom: 5 },
  balanceAmount: { color: "#fff", fontSize: 32, fontWeight: "bold", marginBottom: 20 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  actionBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.1)", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12 },
  actionText: { color: "#fff", marginLeft: 8, fontWeight: "600" },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 25 },
  statBox: { flex: 0.48, backgroundColor: "#fff", padding: 15, borderRadius: 15, borderWidth: 1, borderColor: "#F3F4F6" },
  statLabel: { fontSize: 11, color: "#9CA3AF", marginBottom: 5 },
  statValue: { fontSize: 16, fontWeight: "bold" },
  txSection: {},
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  txRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 15, borderRadius: 15, marginBottom: 10, borderWidth: 1, borderColor: "#F3F4F6" },
  txIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  txInfo: { flex: 1, marginLeft: 12 },
  txTitle: { fontSize: 14, fontWeight: "600" },
  txDate: { fontSize: 11, color: "#9CA3AF" },
  txAmount: { fontSize: 15, fontWeight: "bold" },
  empty: { alignItems: "center", padding: 40 },
  emptyText: { color: "#9CA3AF", marginTop: 10 },
});
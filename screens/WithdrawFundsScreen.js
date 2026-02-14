import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Modal,
    FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

const WithdrawFundsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { wallet, balance } = route.params || {};

    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [banks, setBanks] = useState([]);
    const [selectedBank, setSelectedBank] = useState(null);
    const [accountNumber, setAccountNumber] = useState("");
    const [accountName, setAccountName] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [showBankModal, setShowBankModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchBanks();
    }, []);

    const fetchBanks = async () => {
        try {
            const response = await fetch("https://jekfarms.com.ng/pay/monnify/get_banks.php");
            const result = await response.json();
            if (result.status === "success") {
                setBanks(result.data.responseBody || []);
            }
        } catch (e) {
            console.log("Failed to fetch banks", e);
        }
    };

    const filteredBanks = banks.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleWithdraw = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert("Error", "Please enter a valid amount.");
            return;
        }
        if (!selectedBank || !accountNumber) {
            Alert.alert("Error", "Please select a bank and enter account number.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                amount: parseFloat(amount),
                reference: `WTH_${Date.now()}`,
                narration: "Withdrawal from Jek Farms",
                destinationBankCode: selectedBank.code,
                destinationAccountNumber: accountNumber,
                sourceWalletNumber: wallet.walletReference,
            };

            const response = await fetch("https://jekfarms.com.ng/pay/monnify/initiate_transfer.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (result.status === "success") {
                Alert.alert("Success", "Withdrawal initiated successfully!");
                navigation.goBack();
            } else {
                Alert.alert("Transfer Failed", result.message || "Failed to initiate transfer.");
            }
        } catch (err) {
            Alert.alert("Error", "Network error during withdrawal.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Withdraw Funds</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.balanceInfo}>
                    <Text style={styles.balanceLabel}>Available for Withdrawal</Text>
                    <Text style={styles.balanceValue}>{balance || "₦0.00"}</Text>
                </View>

                <View style={styles.inputCard}>
                    <Text style={styles.label}>Amount to Withdraw</Text>
                    <View style={styles.amountInputRow}>
                        <Text style={styles.currencyPrefix}>₦</Text>
                        <TextInput
                            style={styles.amountInput}
                            keyboardType="number-pad"
                            placeholder="0.00"
                            value={amount}
                            onChangeText={setAmount}
                        />
                    </View>

                    <Text style={styles.label}>Select Bank</Text>
                    <TouchableOpacity
                        style={styles.pickerBtn}
                        onPress={() => setShowBankModal(true)}
                    >
                        <Text style={selectedBank ? styles.pickerText : styles.placeholderText}>
                            {selectedBank ? selectedBank.name : "Choose a bank"}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <Text style={styles.label}>Account Number</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="number-pad"
                        maxLength={10}
                        placeholder="Enter 10-digit number"
                        value={accountNumber}
                        onChangeText={setAccountNumber}
                    />

                    {accountName ? (
                        <Text style={styles.accountName}>{accountName}</Text>
                    ) : null}

                    <TouchableOpacity
                        style={[styles.withdrawBtn, loading && styles.disabledBtn]}
                        onPress={handleWithdraw}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.withdrawBtnText}>Continue</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal visible={showBankModal} animationType="slide">
                <SafeAreaView style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Bank</Text>
                        <TouchableOpacity onPress={() => setShowBankModal(false)}>
                            <Ionicons name="close" size={24} color="#1F2937" />
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={styles.searchBar}
                        placeholder="Search bank name..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <FlatList
                        data={filteredBanks}
                        keyExtractor={item => item.code}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.bankItem}
                                onPress={() => {
                                    setSelectedBank(item);
                                    setShowBankModal(false);
                                }}
                            >
                                <Text style={styles.bankItemText}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#F9FAFB" },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
    },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#1F2937" },
    content: { padding: 20 },
    balanceInfo: {
        backgroundColor: "#1F2937",
        padding: 24,
        borderRadius: 20,
        marginBottom: 20,
        alignItems: "center",
    },
    balanceLabel: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 5 },
    balanceValue: { color: "#fff", fontSize: 28, fontWeight: "bold" },
    inputCard: { backgroundColor: "#fff", padding: 24, borderRadius: 20, borderWidth: 1, borderColor: "#F3F4F6" },
    label: { fontSize: 12, fontWeight: "bold", color: "#6B7280", marginBottom: 10, marginTop: 15 },
    amountInputRow: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        paddingBottom: 8,
        marginBottom: 10,
    },
    currencyPrefix: { fontSize: 24, fontWeight: "bold", color: "#111827", marginRight: 8 },
    amountInput: { flex: 1, fontSize: 32, fontWeight: "bold", color: "#111827" },
    pickerBtn: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    pickerText: { fontSize: 15, color: "#111827" },
    placeholderText: { fontSize: 15, color: "#9CA3AF" },
    input: {
        backgroundColor: "#F9FAFB",
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        fontSize: 15,
    },
    accountName: { color: "#10B981", fontSize: 12, fontWeight: "bold", marginTop: 8 },
    withdrawBtn: {
        backgroundColor: "#10B981",
        height: 54,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 30,
    },
    disabledBtn: { opacity: 0.6 },
    withdrawBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    modalContent: { flex: 1, backgroundColor: "#fff" },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", padding: 20, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
    modalTitle: { fontSize: 18, fontWeight: "bold" },
    searchBar: { margin: 20, padding: 12, backgroundColor: "#F3F4F6", borderRadius: 10 },
    bankItem: { padding: 20, borderBottomWidth: 1, borderBottomColor: "#F9FAFB" },
    bankItemText: { fontSize: 16, color: "#1F2937" },
});

export default WithdrawFundsScreen;

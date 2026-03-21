import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Animated,
  StatusBar,
  RefreshControl,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../api/axios"; // note: two levels up from screens/admin

const { width } = Dimensions.get("window");
const TABS = ["All", "Pending", "Completed", "Failed"];

export default function AdminTransactions({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [metrics, setMetrics] = useState({
    All: 0,
    Pending: 0,
    Completed: 0,
    Failed: 0,
    TotalAmount: 0,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const tabSlideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 6, useNativeDriver: true }),
    ]).start();

    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setRefreshing(true);
      const res = await api.get("/admin/transactions");
      if (res.data.status === "success") {
        const data = res.data.transactions;
        setTransactions(data);
        setFilteredTransactions(data);

        const allCount = data.length;
        const pendingCount = data.filter((t) => t.status === "pending").length;
        const completedCount = data.filter((t) => t.status === "completed").length;
        const failedCount = data.filter((t) => t.status === "failed").length;
        const totalAmount = data.reduce((acc, t) => acc + (t.amount || 0), 0);

        setMetrics({
          All: allCount,
          Pending: pendingCount,
          Completed: completedCount,
          Failed: failedCount,
          TotalAmount: totalAmount,
        });
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    filterTransactions(activeTab, text);
  };

  const filterTransactions = (tab, searchText = search) => {
    let filtered = transactions;
    if (tab === "Pending") filtered = filtered.filter((t) => t.status === "pending");
    else if (tab === "Completed") filtered = filtered.filter((t) => t.status === "completed");
    else if (tab === "Failed") filtered = filtered.filter((t) => t.status === "failed");

    if (searchText)
      filtered = filtered.filter(
        (t) =>
          t.id.toString().includes(searchText) ||
          t.userName.toLowerCase().includes(searchText.toLowerCase())
      );

    setFilteredTransactions(filtered);
  };

  const handleTabChange = (tab, index) => {
    setActiveTab(tab);
    Animated.spring(tabSlideAnim, { toValue: (width / TABS.length) * index, useNativeDriver: true }).start();
    filterTransactions(tab);
  };

  const toggleSelectTransaction = (id) => {
    if (selectedTransactions.includes(id))
      setSelectedTransactions(selectedTransactions.filter((t) => t !== id));
    else setSelectedTransactions([...selectedTransactions, id]);
  };

  const handleBulkAction = () => {
    console.log("Bulk action for transactions:", selectedTransactions);
    setSelectedTransactions([]);
  };

  const TransactionCard = ({ transaction, index }) => {
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    useEffect(() => {
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 50, delay: index * 50, useNativeDriver: true }).start();
    }, []);

    const isSelected = selectedTransactions.includes(transaction.id);

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={() => toggleSelectTransaction(transaction.id)}
          style={[styles.transactionCard, isSelected && { borderColor: "#10b981", borderWidth: 2 }]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.transactionId}>Transaction #{transaction.id}</Text>
            <Text style={styles.userName}>{transaction.userName}</Text>
            <Text
              style={[
                styles.transactionStatus,
                transaction.status === "pending" && { color: "#f59e0b" },
                transaction.status === "completed" && { color: "#10b981" },
                transaction.status === "failed" && { color: "#ef4444" },
              ]}
            >
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)} | ₦{transaction.amount?.toLocaleString() || 0}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("TransactionDetailScreen", { transactionId: transaction.id })}
            style={styles.actionButton}
          >
            <Ionicons name="eye-outline" size={22} color="#3b82f6" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.header}>
            <Text style={styles.title}>Transactions Dashboard</Text>

            {/* Metrics */}
            <View style={styles.metricsRow}>
              {["All", "Pending", "Completed", "Failed", "TotalAmount"].map((key) => (
                <View key={key} style={styles.metricBox}>
                  <Text style={styles.metricLabel}>{key === "TotalAmount" ? "Amount" : key}</Text>
                  <Text style={styles.metricValue}>
                    {key === "TotalAmount" ? `₦${metrics[key].toLocaleString()}` : metrics[key]}
                  </Text>
                </View>
              ))}
            </View>

            {/* Search */}
            <TextInput
              style={styles.searchInput}
              placeholder="Search transactions..."
              value={search}
              onChangeText={handleSearch}
            />

            {/* Tabs */}
            <View style={styles.tabsContainer}>
              {TABS.map((tab, index) => (
                <TouchableOpacity key={tab} onPress={() => handleTabChange(tab, index)} style={styles.tabButton}>
                  <Text style={[styles.tabText, activeTab === tab && { color: "#10b981", fontWeight: "700" }]}>{tab}</Text>
                </TouchableOpacity>
              ))}
              <Animated.View style={[styles.tabSlider, { width: width / TABS.length, transform: [{ translateX: tabSlideAnim }] }]} />
            </View>

            {selectedTransactions.length > 0 && (
              <TouchableOpacity style={styles.bulkButton} onPress={handleBulkAction}>
                <Text style={styles.bulkButtonText}>Perform Action on {selectedTransactions.length} transaction(s)</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Transactions List */}
          <FlatList
            data={filteredTransactions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => <TransactionCard transaction={item} index={index} />}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchTransactions} />}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: { paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 10, color: "#111827" },
  metricsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  metricBox: { flex: 1, marginHorizontal: 5, backgroundColor: "#fff", padding: 10, borderRadius: 12, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  metricLabel: { fontSize: 14, color: "#6b7280", marginBottom: 4 },
  metricValue: { fontSize: 20, fontWeight: "700", color: "#111827" },
  searchInput: { backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 15, paddingVertical: 10, fontSize: 14, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2, marginBottom: 15 },
  tabsContainer: { flexDirection: "row", marginBottom: 15, position: "relative", borderRadius: 12, backgroundColor: "#e5e7eb", overflow: "hidden" },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: "center" },
  tabText: { fontSize: 14, color: "#6b7280" },
  tabSlider: { position: "absolute", bottom: 0, height: 3, backgroundColor: "#10b981" },
  bulkButton: { backgroundColor: "#10b981", paddingVertical: 12, borderRadius: 12, alignItems: "center", marginBottom: 10 },
  bulkButtonText: { color: "#fff", fontWeight: "700" },
  transactionCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", padding: 15, borderRadius: 16, marginVertical: 5, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  transactionId: { fontSize: 16, fontWeight: "700", color: "#111827" },
  userName: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  transactionStatus: { fontSize: 12, marginTop: 2 },
  actionButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#f3f4f6", justifyContent: "center", alignItems: "center" },
});
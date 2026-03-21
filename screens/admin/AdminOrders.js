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
const TABS = ["All", "Pending", "Completed", "Cancelled"];

export default function AdminOrders({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [metrics, setMetrics] = useState({
    All: 0,
    Pending: 0,
    Completed: 0,
    Cancelled: 0,
    Revenue: 0,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const tabSlideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 6, useNativeDriver: true }),
    ]).start();

    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      const res = await api.get("/admin/orders");
      if (res.data.status === "success") {
        const data = res.data.orders;
        setOrders(data);
        setFilteredOrders(data);

        const allCount = data.length;
        const pendingCount = data.filter((o) => o.status === "pending").length;
        const completedCount = data.filter((o) => o.status === "completed").length;
        const cancelledCount = data.filter((o) => o.status === "cancelled").length;
        const totalRevenue = data.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

        setMetrics({
          All: allCount,
          Pending: pendingCount,
          Completed: completedCount,
          Cancelled: cancelledCount,
          Revenue: totalRevenue,
        });
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    filterOrders(activeTab, text);
  };

  const filterOrders = (tab, searchText = search) => {
    let filtered = orders;
    if (tab === "Pending") filtered = filtered.filter((o) => o.status === "pending");
    else if (tab === "Completed") filtered = filtered.filter((o) => o.status === "completed");
    else if (tab === "Cancelled") filtered = filtered.filter((o) => o.status === "cancelled");

    if (searchText)
      filtered = filtered.filter(
        (o) =>
          o.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
          o.id.toString().includes(searchText)
      );

    setFilteredOrders(filtered);
  };

  const handleTabChange = (tab, index) => {
    setActiveTab(tab);
    Animated.spring(tabSlideAnim, { toValue: (width / TABS.length) * index, useNativeDriver: true }).start();
    filterOrders(tab);
  };

  const toggleSelectOrder = (id) => {
    if (selectedOrders.includes(id))
      setSelectedOrders(selectedOrders.filter((o) => o !== id));
    else setSelectedOrders([...selectedOrders, id]);
  };

  const handleBulkAction = () => {
    console.log("Bulk action for orders:", selectedOrders);
    setSelectedOrders([]);
  };

  const OrderCard = ({ order, index }) => {
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    useEffect(() => {
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 50, delay: index * 50, useNativeDriver: true }).start();
    }, []);

    const isSelected = selectedOrders.includes(order.id);

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={() => toggleSelectOrder(order.id)}
          style={[styles.orderCard, isSelected && { borderColor: "#10b981", borderWidth: 2 }]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.orderId}>Order #{order.id}</Text>
            <Text style={styles.customerName}>{order.customerName}</Text>
            <Text
              style={[
                styles.orderStatus,
                order.status === "pending" && { color: "#f59e0b" },
                order.status === "cancelled" && { color: "#ef4444" },
                order.status === "completed" && { color: "#10b981" },
              ]}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)} | ₦{order.totalAmount?.toLocaleString() || 0}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("OrderDetailScreen", { orderId: order.id })}
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
            <Text style={styles.title}>Orders Dashboard</Text>

            {/* Metrics */}
            <View style={styles.metricsRow}>
              {["All", "Pending", "Completed", "Cancelled", "Revenue"].map((key) => (
                <View key={key} style={styles.metricBox}>
                  <Text style={styles.metricLabel}>{key}</Text>
                  <Text style={styles.metricValue}>
                    {key === "Revenue" ? `₦${metrics[key].toLocaleString()}` : metrics[key]}
                  </Text>
                </View>
              ))}
            </View>

            {/* Search */}
            <TextInput
              style={styles.searchInput}
              placeholder="Search orders..."
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

            {selectedOrders.length > 0 && (
              <TouchableOpacity style={styles.bulkButton} onPress={handleBulkAction}>
                <Text style={styles.bulkButtonText}>Perform Action on {selectedOrders.length} order(s)</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Orders List */}
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => <OrderCard order={item} index={index} />}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchOrders} />}
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
  orderCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", padding: 15, borderRadius: 16, marginVertical: 5, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  orderId: { fontSize: 16, fontWeight: "700", color: "#111827" },
  customerName: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  orderStatus: { fontSize: 12, marginTop: 2 },
  actionButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#f3f4f6", justifyContent: "center", alignItems: "center" },
});
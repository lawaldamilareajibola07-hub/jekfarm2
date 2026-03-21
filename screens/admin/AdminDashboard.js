import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../api/axios";

const { width } = Dimensions.get("window");

export default function AdminDashboard({ navigation }) {
  const [user, setUser] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [pendingVendors, setPendingVendors] = useState([]);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    loadUser();
    fetchMetrics();
    fetchRecentOrders();
    fetchPendingVendors();
  }, []);

  const loadUser = async () => {
    const storedUser = await AsyncStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  };

  const fetchMetrics = async () => {
    try {
      const res = await api.get("/admin/metrics");
      if (res.data.status === "success") setMetrics(res.data.metrics);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const res = await api.get("/admin/recent-orders");
      if (res.data.status === "success") setRecentOrders(res.data.orders);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPendingVendors = async () => {
    try {
      const res = await api.get("/admin/pending-vendors");
      if (res.data.status === "success") setPendingVendors(res.data.vendors);
    } catch (err) {
      console.error(err);
    }
  };

  const MetricCard = ({ icon, title, value, color, index, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 50, useNativeDriver: true, delay: index * 100 }).start();
    }, []);

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }], width: width * 0.4, marginRight: 12 }}>
        <TouchableOpacity style={styles.metricCard} onPress={onPress}>
          <LinearGradient colors={color} style={styles.metricGradient}>
            <View style={styles.metricIcon}>{icon}</View>
            <Text style={styles.metricTitle}>{title}</Text>
            <Text style={styles.metricValue}>{value}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const ActionCard = ({ icon, label, onPress, index }) => {
    const anim = useRef(new Animated.Value(0.8)).current;
    useEffect(() => {
      Animated.spring(anim, { toValue: 1, friction: 6, tension: 50, useNativeDriver: true, delay: index * 100 }).start();
    }, []);
    return (
      <Animated.View style={{ transform: [{ scale: anim }], width: "30%", marginBottom: 15 }}>
        <TouchableOpacity style={styles.actionCard} onPress={onPress}>
          {icon}
          <Text style={styles.actionText}>{label}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <LinearGradient colors={["#065f46", "#10b981"]} style={styles.headerBackground}>
        <Animated.View style={[styles.headerContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerGreeting}>Hello, {user?.name || "Admin"} 👋</Text>
              <Text style={styles.headerSubText}>Welcome to your dashboard</Text>
            </View>
            <TouchableOpacity style={styles.headerIconButton} onPress={() => navigation.navigate("Profile")}>
              <Ionicons name="person-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingTop: 140 }}>
        {/* Metrics */}
        <Text style={styles.sectionTitle}>Metrics</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10 }}>
          {metrics.length > 0 ? (
            metrics.map((item, idx) => (
              <MetricCard
                key={idx}
                index={idx}
                icon={item.icon}
                title={item.title}
                value={item.value}
                color={item.color}
                onPress={item.onPress}
              />
            ))
          ) : (
            <Text style={{ marginLeft: 5, color: "#6b7280" }}>No metrics available</Text>
          )}
        </ScrollView>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <ActionCard icon={<Ionicons name="add-circle-outline" size={32} color="#10b981" />} label="Add Product" onPress={() => navigation.navigate("AddProduct")} index={0} />
          <ActionCard icon={<Ionicons name="alert-circle-outline" size={32} color="#ef4444" />} label="Resolve Disputes" onPress={() => navigation.navigate("AdminDisputes")} index={1} />
          <ActionCard icon={<Ionicons name="settings-outline" size={32} color="#2563eb" />} label="Settings" onPress={() => navigation.navigate("AdminSettings")} index={2} />
        </View>

        {/* Recent Orders */}
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        {recentOrders.length > 0 ? (
          recentOrders.map((order, idx) => (
            <View key={idx} style={styles.listItem}>
              <Text style={styles.listItemText}>{order.customerName} - {order.productName}</Text>
              <Text style={styles.listItemSubText}>₦{order.amount.toLocaleString()}</Text>
            </View>
          ))
        ) : (
          <Text style={{ color: "#6b7280" }}>No recent orders</Text>
        )}

        {/* Pending Vendors */}
        <Text style={styles.sectionTitle}>Pending Vendors</Text>
        {pendingVendors.length > 0 ? (
          pendingVendors.map((vendor, idx) => (
            <View key={idx} style={styles.listItem}>
              <Text style={styles.listItemText}>{vendor.name}</Text>
              <TouchableOpacity onPress={() => navigation.navigate("ApproveVendor", { vendorId: vendor.id })}>
                <Text style={styles.approveButton}>Approve</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={{ color: "#6b7280" }}>No pending vendors</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  headerBackground: { position: "absolute", top: 0, left: 0, right: 0, height: 180, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, zIndex: 10 },
  headerContent: { paddingHorizontal: 20, paddingTop: 40 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerGreeting: { fontSize: 22, fontWeight: "700", color: "#fff" },
  headerSubText: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  headerIconButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginVertical: 10, color: "#111827" },
  metricCard: { borderRadius: 16, overflow: "hidden" },
  metricGradient: { padding: 16, borderRadius: 16, justifyContent: "center", minHeight: 120 },
  metricIcon: { marginBottom: 8 },
  metricTitle: { fontSize: 14, color: "#fff", fontWeight: "600" },
  metricValue: { fontSize: 20, color: "#fff", fontWeight: "700", marginTop: 4 },
  actionsRow: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", marginVertical: 10 },
  actionCard: { backgroundColor: "#fff", borderRadius: 16, padding: 12, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  actionText: { fontSize: 12, fontWeight: "600", marginTop: 6, textAlign: "center" },
  listItem: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#fff", padding: 12, borderRadius: 12, marginVertical: 5, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  listItemText: { fontSize: 14, fontWeight: "600" },
  listItemSubText: { fontSize: 12, color: "#6b7280" },
  approveButton: { fontSize: 12, fontWeight: "700", color: "#10b981" },
});
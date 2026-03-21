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
const TABS = ["All", "Open", "Resolved", "Rejected"];

export default function AdminDisputes({ navigation }) {
  const [disputes, setDisputes] = useState([]);
  const [filteredDisputes, setFilteredDisputes] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDisputes, setSelectedDisputes] = useState([]);
  const [metrics, setMetrics] = useState({
    All: 0,
    Open: 0,
    Resolved: 0,
    Rejected: 0,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const tabSlideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 6, useNativeDriver: true }),
    ]).start();

    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      setRefreshing(true);
      const res = await api.get("/admin/disputes");
      if (res.data.status === "success") {
        const data = res.data.disputes;
        setDisputes(data);
        setFilteredDisputes(data);

        setMetrics({
          All: data.length,
          Open: data.filter((d) => d.status === "open").length,
          Resolved: data.filter((d) => d.status === "resolved").length,
          Rejected: data.filter((d) => d.status === "rejected").length,
        });
      }
    } catch (err) {
      console.error("Error fetching disputes:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    filterDisputes(activeTab, text);
  };

  const filterDisputes = (tab, searchText = search) => {
    let filtered = disputes;
    if (tab === "Open") filtered = filtered.filter((d) => d.status === "open");
    else if (tab === "Resolved") filtered = filtered.filter((d) => d.status === "resolved");
    else if (tab === "Rejected") filtered = filtered.filter((d) => d.status === "rejected");

    if (searchText)
      filtered = filtered.filter(
        (d) =>
          d.id.toString().includes(searchText) ||
          d.userName.toLowerCase().includes(searchText.toLowerCase()) ||
          d.orderId?.toString().includes(searchText)
      );

    setFilteredDisputes(filtered);
  };

  const handleTabChange = (tab, index) => {
    setActiveTab(tab);
    Animated.spring(tabSlideAnim, { toValue: (width / TABS.length) * index, useNativeDriver: true }).start();
    filterDisputes(tab);
  };

  const toggleSelectDispute = (id) => {
    if (selectedDisputes.includes(id))
      setSelectedDisputes(selectedDisputes.filter((d) => d !== id));
    else setSelectedDisputes([...selectedDisputes, id]);
  };

  const handleBulkAction = () => {
    console.log("Bulk action for disputes:", selectedDisputes);
    setSelectedDisputes([]);
  };

  const DisputeCard = ({ dispute, index }) => {
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    useEffect(() => {
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 50, delay: index * 50, useNativeDriver: true }).start();
    }, []);

    const isSelected = selectedDisputes.includes(dispute.id);

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={() => toggleSelectDispute(dispute.id)}
          style={[styles.disputeCard, isSelected && { borderColor: "#10b981", borderWidth: 2 }]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.disputeId}>Dispute #{dispute.id}</Text>
            <Text style={styles.userName}>{dispute.userName}</Text>
            <Text style={styles.orderId}>Order #{dispute.orderId}</Text>
            <Text
              style={[
                styles.disputeStatus,
                dispute.status === "open" && { color: "#f59e0b" },
                dispute.status === "resolved" && { color: "#10b981" },
                dispute.status === "rejected" && { color: "#ef4444" },
              ]}
            >
              {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("DisputeDetailScreen", { disputeId: dispute.id })}
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
            <Text style={styles.title}>Disputes Dashboard</Text>

            {/* Metrics */}
            <View style={styles.metricsRow}>
              {["All", "Open", "Resolved", "Rejected"].map((key) => (
                <View key={key} style={styles.metricBox}>
                  <Text style={styles.metricLabel}>{key}</Text>
                  <Text style={styles.metricValue}>{metrics[key]}</Text>
                </View>
              ))}
            </View>

            {/* Search */}
            <TextInput
              style={styles.searchInput}
              placeholder="Search disputes..."
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

            {selectedDisputes.length > 0 && (
              <TouchableOpacity style={styles.bulkButton} onPress={handleBulkAction}>
                <Text style={styles.bulkButtonText}>Perform Action on {selectedDisputes.length} dispute(s)</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Disputes List */}
          <FlatList
            data={filteredDisputes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => <DisputeCard dispute={item} index={index} />}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchDisputes} />}
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
  disputeCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", padding: 15, borderRadius: 16, marginVertical: 5, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  disputeId: { fontSize: 16, fontWeight: "700", color: "#111827" },
  userName: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  orderId: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  disputeStatus: { fontSize: 12, marginTop: 2 },
  actionButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#f3f4f6", justifyContent: "center", alignItems: "center" },
});
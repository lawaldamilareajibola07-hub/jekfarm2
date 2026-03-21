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
  Dimensions,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../api/axios"; // note: two levels up from screens/admin

import { PieChart, BarChart } from "react-native-chart-kit";

const { width } = Dimensions.get("window");
const TABS = ["All", "Active", "Inactive"];

export default function AdminFarmers({ navigation }) {
  const [farmers, setFarmers] = useState([]);
  const [filteredFarmers, setFilteredFarmers] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFarmers, setSelectedFarmers] = useState([]);
  const [metrics, setMetrics] = useState({ All: 0, Active: 0, Inactive: 0, Revenue: 0 });

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const tabSlideAnim = useRef(new Animated.Value(0)).current;

  const metricAnims = {
    All: useRef(new Animated.Value(0)).current,
    Active: useRef(new Animated.Value(0)).current,
    Inactive: useRef(new Animated.Value(0)).current,
    Revenue: useRef(new Animated.Value(0)).current,
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 6, useNativeDriver: true }),
    ]).start();
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      setRefreshing(true);
      const res = await api.get("/admin/farmers");
      if (res.data.status === "success") {
        const data = res.data.farmers;
        setFarmers(data);
        setFilteredFarmers(data);

        // Metrics
        const allCount = data.length;
        const activeCount = data.filter((f) => f.status === "active").length;
        const inactiveCount = data.filter((f) => f.status === "inactive").length;
        const totalRevenue = data.reduce((acc, f) => acc + (f.revenue || 0), 0);

        const newMetrics = { All: allCount, Active: activeCount, Inactive: inactiveCount, Revenue: totalRevenue };
        setMetrics(newMetrics);

        Object.keys(metricAnims).forEach((key) => {
          Animated.timing(metricAnims[key], { toValue: newMetrics[key], duration: 800, useNativeDriver: false }).start();
        });
      }
    } catch (err) {
      console.error("Error fetching farmers:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    filterFarmers(activeTab, text);
  };

  const filterFarmers = (tab, searchText = search) => {
    let filtered = farmers;
    if (tab === "Active") filtered = filtered.filter((f) => f.status === "active");
    else if (tab === "Inactive") filtered = filtered.filter((f) => f.status === "inactive");

    if (searchText)
      filtered = filtered.filter(
        (f) =>
          f.name.toLowerCase().includes(searchText.toLowerCase()) ||
          f.email.toLowerCase().includes(searchText.toLowerCase())
      );
    setFilteredFarmers(filtered);
  };

  const handleTabChange = (tab, index) => {
    setActiveTab(tab);
    Animated.spring(tabSlideAnim, { toValue: (width / TABS.length) * index, useNativeDriver: true }).start();
    filterFarmers(tab);
  };

  const toggleSelectFarmer = (id) => {
    if (selectedFarmers.includes(id)) setSelectedFarmers(selectedFarmers.filter((f) => f !== id));
    else setSelectedFarmers([...selectedFarmers, id]);
  };

  const handleBulkAction = () => {
    console.log("Bulk Action on farmers:", selectedFarmers);
    setSelectedFarmers([]);
  };

  const FarmerCard = ({ farmer, index }) => {
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    useEffect(() => {
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 50, delay: index * 50, useNativeDriver: true }).start();
    }, []);

    const isSelected = selectedFarmers.includes(farmer.id);

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={() => toggleSelectFarmer(farmer.id)}
          style={[styles.farmerCard, isSelected && { borderColor: "#10b981", borderWidth: 2 }]}
        >
          <View>
            <Text style={styles.farmerName}>{farmer.name}</Text>
            <Text style={styles.farmerEmail}>{farmer.email}</Text>
            <Text style={[styles.farmerStatus, farmer.status === "inactive" && { color: "#ef4444" }]}>
              {farmer.status === "active" ? "Active" : "Inactive"} | ₦{farmer.revenue?.toLocaleString() || 0}
            </Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("EditFarmer", { farmerId: farmer.id })}>
              <Ionicons name="pencil-outline" size={22} color="#10b981" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => console.log("Deactivate farmer", farmer.id)}>
              <Ionicons name="trash-outline" size={22} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Chart Data
  const revenuePieData = [
    {
      name: "Active",
      population: farmers.filter(f => f.status === "active").reduce((a,b) => a+(b.revenue||0),0),
      color: "#10b981",
      legendFontColor: "#111827",
      legendFontSize: 12
    },
    {
      name: "Inactive",
      population: farmers.filter(f => f.status === "inactive").reduce((a,b) => a+(b.revenue||0),0),
      color: "#ef4444",
      legendFontColor: "#111827",
      legendFontSize: 12
    }
  ];

  const statusBarData = [
    {
      data: [metrics.Active, metrics.Inactive, metrics.All],
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View style={styles.header}>
          <Text style={styles.title}>Farmers Dashboard</Text>

          {/* Metrics */}
          <View style={styles.metricsRow}>
            {["All", "Active", "Inactive", "Revenue"].map((key) => (
              <View key={key} style={styles.metricBox}>
                <Text style={styles.metricLabel}>{key}</Text>
                <Animated.Text style={styles.metricValue}>
                  {metricAnims[key].__getValue().toLocaleString()}
                </Animated.Text>
              </View>
            ))}
          </View>

          {/* Charts */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 15 }}>
            <View style={{ width: "48%" }}>
              <Text style={{ fontWeight: "700", marginBottom: 5 }}>Revenue Distribution</Text>
              <PieChart
                data={revenuePieData}
                width={width * 0.45}
                height={150}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                absolute
              />
            </View>
            <View style={{ width: "48%" }}>
              <Text style={{ fontWeight: "700", marginBottom: 5 }}>Farmer Status</Text>
              <BarChart
                data={{
                  labels: ["Active", "Inactive", "All"],
                  datasets: [{ data: [metrics.Active, metrics.Inactive, metrics.All] }],
                }}
                width={width * 0.45}
                height={150}
                fromZero
                showValuesOnTopOfBars
                chartConfig={{
                  backgroundGradientFrom: "#fff",
                  backgroundGradientTo: "#fff",
                  fillShadowGradient: "#10b981",
                  fillShadowGradientOpacity: 1,
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(17,24,39, ${opacity})`,
                }}
                style={{ borderRadius: 12 }}
              />
            </View>
          </View>

          {/* Search */}
          <TextInput
            style={styles.searchInput}
            placeholder="Search farmers..."
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

          {selectedFarmers.length > 0 && (
            <TouchableOpacity style={styles.bulkButton} onPress={handleBulkAction}>
              <Text style={styles.bulkButtonText}>Perform Action on {selectedFarmers.length} farmer(s)</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Farmers List */}
        <FlatList
          data={filteredFarmers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => <FarmerCard farmer={item} index={index} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchFarmers} />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        />
      </Animated.View>
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
  farmerCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", padding: 15, borderRadius: 16, marginVertical: 5, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  farmerName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  farmerEmail: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  farmerStatus: { fontSize: 12, color: "#10b981", marginTop: 2 },
  actions: { flexDirection: "row", gap: 10 },
  actionButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#f3f4f6", justifyContent: "center", alignItems: "center" },
});
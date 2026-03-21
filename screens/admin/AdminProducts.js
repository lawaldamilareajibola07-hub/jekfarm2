import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { BarChart, PieChart } from "react-native-chart-kit";
import api from "../../api/axios"; // note: two levels up from screens/admin

const { width } = Dimensions.get("window");
const TABS = ["All", "Active", "Inactive", "Pending"]; // Added Pending tab

export default function AdminProducts({ navigation }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [metrics, setMetrics] = useState({ All: 0, Active: 0, Inactive: 0, Pending: 0, Revenue: 0 });
  const [chartsData, setChartsData] = useState({ topProducts: [], revenuePerCategory: [] });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const tabSlideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 6, useNativeDriver: true }),
    ]).start();

    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setRefreshing(true);
      const res = await api.get("/admin/products");
      if (res.data.status === "success") {
        const data = res.data.products;
        setProducts(data);
        filterProducts(activeTab, search);

        const allCount = data.length;
        const activeCount = data.filter((p) => p.status === "active").length;
        const inactiveCount = data.filter((p) => p.status === "inactive").length;
        const pendingCount = data.filter((p) => p.status === "pending").length;
        const totalRevenue = data.reduce((acc, p) => acc + (p.salesRevenue || 0), 0);

        setMetrics({ All: allCount, Active: activeCount, Inactive: inactiveCount, Pending: pendingCount, Revenue: totalRevenue });

        // Charts
        const topProducts = data
          .sort((a, b) => (b.unitsSold || 0) - (a.unitsSold || 0))
          .slice(0, 5)
          .map((p) => ({ name: p.name, units: p.unitsSold || 0 }));

        const categoryMap = {};
        data.forEach((p) => {
          if (!p.category) return;
          categoryMap[p.category] = (categoryMap[p.category] || 0) + (p.salesRevenue || 0);
        });

        const revenuePerCategory = Object.keys(categoryMap).map((cat) => ({
          name: cat,
          revenue: categoryMap[cat],
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
          legendFontColor: "#111",
          legendFontSize: 12,
        }));

        setChartsData({ topProducts, revenuePerCategory });
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    filterProducts(activeTab, text);
  };

  const filterProducts = (tab, searchText = search) => {
    let filtered = products;
    if (tab === "Active") filtered = filtered.filter((p) => p.status === "active");
    else if (tab === "Inactive") filtered = filtered.filter((p) => p.status === "inactive");
    else if (tab === "Pending") filtered = filtered.filter((p) => p.status === "pending");

    if (searchText)
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchText.toLowerCase()) ||
          (p.category?.toLowerCase() || "").includes(searchText.toLowerCase())
      );

    setFilteredProducts(filtered);
  };

  const handleTabChange = (tab, index) => {
    setActiveTab(tab);
    Animated.spring(tabSlideAnim, { toValue: (width / TABS.length) * index, useNativeDriver: true }).start();
    filterProducts(tab);
  };

  const toggleSelectProduct = (id) => {
    if (selectedProducts.includes(id)) setSelectedProducts(selectedProducts.filter((p) => p !== id));
    else setSelectedProducts([...selectedProducts, id]);
  };

  const handleBulkApprove = async () => {
    try {
      await api.post("/admin/products/bulk-approve", { ids: selectedProducts });
      Alert.alert("Success", `${selectedProducts.length} product(s) approved.`);
      setSelectedProducts([]);
      fetchProducts();
    } catch (err) {
      console.error("Bulk approve error:", err);
      Alert.alert("Error", "Could not approve products.");
    }
  };

  const handleBulkReject = async () => {
    try {
      await api.post("/admin/products/bulk-reject", { ids: selectedProducts });
      Alert.alert("Success", `${selectedProducts.length} product(s) rejected.`);
      setSelectedProducts([]);
      fetchProducts();
    } catch (err) {
      console.error("Bulk reject error:", err);
      Alert.alert("Error", "Could not reject products.");
    }
  };

  const approveProduct = async (id) => {
    try {
      await api.post("/admin/products/approve", { id });
      fetchProducts();
    } catch (err) {
      console.error("Approve error:", err);
    }
  };

  const rejectProduct = async (id) => {
    try {
      await api.post("/admin/products/reject", { id });
      fetchProducts();
    } catch (err) {
      console.error("Reject error:", err);
    }
  };

  const ProductCard = ({ product, index }) => {
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    useEffect(() => {
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 50, delay: index * 50, useNativeDriver: true }).start();
    }, []);

    const isSelected = selectedProducts.includes(product.id);

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={() => toggleSelectProduct(product.id)}
          style={[styles.productCard, isSelected && { borderColor: "#10b981", borderWidth: 2 }]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productCategory}>{product.category}</Text>
            <Text
              style={[
                styles.productStatus,
                product.status === "inactive" && { color: "#ef4444" },
                product.status === "pending" && { color: "#f59e0b" },
              ]}
            >
              {product.status === "active"
                ? "Active"
                : product.status === "inactive"
                ? "Inactive"
                : "Pending Approval"}{" "}
              | ₦{product.salesRevenue?.toLocaleString() || 0}
            </Text>
          </View>

          <View style={styles.actions}>
            {product.status === "pending" && (
              <>
                <TouchableOpacity onPress={() => approveProduct(product.id)} style={styles.actionButton}>
                  <Ionicons name="checkmark-circle-outline" size={22} color="#10b981" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => rejectProduct(product.id)} style={styles.actionButton}>
                  <Ionicons name="close-circle-outline" size={22} color="#ef4444" />
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity onPress={() => navigation.navigate("EditProduct", { productId: product.id })} style={styles.actionButton}>
              <Ionicons name="pencil-outline" size={22} color="#10b981" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log("Deactivate product", product.id)} style={styles.actionButton}>
              <Ionicons name="trash-outline" size={22} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.header}>
            <Text style={styles.title}>Products Dashboard</Text>

            {/* Metrics */}
            <View style={styles.metricsRow}>
              {["All", "Active", "Inactive", "Pending", "Revenue"].map((key) => (
                <View key={key} style={styles.metricBox}>
                  <Text style={styles.metricLabel}>{key}</Text>
                  <Text style={styles.metricValue}>
                    {key === "Revenue" ? `₦${metrics[key]?.toLocaleString()}` : metrics[key]}
                  </Text>
                </View>
              ))}
            </View>

            {/* Search */}
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
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

            {selectedProducts.length > 0 && (
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                <TouchableOpacity style={styles.bulkButton} onPress={handleBulkApprove}>
                  <Text style={styles.bulkButtonText}>Approve {selectedProducts.length} product(s)</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.bulkButton, { backgroundColor: "#ef4444" }]} onPress={handleBulkReject}>
                  <Text style={styles.bulkButtonText}>Reject {selectedProducts.length} product(s)</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Charts */}
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <Text style={styles.chartTitle}>Top Selling Products</Text>
            <BarChart
              data={{
                labels: chartsData.topProducts.map((p) => p.name),
                datasets: [{ data: chartsData.topProducts.map((p) => p.units) }],
              }}
              width={width - 40}
              height={220}
              chartConfig={{
                backgroundColor: "#fff",
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
                style: { borderRadius: 16 },
              }}
              style={{ borderRadius: 16 }}
            />

            <Text style={[styles.chartTitle, { marginTop: 20 }]}>Revenue by Category</Text>
            <PieChart
              data={chartsData.revenuePerCategory}
              width={width - 40}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              }}
              accessor="revenue"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>

          {/* Products List */}
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => <ProductCard product={item} index={index} />}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchProducts} />}
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
  metricBox: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  metricLabel: { fontSize: 14, color: "#6b7280", marginBottom: 4 },
  metricValue: { fontSize: 20, fontWeight: "700", color: "#111827" },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 15,
  },
  tabsContainer: { flexDirection: "row", marginBottom: 15, position: "relative", borderRadius: 12, backgroundColor: "#e5e7eb", overflow: "hidden" },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: "center" },
  tabText: { fontSize: 14, color: "#6b7280" },
  tabSlider: { position: "absolute", bottom: 0, height: 3, backgroundColor: "#10b981" },
  bulkButton: { backgroundColor: "#10b981", paddingVertical: 12, borderRadius: 12, alignItems: "center", flex: 1, marginHorizontal: 5 },
  bulkButtonText: { color: "#fff", fontWeight: "700" },
  productCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", padding: 15, borderRadius: 16, marginVertical: 5, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  productName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  productCategory: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  productStatus: { fontSize: 12, color: "#10b981", marginTop: 2 },
  actions: { flexDirection: "row", gap: 10 },
  actionButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#f3f4f6", justifyContent: "center", alignItems: "center" },
  chartTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10, color: "#111827" },
});
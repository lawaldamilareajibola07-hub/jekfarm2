import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  RefreshControl,
  Animated,
  StyleSheet,
  Dimensions,
  TextInput,
} from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";
import api from "../../api/axios"; // note: two levels up from screens/admin

const { width } = Dimensions.get("window");

export default function AdminAnalytics() {
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    revenue: 0,
    disputes: 0,
    newUsers: 0,
  });
  const [salesOverTime, setSalesOverTime] = useState([]);
  const [revenueByCategory, setRevenueByCategory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 6, tension: 50, useNativeDriver: true }),
    ]).start();

    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      const res = await api.get("/admin/analytics");
      if (res.data.status === "success") {
        const data = res.data;
        setMetrics({
          totalOrders: data.totalOrders,
          revenue: data.totalRevenue,
          disputes: data.totalDisputes,
          newUsers: data.newUsers,
        });

        // Format charts data
        setSalesOverTime(
          data.salesOverTime.map((item) => ({
            month: item.month,
            orders: item.orders,
          }))
        );

        setRevenueByCategory(
          data.revenueByCategory.map((item) => ({
            name: item.category,
            revenue: item.revenue,
            color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            legendFontColor: "#111",
            legendFontSize: 12,
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAnalytics} />}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.header}>
            <Text style={styles.title}>Admin Analytics Dashboard</Text>

            {/* Metrics */}
            <View style={styles.metricsRow}>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Total Orders</Text>
                <Text style={styles.metricValue}>{metrics.totalOrders}</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Revenue</Text>
                <Text style={styles.metricValue}>₦{metrics.revenue.toLocaleString()}</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Disputes</Text>
                <Text style={styles.metricValue}>{metrics.disputes}</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>New Users</Text>
                <Text style={styles.metricValue}>{metrics.newUsers}</Text>
              </View>
            </View>

            {/* Optional Filter */}
            <TextInput
              style={styles.searchInput}
              placeholder="Filter by month/category..."
              value={filter}
              onChangeText={setFilter}
            />
          </View>

          {/* Charts */}
          <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
            <Text style={styles.chartTitle}>Sales Over Time</Text>
            {salesOverTime.length > 0 && (
              <LineChart
                data={{
                  labels: salesOverTime.map((d) => d.month),
                  datasets: [{ data: salesOverTime.map((d) => d.orders) }],
                }}
                width={width - 40}
                height={220}
                yAxisSuffix=""
                chartConfig={{
                  backgroundColor: "#fff",
                  backgroundGradientFrom: "#fff",
                  backgroundGradientTo: "#fff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
                  style: { borderRadius: 16 },
                  propsForDots: { r: "4", strokeWidth: "2", stroke: "#10b981" },
                }}
                style={{ borderRadius: 16 }}
              />
            )}

            <Text style={[styles.chartTitle, { marginTop: 20 }]}>Revenue by Category</Text>
            {revenueByCategory.length > 0 && (
              <PieChart
                data={revenueByCategory}
                width={width - 40}
                height={220}
                chartConfig={{ color: (opacity = 1) => `rgba(0,0,0,${opacity})` }}
                accessor="revenue"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: { paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 10, color: "#111827" },
  metricsRow: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", marginBottom: 15 },
  metricBox: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  metricLabel: { fontSize: 14, color: "#6b7280", marginBottom: 4 },
  metricValue: { fontSize: 18, fontWeight: "700", color: "#111827" },
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
  chartTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10, color: "#111827" },
});
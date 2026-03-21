import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  RefreshControl,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import api from "../../api/axios"; // note: two levels up from screens/admin

const { width } = Dimensions.get("window");
const ROLE_TABS = ["All", "Admin", "Vendor", "Farmer"];

export default function AdminUsers({ navigation }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [metrics, setMetrics] = useState({ All: 0, Admin: 0, Vendor: 0, Farmer: 0 });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const tabSlideAnim = useRef(new Animated.Value(0)).current;

  // Count animations
  const metricAnims = {
    All: useRef(new Animated.Value(0)).current,
    Admin: useRef(new Animated.Value(0)).current,
    Vendor: useRef(new Animated.Value(0)).current,
    Farmer: useRef(new Animated.Value(0)).current,
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 6, tension: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (nextPage = 1) => {
    if (!hasMore && nextPage !== 1) return;
    try {
      if (nextPage === 1) setLoading(true);

      const res = await api.get(`/admin/users?page=${nextPage}&limit=20`);
      if (res.data.status === "success") {
        const newUsers = res.data.users;
        if (nextPage === 1) {
          setUsers(newUsers);
          setFilteredUsers(newUsers);
        } else {
          setUsers((prev) => [...prev, ...newUsers]);
          setFilteredUsers((prev) => [...prev, ...newUsers]);
        }
        setHasMore(newUsers.length === 20);
        setPage(nextPage);

        // Update metrics
        const metricCounts = { All: newUsers.length, Admin: 0, Vendor: 0, Farmer: 0 };
        newUsers.forEach((u) => {
          if (u.role in metricCounts) metricCounts[u.role]++;
        });
        setMetrics(metricCounts);

        // Animate metrics
        Object.keys(metricAnims).forEach((key) => {
          Animated.timing(metricAnims[key], {
            toValue: metricCounts[key],
            duration: 800,
            useNativeDriver: false,
          }).start();
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    filterUsers(activeTab, text);
  };

  const filterUsers = (role, searchText = search) => {
    let filtered = users;
    if (role !== "All") filtered = filtered.filter((u) => u.role.toLowerCase() === role.toLowerCase());
    if (searchText) filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(searchText.toLowerCase()) ||
        u.email.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleTabChange = (tab, index) => {
    setActiveTab(tab);
    Animated.spring(tabSlideAnim, {
      toValue: (width / ROLE_TABS.length) * index,
      useNativeDriver: true,
    }).start();
    filterUsers(tab);
  };

  const toggleSelectUser = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter((u) => u !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const handleBulkDeactivate = () => {
    console.log("Bulk Deactivate Users:", selectedUsers);
    setSelectedUsers([]);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers(1);
  };

  const loadMore = () => {
    if (!loading && hasMore) fetchUsers(page + 1);
  };

  const UserCard = ({ user, index }) => {
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
        delay: index * 50,
      }).start();
    }, []);

    const isSelected = selectedUsers.includes(user.id);

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={() => toggleSelectUser(user.id)}
          style={[styles.userCard, isSelected && { borderColor: "#10b981", borderWidth: 2 }]}
        >
          <View>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={[styles.userRole, user.status === "inactive" && { color: "#ef4444" }]}>
              {user.role} | {user.status === "active" ? "Active" : "Inactive"}
            </Text>
          </View>
          <View style={styles.userActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("EditUser", { userId: user.id })}
            >
              <Ionicons name="pencil-outline" size={22} color="#10b981" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => console.log("Deactivate user", user.id)}
            >
              <Ionicons name="trash-outline" size={22} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderMetricCard = (label, color) => (
    <View style={[styles.metricCard, { backgroundColor: color }]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Animated.Text style={styles.metricValue}>
        {metricAnims[label].interpolate({
          inputRange: [0, metrics[label]],
          outputRange: [0, metrics[label]],
          extrapolate: "clamp",
        }).__getValue().toLocaleString()}
      </Animated.Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View style={styles.header}>
          <Text style={styles.title}>Users</Text>

          {/* Metrics Cards */}
          <View style={styles.metricsRow}>
            {Object.keys(metrics).map((key) => (
              <View key={key} style={{ flex: 1, marginHorizontal: 5 }}>
                <Animated.Text style={styles.metricLabel}>{key}</Animated.Text>
                <Animated.Text style={styles.metricValue}>
                  {metricAnims[key].__getValue().toLocaleString()}
                </Animated.Text>
              </View>
            ))}
          </View>

          {/* Search */}
          <TextInput
            style={styles.searchInput}
            placeholder="Search users by name or email"
            value={search}
            onChangeText={handleSearch}
          />

          {/* Role Tabs */}
          <View style={styles.tabsContainer}>
            {ROLE_TABS.map((tab, index) => (
              <TouchableOpacity key={tab} onPress={() => handleTabChange(tab, index)} style={styles.tabButton}>
                <Text style={[styles.tabText, activeTab === tab && { color: "#10b981", fontWeight: "700" }]}>{tab}</Text>
              </TouchableOpacity>
            ))}
            <Animated.View
              style={[
                styles.tabSlider,
                { width: width / ROLE_TABS.length, transform: [{ translateX: tabSlideAnim }] },
              ]}
            />
          </View>

          {selectedUsers.length > 0 && (
            <TouchableOpacity
              style={styles.bulkButton}
              onPress={handleBulkDeactivate}
            >
              <Text style={styles.bulkButtonText}>
                Deactivate {selectedUsers.length} user(s)
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Users List */}
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => <UserCard user={item} index={index} />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
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
  metricCard: { borderRadius: 12, padding: 10, alignItems: "center" },
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
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 15,
    position: "relative",
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
    overflow: "hidden",
  },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: "center" },
  tabText: { fontSize: 14, color: "#6b7280" },
  tabSlider: {
    position: "absolute",
    bottom: 0,
    height: 3,
    backgroundColor: "#10b981",
  },
  bulkButton: {
    backgroundColor: "#10b981",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  bulkButtonText: { color: "#fff", fontWeight: "700" },
  userCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 16,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  userName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  userEmail: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  userRole: { fontSize: 12, color: "#10b981", marginTop: 2 },
  userActions: { flexDirection: "row", gap: 10 },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
});
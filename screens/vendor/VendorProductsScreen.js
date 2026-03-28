import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

const BASE_URL = "https://productionbackend2.agreonpay.com.ng/api";

const STATUS_COLORS = {
  active: { bg: "#ECFDF5", text: "#059669" },
  inactive: { bg: "#F3F4F6", text: "#6B7280" },
  out_of_stock: { bg: "#FEF2F2", text: "#DC2626" },
};

export default function VendorProductsScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchProducts = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const res = await axios.get(`${BASE_URL}/commerce/vendor/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data?.data?.products || res.data?.data || []);
    } catch (err) {
      console.log("Fetch products error:", err?.response?.data || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const handleToggleStatus = async (product) => {
    const newStatus = product.status === "active" ? "inactive" : "active";
    Alert.alert(
      "Change Status",
      `Set "${product.name}" to ${newStatus}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync("token");
              await axios.patch(
                `${BASE_URL}/commerce/vendor/products/${product.id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              setProducts((prev) =>
                prev.map((p) =>
                  p.id === product.id ? { ...p, status: newStatus } : p
                )
              );
            } catch (err) {
              Alert.alert("Error", "Could not update product status.");
            }
          },
        },
      ]
    );
  };

  const handleDelete = (product) => {
    Alert.alert(
      "Delete Product",
      `Are you sure you want to delete "${product.name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync("token");
              await axios.delete(
                `${BASE_URL}/commerce/vendor/products/${product.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              setProducts((prev) => prev.filter((p) => p.id !== product.id));
            } catch (err) {
              Alert.alert("Error", "Could not delete product.");
            }
          },
        },
      ]
    );
  };

  const FILTERS = ["all", "active", "inactive", "out_of_stock"];

  const filtered = products.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  const renderProduct = ({ item }) => {
    const statusStyle =
      STATUS_COLORS[item.status] || STATUS_COLORS.inactive;

    return (
      <View style={styles.productCard}>
        <Image
          source={{
            uri:
              item.images?.[0] ||
              item.image ||
              "https://via.placeholder.com/80x80?text=No+Image",
          }}
          style={styles.productImage}
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.productPrice}>
            ₦{Number(item.price || 0).toLocaleString()}
          </Text>
          <Text style={styles.productStock}>
            Stock: {item.stock ?? item.quantity ?? "—"}
          </Text>
          <View
            style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}
          >
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.status || "inactive"}
            </Text>
          </View>
        </View>
        <View style={styles.productActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() =>
              navigation.navigate("AddProduct", { product: item, isEdit: true })
            }
          >
            <Ionicons name="create-outline" size={20} color="#2563EB" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => handleToggleStatus(item)}
          >
            <Ionicons
              name={
                item.status === "active"
                  ? "eye-off-outline"
                  : "eye-outline"
              }
              size={20}
              color="#D97706"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={20} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Products</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate("AddProduct")}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterChip,
              filter === f && styles.filterChipActive,
            ]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === f && styles.filterChipTextActive,
              ]}
            >
              {f === "out_of_stock" ? "Out of Stock" : f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2D6A4F" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, i) => item.id || String(i)}
          renderItem={renderProduct}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchProducts();
          }}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="cube-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No products found</Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => navigation.navigate("AddProduct")}
              >
                <Text style={styles.emptyBtnText}>Add your first product</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  title: { fontSize: 20, fontWeight: "700", color: "#111827" },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2D6A4F",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  addBtnText: { color: "#FFFFFF", fontWeight: "600", fontSize: 14 },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#111827" },

  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  filterChipActive: { backgroundColor: "#2D6A4F" },
  filterChipText: { fontSize: 12, color: "#6B7280", fontWeight: "500" },
  filterChipTextActive: { color: "#FFFFFF" },

  productCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  productImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  productInfo: { flex: 1, paddingHorizontal: 12, gap: 3 },
  productName: { fontSize: 14, fontWeight: "600", color: "#111827" },
  productPrice: { fontSize: 14, fontWeight: "700", color: "#2D6A4F" },
  productStock: { fontSize: 12, color: "#9CA3AF" },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    marginTop: 2,
  },
  statusText: { fontSize: 11, fontWeight: "600" },
  productActions: { gap: 8 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  emptyWrap: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: "#9CA3AF" },
  emptyBtn: {
    backgroundColor: "#2D6A4F",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  emptyBtnText: { color: "#FFFFFF", fontWeight: "600" },
});
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CategoriesScreen = ({ route, navigation }) => {
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState(route.params?.searchQuery || "");
  const { addToCart } = route.params || {};

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("https://jekfarms.com.ng/data/categories.php");
      const data = await response.json();

      if (data.status === "success" && (data.categories || data.data)) {
        const cats = data.categories || data.data;
        // Add a default image if missing
        const processedCats = cats.map(cat => ({
          ...cat,
          id: cat.id?.toString() || Math.random().toString(),
          count: cat.count || 0,
          image: cat.image_url || getFallbackIcon(cat.name)
        }));
        setAllCategories(processedCats);
        applySearch(processedCats, search);
      } else {
        throw new Error(data.message || "Failed to fetch categories");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Unable to load categories. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getFallbackIcon = (name) => {
    switch (name.toLowerCase()) {
      case "vegetables": return "https://img.icons8.com/3d-fluency/94/broccoli.png";
      case "fruits": return "https://img.icons8.com/3d-fluency/94/banana.png";
      case "chicken": return "https://img.icons8.com/3d-fluency/94/chicken.png";
      case "beef": return "https://img.icons8.com/3d-fluency/94/steak.png";
      case "protein": return "https://img.icons8.com/3d-fluency/94/eggs.png";
      case "seafood": return "https://img.icons8.com/3d-fluency/94/lobster.png";
      default: return "https://img.icons8.com/3d-fluency/94/box.png";
    }
  };

  const applySearch = (data, query) => {
    if (query) {
      const matched = data.filter(cat =>
        cat.name.toLowerCase().includes(query.toLowerCase())
      );
      const unmatched = data.filter(
        cat => !cat.name.toLowerCase().includes(query.toLowerCase())
      );
      setCategories([...matched, ...unmatched]);
    } else {
      setCategories(data);
    }
  };

  useEffect(() => {
    if (allCategories.length > 0) {
      applySearch(allCategories, search);
    }
  }, [search, allCategories]);

  const handleAddToCart = (item) => {
    if (addToCart) {
      addToCart(item);
      Alert.alert("Added to cart", `${item.name} has been added.`);
    } else {
      Alert.alert("Error", "Add to cart function not available.");
    }
  };

  const getCategoryColor = (name) => {
    switch (name.toLowerCase()) {
      case "vegetables": return "#d1fae5";
      case "fruits": return "#fef3c7";
      case "chicken": return "#fce7f3";
      case "beef": return "#fee2e2";
      case "protein": return "#ffedd5";
      case "seafood": return "#e0f2fe";
      default: return "#f3f4f6";
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.container}>
        {/* Back + Search */}
        <View style={styles.searchRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>

          <View style={styles.searchBox}>
            <TextInput
              style={styles.input}
              placeholder="Search category"
              value={search}
              onChangeText={setSearch}
            />
            <Ionicons name="search-outline" size={20} color="#888" />
          </View>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>Loading categories...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchCategories}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.title}>All categories</Text>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: "space-between" }}
              renderItem={({ item }) => (
                <View style={styles.cardContainer}>
                  <View style={styles.cardContent}>
                    <View style={styles.textContainer}>
                      <Text style={styles.name}>{item.name}</Text>
                      <Text style={styles.count}>{item.count} products</Text>
                    </View>

                    <View style={[styles.imageCircle, { backgroundColor: getCategoryColor(item.name) }]}>
                      <Image source={{ uri: item.image }} style={styles.productIcon} />
                    </View>
                  </View>
                </View>
              )}
              ListEmptyComponent={() => (
                <View style={styles.centerContainer}>
                  <Text style={styles.emptyText}>No categories found</Text>
                </View>
              )}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16, paddingTop: 56 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingBottom: 100 },
  loadingText: { marginTop: 10, color: "#666" },
  errorText: { marginTop: 10, color: "#ef4444", textAlign: "center", marginBottom: 20 },
  retryButton: { backgroundColor: "#10b981", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: "#fff", fontWeight: "600" },
  emptyText: { color: "#888", fontSize: 16 },
  searchRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  backButton: { padding: 6, marginRight: 8 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#e8e9ea",
    backgroundColor: "#fff",
  },
  input: { marginRight: 8, flex: 1, fontSize: 14, padding: 5 },
  title: { fontSize: 16, fontWeight: "600", marginBottom: 12, color: "#333" },
  cardContainer: {
    width: "48%",
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    height: 90,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4
  },
  count: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "500"
  },
  imageCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    // Creates that circle background effect
    marginRight: -20,
  },
  productIcon: {
    width: 48,
    height: 48,
    resizeMode: "contain"
  },
});

export default CategoriesScreen;

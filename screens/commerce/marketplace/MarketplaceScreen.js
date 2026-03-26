import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from "react-native";

import Animated, { FadeIn, FadeInUp, Layout } from "react-native-reanimated";

import ProductCard from "../../../components/commerce/ProductCard";

// ✅ Use the public marketplace API for customers
import { getMarketplaceProducts } from "../../../api/commerce/marketplace";

export default function MarketplaceScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  // layout state
  const [isGrid, setIsGrid] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await getMarketplaceProducts({ search });

console.log("FIRST PRODUCT IMAGES:", JSON.stringify(res?.data?.[0]?.images, null, 2));
console.log("Marketplace API Response:", res);
     
      // ✅ FIX: correctly access API structure
      const fixedProducts = (res?.data || []).map((item) => ({
        ...item,
        stock_quantity: parseFloat(item.stock_quantity ?? 0),
        images: Array.isArray(item.images) ? item.images : [],
      }));

      setProducts(fixedProducts);
    } catch (error) {
      console.log("Marketplace Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, []);

  const renderItem = ({ item, index }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 70)}
      layout={Layout.springify()}
      style={[styles.cardWrapper, !isGrid && styles.listWrapper]}
    >
      <ProductCard
        product={item}
        layout={isGrid ? "grid" : "list"}
        onPress={() =>
          navigation.navigate("ProductDetails", { product: item })
        }
      />
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Marketplace</Text>

        <View style={styles.layoutSwitch}>
          <TouchableOpacity
            style={[styles.switchBtn, isGrid && styles.activeBtn]}
            onPress={() => setIsGrid(true)}
          >
            <Text style={[styles.switchText, isGrid && styles.activeText]}>
              Grid
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.switchBtn, !isGrid && styles.activeBtn]}
            onPress={() => setIsGrid(false)}
          >
            <Text style={[styles.switchText, !isGrid && styles.activeText]}>
              List
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <TextInput
        placeholder="Search products..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {/* Products */}
      <FlatList
        key={isGrid ? "GRID" : "LIST"}
        data={products}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          item?.id?.toString() || index.toString()
        }
        numColumns={isGrid ? 2 : 1}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  layoutSwitch: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 3,
  },
  switchBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  activeBtn: {
    backgroundColor: "#000",
  },
  switchText: {
    fontSize: 12,
    color: "#555",
  },
  activeText: {
    color: "#fff",
    fontWeight: "600",
  },
  search: {
    height: 45,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  list: {
    paddingBottom: 30,
  },
  cardWrapper: {
    flex: 1,
    margin: 6,
  },
  listWrapper: {
    flex: 1,
    marginVertical: 6,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
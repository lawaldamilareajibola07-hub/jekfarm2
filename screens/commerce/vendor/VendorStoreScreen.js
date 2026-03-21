import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { getVendorProducts } from "../../../api/commerce/vendor";
import ProductCard from "../../../components/commerce/ProductCard";

export default function VendorStoreScreen({ route, navigation }) {
  const { vendorId, vendorName } = route.params;
  const [products, setProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await getVendorProducts(vendorId);
      setProducts(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const renderItem = ({ item, index }) => (
    <Animated.View entering={FadeInUp.delay(index * 50)}>
      <ProductCard product={item} onPress={() => navigation.navigate("ProductDetailScreen", { productId: item.id })} />
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.vendorHeader}>
        <Text style={styles.vendorName}>{vendorName}</Text>
        <Text style={styles.vendorInfo}>{products.length} products available</Text>
      </View>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={{ padding: 8 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  vendorHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  vendorName: { fontSize: 20, fontWeight: "700" },
  vendorInfo: { fontSize: 14, color: "#555", marginTop: 4 },
});
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import Animated, { FadeInUp } from "react-native-reanimated";

import { searchProducts } from "../../../api/commerce/products";

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (text) => {
    setQuery(text);
    if (!text) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await searchProducts({ search: text });
      setResults(res.data.data);
    } catch (error) {
      console.log("Search error", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }) => (
    <Animated.View entering={FadeInUp.delay(index * 50)} style={styles.itemCard}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("ProductDetail", { productId: item.id })
        }
      >
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>₦{parseFloat(item.price).toLocaleString()}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search products..."
        value={query}
        onChangeText={handleSearch}
      />

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },

  itemCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },

  itemName: { fontWeight: "700", fontSize: 16 },

  itemPrice: { marginTop: 4, color: "#1a8917", fontWeight: "600" },
});
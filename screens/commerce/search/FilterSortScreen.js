import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
} from "react-native";

import Animated, { FadeInUp } from "react-native-reanimated";

import { getCategories, getVendors } from "../../../api/commerce/products";

export default function FilterSortScreen({ route, navigation }) {
  const { applyFilters } = route.params;

  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [sortOption, setSortOption] = useState("newest");

  useEffect(() => {
    fetchCategories();
    fetchVendors();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await getVendors();
      setVendors(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleApply = () => {
    applyFilters({
      category: selectedCategory,
      vendor: selectedVendor,
      sort: sortOption,
    });
    navigation.goBack();
  };

  const handleReset = () => {
    setSelectedCategory(null);
    setSelectedVendor(null);
    setSortOption("newest");
  };

  const renderOption = (item, selected, setter) => (
    <TouchableOpacity
      key={item.id || item.name}
      onPress={() => setter(item.id || item.name)}
      style={[
        styles.optionBtn,
        selected === (item.id || item.name) && styles.optionBtnActive,
      ]}
    >
      <Text
        style={[
          styles.optionText,
          selected === (item.id || item.name) && styles.optionTextActive,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Animated.View entering={FadeInUp.duration(400)}>
        <Text style={styles.sectionTitle}>Category</Text>
        <View style={styles.optionsRow}>
          {categories.map((cat) =>
            renderOption(cat, selectedCategory, setSelectedCategory)
          )}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(400).delay(100)}>
        <Text style={styles.sectionTitle}>Vendor</Text>
        <View style={styles.optionsRow}>
          {vendors.map((vendor) =>
            renderOption(vendor, selectedVendor, setSelectedVendor)
          )}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(400).delay(200)}>
        <Text style={styles.sectionTitle}>Sort By</Text>
        <View style={styles.optionsRow}>
          {[
            { name: "Newest", value: "newest" },
            { name: "Price: Low → High", value: "price_low" },
            { name: "Price: High → Low", value: "price_high" },
            { name: "Popularity", value: "popularity" },
          ].map((sort) =>
            renderOption(sort, sortOption, setSortOption)
          )}
        </View>
      </Animated.View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
          <Text style={styles.applyText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },

  sectionTitle: { fontWeight: "700", fontSize: 16, marginBottom: 8 },

  optionsRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },

  optionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
  },

  optionBtnActive: { backgroundColor: "#1a8917", borderColor: "#1a8917" },

  optionText: { color: "#333" },
  optionTextActive: { color: "#fff", fontWeight: "700" },

  buttons: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },

  resetBtn: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1a8917",
    flex: 0.45,
    alignItems: "center",
  },

  resetText: { color: "#1a8917", fontWeight: "700" },

  applyBtn: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#1a8917",
    flex: 0.45,
    alignItems: "center",
  },

  applyText: { color: "#fff", fontWeight: "700" },
});
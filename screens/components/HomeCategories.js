import React, { useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";



/* =========================
   FIRST CODE (TOP SECTION)
========================= */

const categories = [
  {
    label: "Vegetables",
    image: require("../../assets/carrot.png"),
  },
  {
    label: "Meat",
    image: require("../../assets/melon.png"),
  },
  {
    label: "Fruits",
    image: require("../../assets/apple.png"),
  },
];

function HomeCategories({ activeCategory, setActiveCategory }) {
  return (
    <View style={categoryStyles.section}>
      <View style={categoryStyles.sectionHeader}>
        <Text style={categoryStyles.categoryTitle}>
          Categories
        </Text>
        <TouchableOpacity>
          <Text style={categoryStyles.seeAll}>
            See all
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {categories.map((item) => {
          const active =
            activeCategory === item.label;

          const scale = useRef(new Animated.Value(1)).current;

          const handlePressIn = () => {
            Animated.spring(scale, {
              toValue: 0.96,
              useNativeDriver: true,
            }).start();
          };

          const handlePressOut = () => {
            Animated.spring(scale, {
              toValue: 1,
              useNativeDriver: true,
            }).start();
          };

          return (
            <Animated.View
              key={item.label}
              style={{ transform: [{ scale }] }}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={() =>
                  setActiveCategory(item.label)
                }
                style={[
                  categoryStyles.categoryCard,
                  active &&
                    categoryStyles.activeCategoryCard,
                ]}
              >
                <Text
                  style={[
                    categoryStyles.categoryText,
                    active &&
                      categoryStyles.activeCategoryText,
                  ]}
                >
                  {item.label}
                </Text>

                <Image
                  source={item.image}
                  style={categoryStyles.categoryImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const categoryStyles = StyleSheet.create({
  section: {
    paddingHorizontal: 24,
    marginTop: 30,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  categoryTitle: {
    fontSize: 18,
    fontWeight: "600",
  },

  seeAll: {
    color: "#10B981",
    fontWeight: "500",
  },

  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  activeCategoryCard: {
    backgroundColor: "#ECFDF5",
    borderColor: "#34D399",
  },

  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },

  activeCategoryText: {
    color: "#065F46",
  },

  categoryImage: {
    width: 20,
    height: 20,
    marginLeft: 8,
  },
});



/* =========================
   SECOND CODE (BOTTOM SECTION)
========================= */

const subCategories = [
  "Tomatoes",
  "Mushrooms",
  "Pumpkin",
  "Cucumbers",
  "Corn",
  "Green Beans",
];

const products = [
  {
    id: 1,
    image: require("../../assets/tomato1.png"),
    price: "1.54 ₦",
    name: "Pomodorini 250g (Italy)",
    perKg: "4.25 ₦ / kg",
  },
  {
    id: 2,
    image: require("../../assets/yellotomato2.png"),
    price: "1.80 ₦",
    name: "Yellow Cherry Tomatoes 250g",
    perKg: "3.45 ₦ / kg",
  },
  {
    id: 3,
    image: require("../../assets/tomato5.png"),
    price: "0.95 ₦",
    name: "Cherrytomaten 250g (Marokko)",
    perKg: "2.20 ₦ / kg",
    backSoon: true,
  },
  {
    id: 4,
    image: require("../../assets/tomato3.png"),
    price: "1.60 ₦",
    name: "Roma VF Tomatoes",
    perKg: "2.85 ₦ / kg",
  },
  {
    id: 5,
    image: require("../../assets/singletomato4.png"),
    price: "2.00 ₦",
    name: "Moscow VR Tomatoes",
    perKg: "1.25 ₦ / kg",
  },
  {
    id: 6,
    image: require("../../assets/tomato5.png"),
    price: "1.50 ₦",
    name: "Calypso Tomato 200 gr",
    perKg: "1.40 ₦ / kg",
  },
];

function ProductSection() {
  return (
    <View style={{ marginTop: 20 }}>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ paddingHorizontal: 24 }}
      >
        {subCategories.map((item, index) => (
          <TouchableOpacity key={index} style={productStyles.subTab}>
            <Text style={productStyles.subTabText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={productStyles.grid}>
        {products.map((item) => (
          <View key={item.id} style={productStyles.card}>

            {item.backSoon && (
              <View style={productStyles.badge}>
                <Text style={productStyles.badgeText}>Back soon</Text>
              </View>
            )}

            <View style={productStyles.imageContainer}>
              <Image
                source={item.image}
                style={productStyles.productImage}
                resizeMode="contain"
              />

              <TouchableOpacity style={productStyles.plusBtn}>
                <Ionicons name="add" size={16} color="#10B981" />
              </TouchableOpacity>
            </View>

            <Text style={productStyles.price}>{item.price}</Text>
            <Text style={productStyles.name}>{item.name}</Text>
            <Text style={productStyles.perKg}>{item.perKg}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={{ alignSelf: "center", marginTop: 20 }}>
        <Text style={productStyles.seeMore}>See more</Text>
      </TouchableOpacity>
    </View>
  );
}

const productStyles = StyleSheet.create({
  subTab: {
    marginRight: 20,
    paddingBottom: 8,
  },

  subTabText: {
    fontSize: 15,
    color: "#6B7280",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginTop: 20,
  },

  card: {
    width: "31%",
    marginBottom: 24,
  },

  imageContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  productImage: {
    width: 70,
    height: 70,
  },

  plusBtn: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#ECFDF5",
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  price: {
    marginTop: 8,
    fontWeight: "600",
    fontSize: 14,
  },

  name: {
    fontSize: 13,
    color: "#374151",
    marginTop: 2,
  },

  perKg: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },

  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 10,
  },

  badgeText: {
    fontSize: 10,
    color: "#6B7280",
  },

  seeMore: {
    color: "#10B981",
    fontWeight: "600",
  },
});



/* =========================
   EXPORT MAIN SCREEN
========================= */

export default function CombinedScreen({ activeCategory, setActiveCategory }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <HomeCategories
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />
      <ProductSection />
    </ScrollView>
  );
}
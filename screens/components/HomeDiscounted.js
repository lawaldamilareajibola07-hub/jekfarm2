import React, { useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

/* =========================
   DATA
========================= */

const vegetables = [
  {
    id: 1,
    image: require("../../assets/tomato1.png"),
    price: "1.60 ₦",
    oldPrice: "2.30 ₦",
    name: "Broccoli Lorem Ipsum",
    perKg: "3.45 ₦ / kg",
    discount: "-15%",
  },
  {
    id: 2,
    image: require("../../assets/yellotomato2.png"),
    price: "1.20 ₦",
    oldPrice: "1.90 ₦",
    name: "Carrots Lorem Ipsum",
    perKg: "4.20 ₦ / kg",
    discount: "-15%",
  },
  {
    id: 3,
    image: require("../../assets/tomato5.png"),
    price: "1.50 ₦",
    oldPrice: "1.90 ₦",
    name: "Eggplant Lorem Ipsum",
    perKg: "3.90 ₦ / kg",
    discount: "-15%",
  },
];

const meats = [
  {
    id: 4,
    image: require("../../assets/tomato3.png"),
    price: "3.95 ₦",
    name: "Rinderhackfleisch Bio 450g",
    perKg: "9.50 ₦ / kg",
  },
  {
    id: 5,
    image: require("../../assets/singletomato4.png"),
    price: "5.40 ₦",
    name: "Hackfleisch Gemisch 400g",
    perKg: "3.90 ₦ / kg",
  },
  {
    id: 6,
    image: require("../../assets/tomato5.png"),
    price: "3.50 ₦",
    name: "Dry Aged Rinder Burger 200g",
    perKg: "9.20 ₦ / kg",
  },
];

/* =========================
   REUSABLE PRODUCT CARD
========================= */

function ProductCard({ item }) {
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
      style={[
        styles.card,
        { transform: [{ scale }] }
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {/* Discount Badge */}
        {item.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {item.discount}
            </Text>
          </View>
        )}

        <Image
          source={item.image}
          style={styles.productImage}
          resizeMode="contain"
        />

        {/* Add Button */}
        <TouchableOpacity style={styles.plusBtn}>
          <Ionicons name="add" size={18} color="#10B981" />
        </TouchableOpacity>

        <View style={{ marginTop: 10 }}>
          <Text style={styles.price}>{item.price}</Text>

          {item.oldPrice && (
            <Text style={styles.oldPrice}>
              {item.oldPrice}
            </Text>
          )}

          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>

          <Text style={styles.perKg}>
            {item.perKg}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

/* =========================
   SECTION COMPONENT
========================= */

function ProductSection({ title, data }) {
  return (
    <View style={{ marginTop: 25 }}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 24 }}
      >
        {data.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </ScrollView>
    </View>
  );
}

/* =========================
   MAIN SCREEN
========================= */

export default function GroceryScreen() {
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.discountTitle}>
          Discounted
        </Text>

        <TouchableOpacity>
          <Text style={styles.seeAll}>
            See all
          </Text>
        </TouchableOpacity>
      </View>

      <ProductSection
        title="Vegetables"
        data={vegetables}
      />

      <ProductSection
        title="Meat"
        data={meats}
      />
    </ScrollView>
  );
}

/* =========================
   STYLES
========================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 30,
  },

  discountTitle: {
    fontSize: 22,
    fontWeight: "700",
  },

  seeAll: {
    color: "#10B981",
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    paddingHorizontal: 24,
  },

  card: {
    width: width * 0.38,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginRight: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },

  discountBadge: {
    position: "absolute",
    top: -10,
    alignSelf: "center",
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },

  discountText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },

  productImage: {
    width: 80,
    height: 80,
    alignSelf: "center",
  },

  plusBtn: {
    position: "absolute",
    right: 12,
    top: 60,
    backgroundColor: "#ECFDF5",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  price: {
    fontWeight: "700",
    fontSize: 15,
  },

  oldPrice: {
    fontSize: 12,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },

  name: {
    fontSize: 13,
    color: "#374151",
    marginTop: 4,
  },

  perKg: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
});
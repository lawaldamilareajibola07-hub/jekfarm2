import React, { useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import { useCart } from "../context/CartContext";
import AddToast from "./AddToast";

const products = [
  {
    id: "1",
    name: "Broccoli",
    price: "1.60 N",
    oldPrice: "2.30 N",
    discount: "-15%",
    // image: require("./assets/broccoli.png"),
  },
  {
    id: "2",
    name: "Carrots",
    price: "1.20 N",
    oldPrice: "1.40 N",
    discount: "-15%",
    // image: require("./assets/carrots.png"),
  },
  {
    id: "3",
    name: "Eggplant",
    price: "1.50 N",
    oldPrice: "1.80 N",
    discount: "-15%",
    // image: require("./assets/eggplant.png"),
  },
];

const ProductCard = ({ item, onAdd }) => (
  <View
    style={{
      backgroundColor: "#fff",
      borderRadius: 10,
      marginRight: 12,
      padding: 10,
      width: 120,
    }}
  >
    {/* Discount Badge */}
    <View
      style={{
        backgroundColor: "red",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 5,
        alignSelf: "flex-start",
        marginBottom: 5,
      }}
    >
      <Text style={{ color: "#fff", fontSize: 12 }}>{item.discount}</Text>
    </View>

    {/* Product Image */}
    <Image
      source={item.image}
      style={{ width: 80, height: 80, alignSelf: "center" }}
      resizeMode="contain"
    />

    {/* Price */}
    <Text style={{ fontWeight: "bold", marginTop: 5 }}>{item.price}</Text>
    <Text style={{ textDecorationLine: "line-through", color: "gray" }}>
      {item.oldPrice}
    </Text>

    {/* Name */}
    <Text style={{ fontSize: 12, marginTop: 4 }}>{item.name}</Text>

    {/* Add Button */}
    <TouchableOpacity
      style={{
        backgroundColor: "green",
        padding: 5,
        borderRadius: 20,
        marginTop: 8,
        alignSelf: "flex-end",
      }}
      onPress={() => onAdd && onAdd(item)}
    >
      <Text style={{ color: "#fff", fontSize: 12 }}>+</Text>
    </TouchableOpacity>
  </View>
);

const HorizontalProductList = ({ addToCart: propAddToCart }) => {
  const { addToCart } = useCart();
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleAdd = (item) => {
    const targetAdd = propAddToCart || addToCart;
    if (!targetAdd) return;
    const parsePrice = (p) => {
      if (typeof p === "number") return p;
      const cleaned = String(p).replace(/[^0-9.,-]/g, "").replace(/,/g, ".");
      const n = parseFloat(cleaned);
      return Number.isFinite(n) ? n : 0;
    };
    const payload = { ...item, id: item.id || item.name, price: parsePrice(item.price), quantity: 1 };
    targetAdd(payload);
    setToastMessage(`${item.name} added to cart`);
    setToastVisible(true);
  };

  return (
    <View style={{ marginTop: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
        Vegetables
      </Text>
      <FlatList
        data={products}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductCard item={item} onAdd={handleAdd} />}
      />

      <AddToast visible={toastVisible} message={toastMessage} onHide={() => setToastVisible(false)} />
    </View>
  );
};

export default HorizontalProductList;

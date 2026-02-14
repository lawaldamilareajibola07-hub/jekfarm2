import React from "react";
import { SafeAreaView, View } from "react-native";
import SearchBar from "../components/SearchBar";
import ProductsHeader from "../farmers-com/ProductsHeader";
import ProductsList from "../farmers-com/ProductsList";

export default function InventoryScreen({ navigation, route }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white", paddingTop:30 }}>
      <View style={{ flex: 1, padding: 20 }}>
      
        <ProductsHeader />
        <ProductsList />
      </View>
    </SafeAreaView>
  );
}

import React from "react";
import { View, ScrollView, SafeAreaView } from "react-native";
import ProductsHeader from "../farmers-com/ProductsHeader";

export default function ProductsScreen({ navigation, route }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flex: 1 }}>
        <ProductsHeader navigation={navigation} />
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {/* Add product list or form components here */}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

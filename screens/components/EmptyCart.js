import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import cartImg from  "../../assets/emptyCartState.png";

export default function EmptyCart() {
  const navigation = useNavigation();

useEffect(() => {
    // Get the tab navigator parent and show the tab bar
    const parent = navigation.getParent();
    if (parent) {
      parent.setOptions({
        tabBarStyle: {
          display: 'flex',
          height: 85,
          paddingTop: 10,
          paddingBottom: 28,
          paddingHorizontal: 10,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
        }
      });
    }
    
    // Cleanup when component unmounts
    return () => {
      if (parent) {
        // Optional: Hide tab bar again when leaving EmptyCart
        parent.setOptions({
          tabBarStyle: { display: 'none' }
        });
      }
    };
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.emptyContainer}>

    <Image
    source={cartImg} 
    style={{size:20}}
    />

        <Text style={styles.emptyText}>Your cart is empty!</Text>

        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate("ShoppingCart")}
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff", justifyContent: "center", alignItems: "center" },
  emptyContainer: { justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 18, color: "#666" },
  shopButton: {
    backgroundColor: "#F97316",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 16,
  },
  shopButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

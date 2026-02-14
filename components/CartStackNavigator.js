import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ShoppingCartScreen from "../screens/components/ShoppingCart";
import Checkout from "../screens/components/Checkout";
import OrderSuccess from "../screens/components/OrderSuccess";
import { useCart } from "../screens/CartContext";

const Stack = createNativeStackNavigator();

const CartStackNavigator = () => {
  const { getCartCount } = useCart();

  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ShoppingCart" 
        component={ShoppingCartScreen}
        options={({ navigation }) => ({
          title: "Shopping Cart",
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#333" style={{marginRight: 20}} />
            </TouchableOpacity>
          ),
        headerRight: () => (
  <View style={{ position: 'relative', marginRight: 15 }}>
    <Ionicons name="cart-outline" size={24} color="#333" />
    {getCartCount() > 0 && (
      <View style={{
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'red',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white'
      }}>
        <Text style={{ 
          color: 'white', 
          fontSize: 10, 
          fontWeight: 'bold' 
        }}>
          {getCartCount() > 99 ? '99+' : getCartCount()}
        </Text>
      </View>
    )}
  </View>
),
        })}
      />
      <Stack.Screen 
        name="Checkout" 
        component={Checkout}
        options={{ 
          title: "Checkout",
          headerBackTitle: "Cart"
        }}
      />
      <Stack.Screen 
        name="OrderSuccess" 
        component={OrderSuccess}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default CartStackNavigator;
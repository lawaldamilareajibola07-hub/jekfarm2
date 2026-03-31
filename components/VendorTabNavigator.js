import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import VendorHomeScreen from "../screens/vendor/VendorHomeScreen";
import VendorProductsScreen from "../screens/vendor/VendorProductsScreen";
import VendorOrdersScreen from "../screens/vendor/VendorOrdersScreen";
import VendorWalletScreen from "../screens/vendor/VendorWalletScreen"
import VendorStoreSettingsScreen from "../screens/vendor/VendorStoreSettingsScreen";

const Tab = createBottomTabNavigator();

const TAB_CONFIG = [
  {
    name: "VendorHome",
    component: VendorHomeScreen,
    label: "Home",
    icon: "home-outline",
    activeIcon: "home",
  },
  {
    name: "VendorProducts",
    component: VendorProductsScreen,
    label: "Products",
    icon: "cube-outline",
    activeIcon: "cube",
  },
  {
    name: "VendorOrders",
    component: VendorOrdersScreen,
    label: "Orders",
    icon: "receipt-outline",
    activeIcon: "receipt",
  },
  {
    name: "VendorWallet",
    component: VendorWalletScreen,
    label: "Wallet",
    icon: "wallet-outline",
    activeIcon: "wallet",
  },
  {
    name: "VendorSettings",
    component: VendorStoreSettingsScreen,
    label: "Store",
    icon: "storefront-outline",
    activeIcon: "storefront",
  },
];

export default function VendorTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="VendorHome"
      screenOptions={({ route }) => {
        const config = TAB_CONFIG.find((t) => t.name === route.name);
        return {
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: "#2D6A4F",
          tabBarInactiveTintColor: "#9CA3AF",
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? config.activeIcon : config.icon}
              size={22}
              color={color}
            />
          ),
        };
      }}
    >
      {TAB_CONFIG.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{ tabBarLabel: tab.label }}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingBottom: 8,
    paddingTop: 6,
    height: 62,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
});
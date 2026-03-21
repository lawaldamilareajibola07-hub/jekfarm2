import React, { useRef } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

// Screens
import AdminDashboard from "../screens/admin/AdminDashboard";
import AdminUsers from "../screens/admin/AdminUsers";
import AdminOrders from "../screens/admin/AdminOrders";
import AdminFarmers from "../screens/admin/AdminFarmers"; // Farmers tab


const Tab = createBottomTabNavigator();
const { width } = Dimensions.get("window");
const TAB_COUNT = 5;

export default function AdminTabNavigator() {
  const translateX = useSharedValue(0);

  const tabs = [
    { name: "Dashboard", icon: "speedometer-outline", component: AdminDashboard },
    { name: "Users", icon: "people-outline", component: AdminUsers },
    { name: "Orders", icon: "receipt-outline", component: AdminOrders },
    { name: "Farmers", icon: "person-outline", component: AdminFarmers },
    { name: "Settings", icon: "settings-outline", component: AdminSettings },
  ];

  const tabIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(translateX.value) }],
  }));

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "relative",
          height: 60,
          backgroundColor: "#fff",
          elevation: 5,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 5,
          shadowOffset: { width: 0, height: 3 },
        },
        tabBarLabel: () => null, // remove labels
      }}
    >
      {tabs.map((tab, index) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          options={{
            tabBarIcon: ({ focused, size, color }) => (
              <Animated.View style={{ alignItems: "center", justifyContent: "center" }}>
                <Ionicons name={tab.icon} size={size} color={focused ? "#10b981" : "#6b7280"} />
              </Animated.View>
            ),
          }}
        >
          {({ navigation, route }) => {
            // Animate indicator when tab is focused
            if (route.state?.index !== undefined) {
              translateX.value = (route.state.index || 0) * (width / TAB_COUNT);
            }

            return (
              <Animated.View style={{ flex: 1 }}>
                <tab.component />
              </Animated.View>
            );
          }}
        </Tab.Screen>
      ))}

      {/* Tab Indicator */}
      <Animated.View
        style={[
          {
            position: "absolute",
            bottom: 0,
            left: 0,
            width: width / TAB_COUNT,
            height: 3,
            backgroundColor: "#10b981",
          },
          tabIndicatorStyle,
        ]}
      />
    </Tab.Navigator>
  );
}
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { View, Text, StyleSheet, Alert } from "react-native";

// Screens
import DashboardScreen from "../screens/DashboardScreen";
import InventoryScreen from "../screens/InventoryScreen";
import WalletStackNavigator from "./WalletStackNavigator";

// IMPORT THE STACK - COMMENTED OUT FOR NOW
// import FarmerInboxStack from "./FarmerInboxStack";

// Placeholder screen for Inbox
const InboxPlaceholderScreen = () => {
  // Show alert when component mounts
  React.useEffect(() => {
    Alert.alert(
      "Coming Soon",
      "Inbox feature is under development. Stay tuned!",
      [{ text: "OK" }]
    );
  }, []);

  return (
    <View style={styles.placeholderContainer}>
      <Icon name="email" size={80} color="#10b91eff" />
      <Text style={styles.placeholderTitle}>Inbox Coming Soon</Text>
      <Text style={styles.placeholderText}>
        We're working hard to bring you messaging features.
      </Text>
      <Text style={styles.placeholderText}>
        Check back soon for updates!
      </Text>
    </View>
  );
};

const Tab = createBottomTabNavigator();

export default function FarmerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 110,
          elevation: 10,
          backgroundColor: "#fff",
          paddingBottom: 20,
          paddingTop: 5,
        },
        tabBarItemStyle: {
          marginBottom: 5,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Dashboard") iconName = "view-dashboard";
          else if (route.name === "Inventory") iconName = "package-variant";
          else if (route.name === "Wallet") iconName = "wallet";
          else if (route.name === "Inbox") iconName = "email";
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#10b91eff",
        tabBarInactiveTintColor: "gray",
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 10,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Inventory" component={InventoryScreen} />
      <Tab.Screen name="Wallet" component={WalletStackNavigator} />

      {/* Placeholder for Inbox - will show alert when clicked */}
      <Tab.Screen
        name="Inbox"
        component={InboxPlaceholderScreen}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#10b91eff",
    marginTop: 20,
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
});
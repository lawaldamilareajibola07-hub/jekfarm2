import React, { useEffect, useRef } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image, View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "../context/CartContext";

// Navigators
import HomeStackNavigator from "../components/HomeStackNavigator";
import ChatStackNavigator from "./chatStackNavigator";
import WalletStackNavigator from "../components/WalletStackNavigator"; // ✅ Use Wallet Stack

// Screens
import ProfileScreen from "../screens/ProfileScreen";
import CategoriesScreen from "../screens/CategoriesScreen";
import NotificationsScreen from "../screens/NotificationsScreen";

// Assets
import homeActive from "../assets/homeActive.png";
import homeInactive from "../assets/homeInactive.png";
import walletActive from "../assets/walletActive.png";
import walletInactive from "../assets/walletInactive.png";
import chatActive from "../assets/chatActive.png";
import chatInactive from "../assets/chatInactive.png";

const Tab = createBottomTabNavigator();
const PRIMARY_COLOR = "#10b981";
const INACTIVE_COLOR = "#9ca3af";
const ICON_SIZE = 24;

const screens = [
  { name: "Home", component: HomeStackNavigator },
  { name: "Wallet", component: WalletStackNavigator }, // ✅ Use the stack for Wallet
  { name: "Notifications", component: NotificationsScreen },
  { name: "Chat", component: ChatStackNavigator },
  { name: "Profile", component: ProfileScreen },
  { name: "Category", component: CategoriesScreen, hidden: true },
];

function TabItem({ isActive, label, onPress, icon, activeIcon, children }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isActive ? 1.15 : 1,
      useNativeDriver: true,
      friction: 4,
    }).start();
  }, [isActive]);

  return (
    <TouchableOpacity style={styles.tabItem} onPress={onPress}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {children ? (
          children
        ) : (
          <Image
            source={isActive ? activeIcon : icon}
            style={[
              styles.icon,
              { tintColor: isActive ? PRIMARY_COLOR : INACTIVE_COLOR },
            ]}
          />
        )}
      </Animated.View>
      <Text style={[styles.label, { color: isActive ? PRIMARY_COLOR : INACTIVE_COLOR }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function CustomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const { cartCount } = useCart();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
      <TabItem
        label="Home"
        isActive={state.index === 0}
        onPress={() => navigation.navigate("Home")}
        icon={homeInactive}
        activeIcon={homeActive}
      />

      <TabItem
        label="Wallet"
        isActive={state.index === 1}
        onPress={() => navigation.navigate("Wallet")}
        icon={walletInactive}
        activeIcon={walletActive}
      />

      <TabItem
        label="Alerts"
        isActive={state.index === 2}
        onPress={() => navigation.navigate("Notifications")}
      >
        <Ionicons
          name={state.index === 2 ? "notifications" : "notifications-outline"}
          size={ICON_SIZE}
          color={state.index === 2 ? PRIMARY_COLOR : INACTIVE_COLOR}
        />
      </TabItem>

      <TabItem
        label="Chat"
        isActive={state.index === 3}
        onPress={() => navigation.navigate("Chat")}
      >
        <View style={styles.iconContainer}>
          <Image
            source={state.index === 3 ? chatActive : chatInactive}
            style={[
              styles.icon,
              { tintColor: state.index === 3 ? PRIMARY_COLOR : INACTIVE_COLOR },
            ]}
          />
          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount > 99 ? "99+" : cartCount}</Text>
            </View>
          )}
        </View>
      </TabItem>

      <TabItem
        label="Profile"
        isActive={state.index === 4}
        onPress={() => navigation.navigate("Profile")}
      >
        <Ionicons
          name={state.index === 4 ? "person" : "person-outline"}
          size={ICON_SIZE}
          color={state.index === 4 ? PRIMARY_COLOR : INACTIVE_COLOR}
        />
      </TabItem>
    </View>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      {screens.map((s) => (
        <Tab.Screen
          key={s.name}
          name={s.name}
          component={s.component}
          options={{ tabBarButton: s.hidden ? () => null : undefined }}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    height: 75,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "space-around",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabItem: { alignItems: "center", justifyContent: "center" },
  iconContainer: { position: "relative" },
  icon: { width: ICON_SIZE, height: ICON_SIZE, resizeMode: "contain" },
  label: { fontSize: 11, marginTop: 4, fontWeight: "600" },
  badge: {
    position: "absolute",
    top: -4,
    right: -10,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "bold" },
});
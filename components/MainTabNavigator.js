import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "../screens/CartContext";

import HomeStackNavigator from "../components/HomeStackNavigator";
import CartStackNavigator from "../components/CartStackNavigator";
import ChatStackNavigator from "./chatStackNavigator";
import PointsScreen from "../screens/Points";
import ProfileScreen from "../screens/ProfileScreen";
import CategoriesScreen from "../screens/CategoriesScreen";

import homeActive from "../assets/homeActive.png";
import homeInactive from "../assets/homeInactive.png";
import walletActive from "../assets/walletActive.png";
import walletInactive from "../assets/walletInactive.png";
import chatActive from "../assets/chatActive.png";
import chatInactive from "../assets/chatInactive.png";

const Tab = createBottomTabNavigator();

const PRIMARY_COLOR = "#10b981";
const INACTIVE_COLOR = "#9ca3af";
const ICON_SIZE = 26;

const screens = [
  { name: "Home", component: HomeStackNavigator },
  { name: "Wallet", component: PointsScreen },
  { name: "Chat", component: ChatStackNavigator },
  { name: "Profile", component: ProfileScreen },
  { name: "Category", component: CategoriesScreen, hidden: true },
];

function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const { getCartCount } = useCart();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
      {/* Home - Left */}
      <TouchableOpacity
        style={styles.tabItemLeft}
        onPress={() => navigation.navigate('Home')}
      >
        <Image
          source={state.index === 0 ? homeActive : homeInactive}
          style={[styles.icon, { tintColor: state.index === 0 ? PRIMARY_COLOR : INACTIVE_COLOR }]}
        />
      </TouchableOpacity>

      {/* Center Group - Wallet and Chat */}
      <View style={styles.centerGroup}>
        <TouchableOpacity
          style={styles.tabItemCenter}
          onPress={() => navigation.navigate('Wallet')}
        >
          <Image
            source={state.index === 1 ? walletActive : walletInactive}
            style={[styles.icon, { tintColor: state.index === 1 ? PRIMARY_COLOR : INACTIVE_COLOR }]}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItemCenter}
          onPress={() => navigation.navigate('Chat')}
        >
          <View style={styles.iconContainer}>
            <Image
              source={state.index === 2 ? chatActive : chatInactive}
              style={[styles.icon, { tintColor: state.index === 2 ? PRIMARY_COLOR : INACTIVE_COLOR }]}
            />
            {getCartCount() > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {getCartCount() > 99 ? '99+' : getCartCount()}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Profile - Right */}
      <TouchableOpacity
        style={styles.tabItemRight}
        onPress={() => navigation.navigate('Profile')}
      >
        <Ionicons
          name={state.index === 3 ? "person" : "person-outline"}
          size={ICON_SIZE}
          color={state.index === 3 ? PRIMARY_COLOR : INACTIVE_COLOR}
        />
      </TouchableOpacity>
    </View>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {screens.map((s) => (
        <Tab.Screen
          key={s.name}
          name={s.name}
          component={s.component}
          options={{
            tabBarButton: s.hidden ? () => null : undefined,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: 65,
    paddingTop: 0,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 0,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  tabItemLeft: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  tabItemCenter: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemRight: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    resizeMode: 'contain',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 10,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Wallet Screens
import WalletDashboardScreen from "../screens/WalletDashboardScreen";
import FundWalletScreen from "../screens/FundWalletScreen";
import CreateVirtualAccountScreen from "../screens/CreateVirtualAccountScreen";
import TransactionDetailsScreen from "../screens/Points/TransactionDetailsScreen";
import WalletScreen from "../screens/WalletScreen";
import FarmerSendMoney from "../screens/FarmerSendMoney";
import FarmerEnterAmount from "../screens/FarmerEnterAmount";
import FarmerSendMoneySuccess from "../screens/FarmerSendMoneySuccess";

const Stack = createNativeStackNavigator();

export default function WalletStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="WalletDashboard"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      {/* Main Wallet Screens */}
      <Stack.Screen name="WalletDashboard" component={WalletDashboardScreen} />
      <Stack.Screen name="FundWallet" component={FundWalletScreen} />
      <Stack.Screen name="CreateVirtualAccount" component={CreateVirtualAccountScreen} />
      <Stack.Screen name="TransactionDetails" component={TransactionDetailsScreen} />

      {/* Farmer Flow Screens */}
      <Stack.Screen name="WalletMain" component={WalletScreen} />
      <Stack.Screen name="FarmerSendMoney" component={FarmerSendMoney} />
      <Stack.Screen name="FarmerEnterAmount" component={FarmerEnterAmount} />
      <Stack.Screen
        name="FarmerSendMoneySuccess"
        component={FarmerSendMoneySuccess}
        options={{
          animation: "fade",
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}
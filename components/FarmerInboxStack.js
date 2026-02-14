// components/FarmerInboxStack.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import InboxScreen from "../screens/InboxScreen";
import FarmerUserSearch from "../screens/FarmerUserSearch";
import FarmerChat from "../screens/FarmerChat";

const Stack = createNativeStackNavigator();

export default function FarmerInboxStack() {
  return (
    <Stack.Navigator
      initialRouteName="Inbox"
      screenOptions={{
        headerShown: false,
        presentation: "card",
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="Inbox" component={InboxScreen} />
      <Stack.Screen name="FarmerUserSearch" component={FarmerUserSearch} />
      <Stack.Screen name="FarmerChat" component={FarmerChat} />
    </Stack.Navigator>
  );
}
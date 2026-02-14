import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/Home";
import CategoryScreen from "../screens/CategoriesScreen";
import UserProduct from "../screens/UserProduct";
import UserProductDetails from "../screens/userProductDetails";

const Stack = createNativeStackNavigator();

export default function HomeStackNavigator({ route }) {
  // No need to pass cart props anymore since we're using context
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
      />

      {/* Category screen inside the Home stack */}
      <Stack.Screen
        name="CategoriesScreen"
        component={CategoryScreen}
      />

      <Stack.Screen
        name="UserProduct"
        component={UserProduct}
      />

      <Stack.Screen
        name="UserProductDetails"
        component={UserProductDetails}
      />
    </Stack.Navigator>
  );
}
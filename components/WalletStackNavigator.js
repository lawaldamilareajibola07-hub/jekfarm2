import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Wallet Screens
import WalletScreen from '../screens/WalletScreen';
import FarmerSendMoney from '../screens/FarmerSendMoney';
import FarmerEnterAmount from '../screens/FarmerEnterAmount';
import FarmerSendMoneySuccess from '../screens/FarmerSendMoneySuccess';

const Stack = createNativeStackNavigator();

const WalletStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="WalletMain"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="WalletMain" 
        component={WalletScreen} 
      />
      <Stack.Screen 
        name="FarmerSendMoney" 
        component={FarmerSendMoney} 
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="FarmerEnterAmount" 
        component={FarmerEnterAmount} 
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="FarmerSendMoneySuccess" 
        component={FarmerSendMoneySuccess} 
        options={{
          animation: 'fade',
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default WalletStackNavigator;
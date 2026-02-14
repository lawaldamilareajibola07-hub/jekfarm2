/*
  Project: Jekfarm
  Author:  Alex Mfoniso
  License: Proprietary - Not for redistribution
  Fingerprint: 0xA9F2-91C3-449E
*/

import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./security/track.js";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts, Lato_400Regular, Lato_700Bold } from "@expo-google-fonts/lato";
import {
  Inter_400Regular, Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

// Cart Context
import { CartProvider } from "./screens/CartContext.js";

// Screens
import OnboardingScreen from "./screens/OnboardingScreen";
import LoginScreen from "./screens/LoginScreen";
import ProfileScreen from "./screens/ProfileScreen";
import CreateAccountScreen from "./screens/CreateAccountScreen";
import ConfirmEmailScreen from "./screens/ConfirmEmailScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import ChangePassword from "./screens/ChangePassword";
import ConfirmOTP from "./screens/ConfirmOTP";
import ConfirmOTPForgotPassword from "./screens/ConfirmOTPForgotPassword";
import CompleteProfileScreen from "./screens/CompleteProfileScreen";
import ProductDetails from "./screens/ProductDetails";
import AuthLoadingScreen from "./screens/AuthLoadingScreen";
import Settings from "./screens/Settings-Screens/Settings";

import PersonalInfoScreen from "./screens/Settings-Screens/PersonalInfoScreen";

import EditProfileScreen from "./screens/Settings-Screens/EditProfileScreen";
import DeliveryPreferencesScreen from "./screens/Settings-Screens/DeliveryPreferencesScreen";
import SettingsSecurityScreen from "./screens/Settings-Screens/SettingsSecurityScreen";
import AddressBookScreen from "./screens/Settings-Screens/AddressBookScreen";
import VerifyNumberScreen from "./screens/Settings-Screens/VerifyNumberScreen";
import VerifyEmailScreen from "./screens/Settings-Screens/VerifyEmailScreen";
import NumberChangedScreen from "./screens/Settings-Screens/NumberChangedScreen";
import EmailUpdatedScreen from "./screens/Settings-Screens/EmailUpdatedScreen";
import AddMoneyScreen from "./screens/Points/AddMoneyScreen";
import SendMoneyScreen from "./screens/Points/SendMoneyScreen";
import DepositScreen from "./screens/Points/DepositeScreen";
import TransactionDetailsScreen from "./screens/Points/TransactionDetailsScreen"
import EnterAmountScreen from "./screens/Points/EnterAmountScreen";
import SwapSuccessScreen from "./screens/Points/SwapSuccessScreen";
import CryptoFundingScreen from "./screens/Points/CryptoFundingScreen";
import SendCryptoScreen from "./screens/Points/SendCryptoScreen";
import PersonnalInformation from "./screens/_components/PersonalInformation";
import JobInformation from "./screens/_components/JobInformation";
import EmergencyContacts from "./screens/_components/EmergencyContacts";
import UploadIDCard from "./screens/_components/UploadIDCard";
import SelfieWithID from "./screens/_components/SelfieWithID";
import LoanUnderReview from "./screens/_components/LoanUnderReview";
import LoanApproved from "./screens/_components/LoanApproved";
import LoanUnsuccessful from "./screens/_components/LoadUnsuccessful";

import ReferralScreen from "./screens/Ref/ReferralScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import TransactionItem from "./screens/Trans/TransactionItem";
import ReceiptScreen from "./screens/Trans/ReceiptScreen";
import SubscriptionsScreen from "./screens/Sub/SubscriptionsScreen";
import CreateVirtualAccountScreen from "./screens/CreateVirtualAccountScreen";
import ChatStackNavigator from "./components/chatStackNavigator.js";

import ChatBotScreen from "./screens/ChatBotScreen";

import AddProductScreen from "./screens/AddProductScreen";
import CategoriesScreen from "./screens/CategoriesScreen";



import Checkout from "./screens/components/Checkout.js";
import OrderSuccess from "./screens/components/OrderSuccess.js";
import ShoppingCartScreen from "./screens/components/ShoppingCart.js";




// Tab Screens
import HomeScreen from "./screens/Home";

import PointsScreen from "./screens/Points";

// Main Tab Navigator
import MainTabNavigator from "./components/MainTabNavigator";
import FarmerTabNavigator from "./components/FarmerTabNavigator";


const Stack = createNativeStackNavigator();

// MainTabNavigator and FarmerTabNavigator used directly in Stack.Screen

export default function App() {
  // Load fonts before app renders
  const [fontsLoaded] = useFonts({
    Lato_400Regular,
    Lato_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold

  });

  if (!fontsLoaded) {
    return null; // nothing shows until fonts are ready
  }

  return (
    <SafeAreaProvider>
      <CartProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="AuthLoading"
            screenOptions={{ headerShown: false }}
          >
            {/* Auth Loading (decides where to go) */}
            <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />

            {/* Auth / Onboarding flow */}
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={CreateAccountScreen} />
            <Stack.Screen name="Email" component={ConfirmEmailScreen} />
            <Stack.Screen name="Fbpass" component={ForgotPasswordScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePassword} />
            <Stack.Screen name="ConfirmOTP" component={ConfirmOTP} />
            <Stack.Screen name="ConfirmOTPForgotPassword" component={ConfirmOTPForgotPassword} />
            <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />

            {/* Product Details + Categories */}
            <Stack.Screen name="ProductDetails" component={ProductDetails} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Categories" component={CategoriesScreen} />

            <Stack.Screen name="ChatBot" component={ChatBotScreen} />
            <Stack.Screen name="AddProduct" component={AddProductScreen} />

            {/*  <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="ChatList" component={ChatListScreen} />
       
          <Stack.Screen name="UserSearch" component={UserSearchScreen} />
          <Stack.Screen name="GroupList" component={GroupListScreen} />
          <Stack.Screen name="GroupChat" component={GroupChatScreen} />
          <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
         
          */}

            <Stack.Screen name="ShoppingCart" component={ShoppingCartScreen} />
            <Stack.Screen name="Checkout" component={Checkout} />
            <Stack.Screen name="OrderSuccess" component={OrderSuccess} />



            {/* Settings */}
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="VerifyNumber" component={VerifyNumberScreen} />
            <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
            <Stack.Screen name="NumberChanged" component={NumberChangedScreen} />
            <Stack.Screen name="EmailUpdated" component={EmailUpdatedScreen} />
            <Stack.Screen
              name="DeliveryPreferences"
              component={DeliveryPreferencesScreen}
            />
            <Stack.Screen
              name="SettingsSecurity"
              component={SettingsSecurityScreen}
            />
            <Stack.Screen name="AddressBook" component={AddressBookScreen} />

            {/* Points */}
            <Stack.Screen name="AddMoney" component={AddMoneyScreen} />
            <Stack.Screen name="SendMoneyScreen" component={SendMoneyScreen} />
            <Stack.Screen
              name="EnterAmountScreen"
              component={EnterAmountScreen}
            />
            <Stack.Screen
              name="SwapSuccessScreen"
              component={SwapSuccessScreen}
            />
            <Stack.Screen
              name="CryptoFundingScreen"
              component={CryptoFundingScreen}
            />
            <Stack.Screen
              name="DepositScreen"
              component={DepositScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="TransactionDetailsScreen"
              component={TransactionDetailsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="SendCryptoScreen" component={SendCryptoScreen} />

            <Stack.Screen
              name="PersonnalInformation"
              component={PersonnalInformation}
            />
            <Stack.Screen name="JobInformation" component={JobInformation} />
            <Stack.Screen
              name="EmergencyContacts"
              component={EmergencyContacts}
            />
            <Stack.Screen name="UploadIDCard" component={UploadIDCard} />
            <Stack.Screen name="SelfieWithID" component={SelfieWithID} />
            <Stack.Screen name="LoanUnderReview" component={LoanUnderReview} />
            <Stack.Screen name="LoanApproved" component={LoanApproved} />
            <Stack.Screen name="LoanUnsuccessful" component={LoanUnsuccessful} />
            <Stack.Screen name="ReferralScreen" component={ReferralScreen} />
            <Stack.Screen name="TransactionItem" component={TransactionItem} />
            <Stack.Screen name="ReceiptScreen" component={ReceiptScreen} />
            <Stack.Screen name="Subscriptions" component={SubscriptionsScreen} />
            <Stack.Screen
              name="CreateVirtualAccount"
              component={CreateVirtualAccountScreen}
            />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />

            {/* After login → go to tabs */}
            {/* After login → go to tabs */}
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="FarmerTabs" component={FarmerTabNavigator} />

          </Stack.Navigator>
          <StatusBar style="auto" />
        </NavigationContainer>
      </CartProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Lato-Regular",
  },
});

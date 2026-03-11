import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import AuthLoadingScreen from "../screens/AuthLoadingScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import LoginScreen from "../screens/LoginScreen";
import CreateAccountScreen from "../screens/CreateAccountScreen";
import ConfirmEmailScreen from "../screens/ConfirmEmailScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import ChangePassword from "../screens/ChangePassword";
import ConfirmOTP from "../screens/ConfirmOTP";
import ConfirmOTPForgotPassword from "../screens/ConfirmOTPForgotPassword";
import CompleteProfileScreen from "../screens/CompleteProfileScreen";
import ProductDetails from "../screens/ProductDetails";
import ProfileScreen from "../screens/ProfileScreen";
import Settings from "../screens/Settings-Screens/Settings";
import PersonalInfoScreen from "../screens/Settings-Screens/PersonalInfoScreen";
import EditProfileScreen from "../screens/Settings-Screens/EditProfileScreen";
import DeliveryPreferencesScreen from "../screens/Settings-Screens/DeliveryPreferencesScreen";
import SettingsSecurityScreen from "../screens/Settings-Screens/SettingsSecurityScreen";
import AddressBookScreen from "../screens/Settings-Screens/AddressBookScreen";
import VerifyNumberScreen from "../screens/Settings-Screens/VerifyNumberScreen";
import VerifyEmailScreen from "../screens/Settings-Screens/VerifyEmailScreen";
import NumberChangedScreen from "../screens/Settings-Screens/NumberChangedScreen";
import EmailUpdatedScreen from "../screens/Settings-Screens/EmailUpdatedScreen";
import AddMoneyScreen from "../screens/Points/AddMoneyScreen";
import SendMoneyScreen from "../screens/Points/SendMoneyScreen";
import DepositScreen from "../screens/Points/DepositeScreen";
import TransactionDetailsScreen from "../screens/Points/TransactionDetailsScreen";
import EnterAmountScreen from "../screens/Points/EnterAmountScreen";
import SwapSuccessScreen from "../screens/Points/SwapSuccessScreen";
import CryptoFundingScreen from "../screens/Points/CryptoFundingScreen";
import SendCryptoScreen from "../screens/Points/SendCryptoScreen";
import FundWalletScreen from "../screens/FundWalletScreen";
import CreateVirtualAccountScreen from "../screens/CreateVirtualAccountScreen";
import PersonnalInformation from "../screens/_components/PersonalInformation";
import JobInformation from "../screens/_components/JobInformation";
import EmergencyContacts from "../screens/_components/EmergencyContacts";
import UploadIDCard from "../screens/_components/UploadIDCard";
import SelfieWithID from "../screens/_components/SelfieWithID";
import LoanUnderReview from "../screens/_components/LoanUnderReview";
import LoanApproved from "../screens/_components/LoanApproved";
import LoanUnsuccessful from "../screens/_components/LoadUnsuccessful";
import ReferralScreen from "../screens/Ref/ReferralScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import TransactionItem from "../screens/Trans/TransactionItem";
import ReceiptScreen from "../screens/Trans/ReceiptScreen";
import SubscriptionsScreen from "../screens/Sub/SubscriptionsScreen";
import ChatBotScreen from "../screens/ChatBotScreen";
import AddProductScreen from "../screens/AddProductScreen";
import CategoriesScreen from "../screens/CategoriesScreen";
import Checkout from "../screens/components/Checkout";
import OrderSuccess from "../screens/components/OrderSuccess";
import ShoppingCartScreen from "../screens/components/ShoppingCart";
import HomeCategoriesSeeall from "../screens/components/HomeCategoriesSeeall";
import CustomerSupport from "../screens/CustomerSupport";
import AgricNovaAI from "../screens/AgricNovaAI";

// Withdraw Screens
import WithdrawScreen from "../screens/withdraw/WithdrawScreen";
import ConfirmWithdrawScreen from "../screens/withdraw/ConfirmWithdrawScreen";
import WithdrawPinScreen from "../screens/withdraw/WithdrawPinScreen";
import WithdrawReviewScreen from "../screens/withdraw/WithdrawReviewScreen";
import WithdrawSuccessScreen from "../screens/withdraw/WithdrawSuccessScreen";
import SetTransactionPinScreen from "../screens/settings/SetTransactionPinScreen";

// Tab Navigators
import MainTabNavigator from "../components/MainTabNavigator";
import FarmerTabNavigator from "../components/FarmerTabNavigator";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="AuthLoading"
      screenOptions={{ headerShown: false }}
    >
      {/* Auth & Onboarding */}
      <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={CreateAccountScreen} />
      <Stack.Screen name="Email" component={ConfirmEmailScreen} />
      <Stack.Screen name="Fbpass" component={ForgotPasswordScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
      <Stack.Screen name="ConfirmOTP" component={ConfirmOTP} />
      <Stack.Screen name="ConfirmOTPForgotPassword" component={ConfirmOTPForgotPassword} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />

      {/* Products & Shopping */}
      <Stack.Screen name="ProductDetails" component={ProductDetails} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="HomeCategoriesSeeall" component={HomeCategoriesSeeall} />
      <Stack.Screen name="ShoppingCart" component={ShoppingCartScreen} />
      <Stack.Screen name="Checkout" component={Checkout} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccess} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} />

      {/* Wallet & Points */}
      <Stack.Screen name="FundWallet" component={FundWalletScreen} />
      <Stack.Screen name="AddMoney" component={AddMoneyScreen} />
      <Stack.Screen name="SendMoneyScreen" component={SendMoneyScreen} />
      <Stack.Screen name="EnterAmountScreen" component={EnterAmountScreen} />
      <Stack.Screen name="SwapSuccessScreen" component={SwapSuccessScreen} />
      <Stack.Screen name="CryptoFundingScreen" component={CryptoFundingScreen} />
      <Stack.Screen name="DepositScreen" component={DepositScreen} />
      <Stack.Screen name="TransactionDetailsScreen" component={TransactionDetailsScreen} />
      <Stack.Screen name="SendCryptoScreen" component={SendCryptoScreen} />
      <Stack.Screen name="CreateVirtualAccount" component={CreateVirtualAccountScreen} />

      {/* Withdraw Flow */}
      <Stack.Screen name="Withdraw" component={WithdrawScreen} />
      <Stack.Screen name="ConfirmWithdraw" component={ConfirmWithdrawScreen} />
      <Stack.Screen name="WithdrawPin" component={WithdrawPinScreen} />
      <Stack.Screen name="WithdrawReview" component={WithdrawReviewScreen} />
      <Stack.Screen name="SetTransactionPin" component={SetTransactionPinScreen} />
      <Stack.Screen name="WithdrawSuccess" component={WithdrawSuccessScreen} />

      {/* Profile & Settings */}
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="DeliveryPreferences" component={DeliveryPreferencesScreen} />
      <Stack.Screen name="SettingsSecurity" component={SettingsSecurityScreen} />
      <Stack.Screen name="AddressBook" component={AddressBookScreen} />
      <Stack.Screen name="VerifyNumber" component={VerifyNumberScreen} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      <Stack.Screen name="NumberChanged" component={NumberChangedScreen} />
      <Stack.Screen name="EmailUpdated" component={EmailUpdatedScreen} />

      {/* Profile Sub-components */}
      <Stack.Screen name="PersonnalInformation" component={PersonnalInformation} />
      <Stack.Screen name="JobInformation" component={JobInformation} />
      <Stack.Screen name="EmergencyContacts" component={EmergencyContacts} />
      <Stack.Screen name="UploadIDCard" component={UploadIDCard} />
      <Stack.Screen name="SelfieWithID" component={SelfieWithID} />

      {/* Loans */}
      <Stack.Screen name="LoanUnderReview" component={LoanUnderReview} />
      <Stack.Screen name="LoanApproved" component={LoanApproved} />
      <Stack.Screen name="LoanUnsuccessful" component={LoanUnsuccessful} />

      {/* Referrals, Notifications & Chat */}
      <Stack.Screen name="ReferralScreen" component={ReferralScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="ChatBot" component={ChatBotScreen} />

      {/* Transactions */}
      <Stack.Screen name="TransactionItem" component={TransactionItem} />
      <Stack.Screen name="ReceiptScreen" component={ReceiptScreen} />

      {/* Subscriptions */}
      <Stack.Screen name="Subscriptions" component={SubscriptionsScreen} />

      {/* Tab Navigators */}
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="FarmerTabs" component={FarmerTabNavigator} />

      {/* Support */}
      <Stack.Screen name="CustomerSupport" component={CustomerSupport} />
      <Stack.Screen name="AgricNovaAI" component={AgricNovaAI} />
    </Stack.Navigator>
  );
}
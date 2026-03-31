import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// ─── Auth Decision Screen ─────────────────────────────────────────────────────
// Checks token/session on app launch and routes to Auth or Main
import AuthLoadingScreen from "../screens/AuthLoadingScreen";

// ─── Auth Flow (Login, Register, Forgot Password, Onboarding) ────────────────
// All unauthenticated screens are isolated in their own navigator
import AuthNavigator from "./AuthNavigator";

// ─── Tab Navigators (Role-based entry points after login) ────────────────────
import MainTabNavigator from "../components/MainTabNavigator";     // Customer
import FarmerTabNavigator from "../components/FarmerTabNavigator"; // Farmer
import VendorTabNavigator from "../components/VendorTabNavigator"; // Vendor
import AdminNavigator from "./AdminNavigator";                     // Admin

// ─── Commerce: Product Browsing ───────────────────────────────────────────────
import MarketplaceScreen from "../screens/commerce/marketplace/MarketplaceScreen";       // Main marketplace listing
import SearchScreen from "../screens/commerce/search/SearchScreen";                      // Search products
import CategoriesScreen from "../screens/CategoriesScreen";                              // Browse by category
import HomeCategoriesSeeall from "../screens/components/HomeCategoriesSeeall";           // Category expanded view
import ProductDetails from "../screens/commerce/product/ProductDetailScreen";            // Product detail page
import ProductImageGalleryScreen from "../screens/commerce/product/ProductImageGalleryScreen"; // Full-screen image viewer
import VendorStoreScreen from "../screens/commerce/vendor/VendorStoreScreen";            // Vendor's public storefront
import AddProductScreen from "../screens/AddProductScreen";                              // Vendor: add a new product

// ─── Commerce: Cart & Checkout ────────────────────────────────────────────────
import CartScreen from "../screens/commerce/cart/CartScreen";      // Shopping cart (replaces old AddToCartScreen)
import Checkout from "../screens/components/Checkout";             // Checkout summary & payment trigger
import OrderSuccess from "../screens/components/OrderSuccess";     // Post-checkout success screen

// ─── Commerce: Orders ────────────────────────────────────────────────────────
import OrdersScreen from "../screens/commerce/orders/OrdersScreen";                       // List of all orders
import OrderDetailScreen from "../screens/commerce/orders/OrderDetailScreen";             // Single order details
import OrderTrackingScreen from "../screens/commerce/orders/OrderTrackingScreen";         // Live order tracking
import DeliveryConfirmationScreen from "../screens/commerce/orders/DeliveryConfirmationScreen"; // Confirm delivery received
import OrderCancelRefundScreen from "../screens/commerce/orders/OrderCancelRefundScreen"; // Cancel / refund request

// ─── Commerce: Wishlist ───────────────────────────────────────────────────────
import WishlistScreen from "../screens/commerce/wishlist/WishlistScreen"; // Saved/favourited products

// ─── Commerce: Address Management ────────────────────────────────────────────
import AddressListScreen from "../screens/commerce/address/AddressListScreen";     // All saved addresses
import AddEditAddressScreen from "../screens/commerce/address/AddEditAddressScreen"; // Add or edit an address

// ─── Commerce: Payment Methods ───────────────────────────────────────────────
import PaymentMethodsScreen from "../screens/commerce/payment/PaymentMethodsScreen";           // Saved payment methods
import AddEditPaymentMethodScreen from "../screens/commerce/payment/AddEditPaymentMethodScreen"; // Add or edit payment method

// ─── Commerce: Reviews & Disputes ────────────────────────────────────────────
import MyReviewsScreen from "../screens/commerce/reviews/MyReviewsScreen";       // User's submitted reviews
import DisputeDetailScreen from "../screens/commerce/disputes/DisputeDetailScreen"; // Single dispute detail
import TermsPoliciesScreen from "../screens/commerce/user/TermsPoliciesScreen";   // Terms & return policies

// ─── Commerce Hub ─────────────────────────────────────────────────────────────
import CommerceNavigatorHub from "../screens/commerce/CommerceNavigatorHub"; // Central commerce router

// ─── Wallet & Points ──────────────────────────────────────────────────────────
import FundWalletScreen from "../screens/FundWalletScreen";                                  // Fund wallet entry
import CreateVirtualAccountScreen from "../screens/CreateVirtualAccountScreen";              // Generate virtual bank account
import AddMoneyScreen from "../screens/Points/AddMoneyScreen";                              // Add money to wallet
import SendMoneyScreen from "../screens/Points/SendMoneyScreen";                            // Send money to another user
import EnterAmountScreen from "../screens/Points/EnterAmountScreen";                        // Amount input step
import SwapSuccessScreen from "../screens/Points/SwapSuccessScreen";                        // Swap confirmation
import CryptoFundingScreen from "../screens/Points/CryptoFundingScreen";                    // Fund via crypto
import DepositScreen from "../screens/Points/DepositeScreen";                               // Deposit flow
import TransactionDetailsScreen from "../screens/Points/TransactionDetailsScreen";          // Single transaction detail
import SendCryptoScreen from "../screens/Points/SendCryptoScreen";                          // Send crypto to external address

// ─── Withdraw Flow ────────────────────────────────────────────────────────────
import WithdrawScreen from "../screens/withdraw/WithdrawScreen";               // Withdraw entry screen
import WithdrawPinScreen from "../screens/withdraw/WithdrawPinScreen";         // PIN confirmation for withdrawal
import WithdrawReviewScreen from "../screens/withdraw/WithdrawReviewScreen";   // Review before finalising
import WithdrawSuccessScreen from "../screens/withdraw/WithdrawSuccessScreen"; // Withdrawal success

// ─── Transfer Flow ────────────────────────────────────────────────────────────
import TransferScreen from "../screens/transfer/TransferScreen";               // Transfer entry screen
import TransferReviewScreen from "../screens/transfer/TransferReviewScreen";   // Review transfer details
import TransferPinScreen from "../screens/transfer/TransferPinScreen";         // PIN confirmation for transfer
import TransferSuccessScreen from "../screens/transfer/TransferSuccessScreen"; // Transfer success

// ─── Transactions ─────────────────────────────────────────────────────────────

import ReceiptScreen from "../screens/Trans/ReceiptScreen";     // Printable/shareable receipt

// ─── Vendor Transactions 
import VendorTransactionScreen from "../screens/vendor/VendorTransactionScreen";
import VendorFundWalletScreen from "../screens/vendor/VendorFundWalletScreen";                                  // Fund wallet entry
import VendorCreateVirtualAccountScreen from "../screens/vendor/VendorCreateVirtualAccountScreen";

// ─── Profile & Settings ───────────────────────────────────────────────────────
import ProfileScreen from "../screens/ProfileScreen";                                              // User public profile
import Settings from "../screens/Settings-Screens/Settings";                                      // Settings home
import PersonalInfoScreen from "../screens/Settings-Screens/PersonalInfoScreen";                  // View personal info
import EditProfileScreen from "../screens/Settings-Screens/EditProfileScreen";                    // Edit profile details
import DeliveryPreferencesScreen from "../screens/Settings-Screens/DeliveryPreferencesScreen";    // Delivery address preferences
import SettingsSecurityScreen from "../screens/Settings-Screens/SettingsSecurityScreen";          // Password & security
import AddressBookScreen from "../screens/Settings-Screens/AddressBookScreen";                    // Saved addresses (settings)
import VerifyNumberScreen from "../screens/Settings-Screens/VerifyNumberScreen";                  // Phone number verification
import VerifyEmailScreen from "../screens/Settings-Screens/VerifyEmailScreen";                    // Email verification
import NumberChangedScreen from "../screens/Settings-Screens/NumberChangedScreen";                // Phone number updated confirmation
import EmailUpdatedScreen from "../screens/Settings-Screens/EmailUpdatedScreen";                  // Email updated confirmation
import SetTransactionPinScreen from "../screens/settings/SetTransactionPinScreen";                // Set a new transaction PIN
import ChangePinScreen from "../screens/settings/ChangePinScreen";                                // Change existing PIN

// ─── Profile Sub-components (KYC / Loan Application steps) ───────────────────
import PersonnalInformation from "../screens/_components/PersonalInformation"; // KYC: personal details
import JobInformation from "../screens/_components/JobInformation";            // KYC: employment details
import EmergencyContacts from "../screens/_components/EmergencyContacts";      // KYC: emergency contact
import UploadIDCard from "../screens/_components/UploadIDCard";                // KYC: ID card upload
import SelfieWithID from "../screens/_components/SelfieWithID";               // KYC: selfie verification

// ─── Loans ────────────────────────────────────────────────────────────────────
import LoanUnderReview from "../screens/_components/LoanUnderReview";   // Loan application pending
import LoanApproved from "../screens/_components/LoanApproved";         // Loan approved screen
import LoanUnsuccessful from "../screens/_components/LoadUnsuccessful"; // Loan rejected screen

// ─── Referrals ────────────────────────────────────────────────────────────────
import ReferralScreen from "../screens/Ref/ReferralScreen"; // Referral code & rewards

// ─── Subscriptions ────────────────────────────────────────────────────────────
import SubscriptionsScreen from "../screens/Sub/SubscriptionsScreen"; // Subscription plans

// ─── Notifications & Chat ─────────────────────────────────────────────────────
import NotificationsScreen from "../screens/NotificationsScreen"; // In-app notifications
import ChatBotScreen from "../screens/ChatBotScreen";             // AI chatbot interface

// ─── Support & AI ────────────────────────────────────────────────────────────
import CustomerSupport from "../screens/CustomerSupport"; // Human support / help centre
import AgricNovaAI from "../screens/AgricNovaAI";         // AgricNova AI assistant

// ─────────────────────────────────────────────────────────────────────────────

const Stack = createNativeStackNavigator();

/**
 * AppNavigator
 * Root navigator for the entire application.
 *
 * Flow:
 *   AuthLoading → checks token/role →
 *     unauthenticated  → AuthNavigator (Login / Register / Forgot Password)
 *     customer         → MainTabs
 *     farmer           → FarmerTabs
 *     vendor           → VendorTabs
 *     admin            → Admin
 *
 * All modal-style screens (product detail, checkout, wallet, etc.)
 * are registered here so they can be pushed from any tab.
 */
export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="AuthLoading"
      screenOptions={{ headerShown: false }}
    >

      {/* ── Auth Gate ───────────────────────────────────────────────────── */}
      {/* Reads stored token on launch and redirects to the right navigator */}
      <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />

      {/* ── Auth Flow ───────────────────────────────────────────────────── */}
      {/* All login / register / forgot-password screens live here */}
      <Stack.Screen name="Auth" component={AuthNavigator} />

      {/* ── Role-based Tab Navigators ───────────────────────────────────── */}
      <Stack.Screen name="MainTabs"    component={MainTabNavigator} />
      <Stack.Screen name="FarmerTabs"  component={FarmerTabNavigator} />
      <Stack.Screen name="VendorTabs"  component={VendorTabNavigator} />
      <Stack.Screen name="Admin"       component={AdminNavigator} />

      {/* ── Commerce: Product Browsing ──────────────────────────────────── */}
      <Stack.Screen name="Marketplace"           component={MarketplaceScreen} />
      <Stack.Screen name="SearchProducts"        component={SearchScreen} />
      <Stack.Screen name="Categories"            component={CategoriesScreen} />
      <Stack.Screen name="HomeCategoriesSeeall"  component={HomeCategoriesSeeall} />
      <Stack.Screen name="ProductDetails"        component={ProductDetails} />
      <Stack.Screen name="ProductImageGallery"   component={ProductImageGalleryScreen} />
      <Stack.Screen name="VendorStore"           component={VendorStoreScreen} />
      <Stack.Screen name="AddProduct"            component={AddProductScreen} />

      {/* ── Commerce: Cart & Checkout ───────────────────────────────────── */}
      <Stack.Screen name="ShoppingCart"  component={CartScreen} />
      <Stack.Screen name="Checkout"      component={Checkout} />
      <Stack.Screen name="OrderSuccess"  component={OrderSuccess} />

      {/* ── Commerce: Orders ────────────────────────────────────────────── */}
      <Stack.Screen name="Orders"               component={OrdersScreen} />
      <Stack.Screen name="OrderDetail"          component={OrderDetailScreen} />
      <Stack.Screen name="OrderTracking"        component={OrderTrackingScreen} />
      <Stack.Screen name="DeliveryConfirmation" component={DeliveryConfirmationScreen} />
      <Stack.Screen name="OrderCancelRefund"    component={OrderCancelRefundScreen} />

      {/* ── Commerce: Wishlist ──────────────────────────────────────────── */}
      <Stack.Screen name="Wishlist" component={WishlistScreen} />

      {/* ── Commerce: Address Management ────────────────────────────────── */}
      <Stack.Screen name="AddressList"    component={AddressListScreen} />
      <Stack.Screen name="AddEditAddress" component={AddEditAddressScreen} />

      {/* ── Commerce: Payment Methods ───────────────────────────────────── */}
      <Stack.Screen name="PaymentMethods"        component={PaymentMethodsScreen} />
      <Stack.Screen name="AddEditPaymentMethod"  component={AddEditPaymentMethodScreen} />

      {/* ── Commerce: Reviews, Disputes & Policies ──────────────────────── */}
      <Stack.Screen name="MyReviews"     component={MyReviewsScreen} />
      <Stack.Screen name="DisputeDetail" component={DisputeDetailScreen} />
      <Stack.Screen name="TermsPolicies" component={TermsPoliciesScreen} />

      {/* ── Commerce Hub ────────────────────────────────────────────────── */}
      <Stack.Screen name="CommerceHub" component={CommerceNavigatorHub} />

      {/* ── Wallet & Points ─────────────────────────────────────────────── */}
      <Stack.Screen name="FundWallet"              component={FundWalletScreen} />
      <Stack.Screen name="CreateVirtualAccount"    component={CreateVirtualAccountScreen} />
      <Stack.Screen name="AddMoney"                component={AddMoneyScreen} />
      <Stack.Screen name="SendMoneyScreen"         component={SendMoneyScreen} />
      <Stack.Screen name="EnterAmountScreen"       component={EnterAmountScreen} />
      <Stack.Screen name="SwapSuccessScreen"       component={SwapSuccessScreen} />
      <Stack.Screen name="CryptoFundingScreen"     component={CryptoFundingScreen} />
      <Stack.Screen name="DepositScreen"           component={DepositScreen} />
      <Stack.Screen name="TransactionDetailsScreen" component={TransactionDetailsScreen} />
      <Stack.Screen name="SendCryptoScreen"        component={SendCryptoScreen} />

      {/* ── Withdraw Flow ───────────────────────────────────────────────── */}
      <Stack.Screen name="Withdraw"        component={WithdrawScreen} />
      <Stack.Screen name="WithdrawPin"     component={WithdrawPinScreen} />
      <Stack.Screen name="WithdrawReview"  component={WithdrawReviewScreen} />
      <Stack.Screen name="WithdrawSuccess" component={WithdrawSuccessScreen} />

      {/* ── Transfer Flow ───────────────────────────────────────────────── */}
      <Stack.Screen name="Transfer"        component={TransferScreen} />
      <Stack.Screen name="TransferReview"  component={TransferReviewScreen} />
      <Stack.Screen name="TransferPin"     component={TransferPinScreen} />
      <Stack.Screen name="TransferSuccess" component={TransferSuccessScreen} />

      {/* ── Transactions ────────────────────────────────────────────────── */}
      <Stack.Screen name="ReceiptScreen"   component={ReceiptScreen} />
      <Stack.Screen name="VendorTransactionScreen" component={VendorTransactionScreen} />
      <Stack.Screen name="VendorFundWalletScreen" component={VendorFundWalletScreen} />
      <Stack.Screen name="VendorCreateVirtualAccountScreen" component={VendorCreateVirtualAccountScreen} />

      {/* ── Profile & Settings ──────────────────────────────────────────── */}
      <Stack.Screen name="Profile"               component={ProfileScreen} />
      <Stack.Screen name="Settings"              component={Settings} />
      <Stack.Screen name="PersonalInfo"          component={PersonalInfoScreen} />
      <Stack.Screen name="EditProfile"           component={EditProfileScreen} />
      <Stack.Screen name="DeliveryPreferences"   component={DeliveryPreferencesScreen} />
      <Stack.Screen name="SettingsSecurity"      component={SettingsSecurityScreen} />
      <Stack.Screen name="AddressBook"           component={AddressBookScreen} />
      <Stack.Screen name="VerifyNumber"          component={VerifyNumberScreen} />
      <Stack.Screen name="VerifyEmail"           component={VerifyEmailScreen} />
      <Stack.Screen name="NumberChanged"         component={NumberChangedScreen} />
      <Stack.Screen name="EmailUpdated"          component={EmailUpdatedScreen} />
      <Stack.Screen name="SetTransactionPin"     component={SetTransactionPinScreen} />
      <Stack.Screen name="ChangePinScreen"       component={ChangePinScreen} />

      {/* ── KYC / Profile Sub-components ────────────────────────────────── */}
      <Stack.Screen name="PersonnalInformation" component={PersonnalInformation} />
      <Stack.Screen name="JobInformation"       component={JobInformation} />
      <Stack.Screen name="EmergencyContacts"    component={EmergencyContacts} />
      <Stack.Screen name="UploadIDCard"         component={UploadIDCard} />
      <Stack.Screen name="SelfieWithID"         component={SelfieWithID} />

      {/* ── Loans ───────────────────────────────────────────────────────── */}
      <Stack.Screen name="LoanUnderReview"  component={LoanUnderReview} />
      <Stack.Screen name="LoanApproved"     component={LoanApproved} />
      <Stack.Screen name="LoanUnsuccessful" component={LoanUnsuccessful} />

      {/* ── Referrals ───────────────────────────────────────────────────── */}
      <Stack.Screen name="ReferralScreen" component={ReferralScreen} />

      {/* ── Subscriptions ───────────────────────────────────────────────── */}
      <Stack.Screen name="Subscriptions" component={SubscriptionsScreen} />

      {/* ── Notifications & Chat ────────────────────────────────────────── */}
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="ChatBot"       component={ChatBotScreen} />

      {/* ── Support & AI ────────────────────────────────────────────────── */}
      <Stack.Screen name="CustomerSupport" component={CustomerSupport} />
      <Stack.Screen name="AgricNovaAI"     component={AgricNovaAI} />

    </Stack.Navigator>
  );
}
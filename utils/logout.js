// import AsyncStorage from '@react-native-async-storage/async-storage';

// const BASE_URL = "https://preciousadedokun.com.ng/jek";

// export const handleLogout = async (navigation, user = null, routeName = 'AuthLoading') => {
//   try {
//     // Update online status if user is available
//     if (user && user.id) {
//       await fetch(`${BASE_URL}/users/update-online-status.php`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           user_id: user.id,
//           is_online: false,
//         }),
//       });
//     }

//     // Clear stored data
//     await AsyncStorage.multiRemove(['auth_token', 'user']);

//     // Navigate to the specified screen
//     navigation.reset({
//       index: 0,
//       routes: [{ name: routeName }],
//     });
//   } catch (err) {
//     console.error("Logout error:", err);
//     throw err; // Re-throw to handle in calling component
//   }
// };
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = "https://jekfarms.com.ng";

/**
 * Safely logs out the user and navigates to LoginScreen
 * @param {object} navigation - React Navigation prop
 * @param {object|null} user - optional user object containing user.id
 * @param {string} loginRoute - name of the login screen (default: 'Login')
 */
export const handleLogout = async (navigation, user = null, loginRoute = 'AuthLoading') => {
  try {
    console.log("Logging out user...");
    
    // 1. Update online status if user exists
    if (user?.id) {
      try {
        console.log("Updating online status to offline...");
        await fetch(`${BASE_URL}/users/update-online-status.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            user_id: user.id, 
            is_online: false 
          }),
        });
        console.log("Online status updated successfully");
      } catch (apiError) {
        console.error("Error updating online status:", apiError);
        // Continue with logout even if this fails
      }
    }

    // 2. Clear ALL authentication data from AsyncStorage
    console.log("Clearing all authentication data...");
    const keysToRemove = [
      'auth_token',
      'token',
      'user',
      'userData',
      'user_info',
      'auth_user',
      'session_cookie',
      'user_dedicated_account_*' // Pattern for dedicated accounts
    ];
    
    // Get all keys and filter for dedicated accounts
    const allKeys = await AsyncStorage.getAllKeys();
    const dedicatedAccountKeys = allKeys.filter(key => 
      key.startsWith('user_dedicated_account_')
    );
    
    // Combine all keys to remove
    const allKeysToRemove = [
      'auth_token',
      'token',
      'user',
      'userData',
      'user_info',
      'auth_user',
      'session_cookie',
      ...dedicatedAccountKeys
    ];
    
    console.log("Removing keys:", allKeysToRemove);
    await AsyncStorage.multiRemove(allKeysToRemove);
    
    // 3. Verify storage is cleared
    const remainingKeys = await AsyncStorage.getAllKeys();
    const authKeys = remainingKeys.filter(key => 
      key.includes('user') || 
      key.includes('token') || 
      key.includes('auth') || 
      key.includes('session')
    );
    
    if (authKeys.length > 0) {
      console.warn("Some auth keys remain:", authKeys);
      // Try to clear them individually
      for (const key of authKeys) {
        await AsyncStorage.removeItem(key);
      }
    }
    
    console.log("Storage cleared successfully");
    
    // 4. Navigate to login screen
    console.log("Navigating to:", loginRoute);
    
    // Use reset for clean navigation - clears navigation history
    navigation.reset({
      index: 0,
      routes: [{ name: loginRoute }],
    });
    
  } catch (err) {
    console.error('Logout error:', err);
    
    // Even if there's an error, try to navigate to login
    try {
      navigation.reset({
        index: 0,
        routes: [{ name: 'AuthLoading' }],
      });
    } catch (navError) {
      console.error('Navigation error:', navError);
    }
    
    throw err; // Re-throw to handle in calling component
  }
};
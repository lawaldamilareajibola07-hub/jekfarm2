// useBalance.js
import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useBalance = () => {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
  const syncInterval = setInterval(() => {
    refreshBalance(false);
  }, 120000); // 2 minutes
  
  return () => clearInterval(syncInterval);
}, [refreshBalance]);

  const updateBalance = useCallback(async (change = 0, type = 'set') => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) return;
      
      const user = JSON.parse(userData);
      let newBalance;
      
      if (type === 'add') {
        newBalance = (user.balance || 0) + change;
      } else if (type === 'subtract') {
        newBalance = (user.balance || 0) - change;
      } else {
        newBalance = change; // Direct set
      }
      
      // Update state
      setBalance(newBalance);
      
      // Update AsyncStorage
      const updatedUser = {
        ...user,
        balance: newBalance,
        wallet_balance: newBalance
      };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      return newBalance;
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  }, []);

  const refreshBalance = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) return;
      
      const user = JSON.parse(userData);
      
      const response = await fetch('https://jekfarms.com.ng/data/user/get-balance.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      
      const result = await response.json();
      if (result.status === 'success') {
        const serverBalance = result.balance || result.wallet_balance || 0;
        await updateBalance(serverBalance, 'set');
        return serverBalance;
      }
    } catch (error) {
      console.error('Error refreshing balance:', error);
    }
  }, [updateBalance]);

  return { balance, updateBalance, refreshBalance };

  
};
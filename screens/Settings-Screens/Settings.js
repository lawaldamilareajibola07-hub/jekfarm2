import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Section from './components/Section';
import { handleLogout } from '../../utils/logout';

const Settings = ({ navigation }) => {
  const [user, setUser] = useState(null); // hold user info

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Get user from AsyncStorage
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          console.log('No user found in storage');
        }
      } catch (err) {
        console.error('Error loading user:', err);
      }
    };

    loadUser();
  }, []);

  const handleLogoutPress = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await handleLogout(navigation, user, 'Login');
            } catch (err) {
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.name}>{user ? user.name : 'Loading...'}</Text>
          <Text style={styles.email}>{user ? user.email : ''}</Text>
        </View>

        <Image 
          source={{ uri: user ? user.avatar || 'https://img.icons8.com/color/48/user-male-circle.png' : 'https://img.icons8.com/color/48/user-male-circle.png' }} 
          style={styles.avatar} 
        />
      </View>

      <Section title="Account" items={[
        { label: 'Personal Information', onPress: () => navigation.navigate('PersonalInfoScreen') },
        { label: 'Security & Settings', onPress: () => navigation.navigate('SettingsSecurity') },
        { label: 'Wallet/Token' },
        { label: 'Orders & Activities' },
        { label: 'Loans & Finance' },
        { label: 'Notifications' },
      ]} />

      <Section title="General" items={[
        { label: 'Invite Friends' },
        { label: 'Support' },
        { label: 'FAQ' },
        { label: 'About Us' },
        { label: 'Logout', onPress: handleLogoutPress }
      ]} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eee',
  },
  header: {
    backgroundColor: '#00C853',
    height: 200,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 6,
    marginRight: 10,
  },
  backText: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
  },
  headerText: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    color: 'white',
    marginTop: 4,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});

export default Settings;

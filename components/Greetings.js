import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Profile from "../assets/farm1.png";
import SettingsIcon from "../assets/settings.png";

const Greetings = () => {
  const [greeting, setGreeting] = useState("");
  const [userName, setUserName] = useState("Guest");
  const [address, setAddress] = useState("Loading address...");
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();

  useEffect(() => {
    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    // Load user and address safely
    const loadUserAndAddress = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (!storedUser) {
          setUserName("Guest");
          setAddress("No address available");
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        const userId = parsedUser.id;
        setUserName(parsedUser.name || "Guest");

        if (!userId) {
          setAddress("No address available");
          setLoading(false);
          return;
        }

        // First try to read cached address from AsyncStorage (written by AddressBookScreen)
        const cached = await AsyncStorage.getItem("user_address");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            const formatted = `${parsed.address || ""}, ${parsed.city || ""}, ${parsed.state || ""
              }`;
            setAddress(formatted);
            setLoading(false);
            return;
          } catch (e) {
            console.warn("Failed to parse cached address:", e);
          }
        }

        // Fallback: fetch addresses for this user from API
        const res = await fetch(
          `https://jekfarms.com.ng/addresses/list.php?user_id=${userId}`
        );

        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const data = await res.json();
        console.log("API response:", data); // debug

        if (
          data.status === "success"
          // && Array.isArray(data.data) 
          // && data.data.length > 0
        ) {
          const userAddress = data.addresses; // take the first address
          const formattedAddress = `${userAddress.address || "Unknown Address"}, ${userAddress.city || "Unknown State"
            }, ${userAddress.state || ""}`;
          setAddress(formattedAddress);
        } else {
          setAddress(data.message || "Failed to load address");
        }
      } catch (err) {
        console.error("Failed to fetch addresses:", err);
        setAddress("Failed to load address");
      } finally {
        setLoading(false);
      }
    };

    loadUserAndAddress();
    // Re-run when screen comes into focus so greeting refreshes after address changes
    const unsubscribe = navigation.addListener("focus", loadUserAndAddress);

    return () => {
      unsubscribe && unsubscribe();
    };
  }, []);

  const handleSettingsPress = () => {
    navigation.navigate("Settings");
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image source={Profile} style={styles.profileImage} />
        <View style={styles.textContainer}>
          <Text style={styles.greetingText}>{greeting},</Text>
          <Text style={styles.greetingTextp}>{userName}</Text>
          <Text style={styles.locationText}>
            {loading ? (
              <ActivityIndicator size="small" color="#38a169" />
            ) : (
              address
            )}
          </Text>
        </View>
      </View>

      <TouchableOpacity onPress={handleSettingsPress}>
        <Image source={SettingsIcon} style={styles.settingsIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    marginTop: 60, 
    marginHorizontal:6,// Increased to 60 to guarantee status bar clearance
    borderRadius: 8,
    elevation: 2,
  },
  content: { flexDirection: "row", alignItems: "center" },
  profileImage: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  textContainer: { flexDirection: "column" },
  greetingText: { fontSize: 18, fontWeight: "bold", color: "#4a5568", fontFamily: 'Inter_400Regular' },
  greetingTextp: { fontSize: 12, color: "#817d7d", fontFamily: 'Inter_400Regular' },
  locationText: { fontSize: 14, color: "#38a169" },
  settingsIcon: { width: 28, height: 28 },
});

export default Greetings;

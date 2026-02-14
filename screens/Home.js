import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
  Image,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

import Categories from "../components/Categories";
import HomeCategories from "./components/HomeCategories";
import DiscountedItems from "../components/DiscountedItems";
import HomeSliderBanner from "./components/HomeSliderBanner";
import KYCBanner from "../components/KYCBanner";


const BASE_URL = "https://jekfarms.com.ng";

export default function Home({ navigation, route }) {
  const { addToCart } = route.params || {};

  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("natural");
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Vegetables");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const toggleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    const storedUser = await AsyncStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${BASE_URL}/data/products.php`);
      const data = await res.json();
      if (data.status === "success") {
        setProducts(data.products || data.data);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleSlide = (tab) => {
    setActiveTab(tab);
    Animated.spring(toggleAnim, {
      toValue: tab === "natural" ? 0 : 1,
      useNativeDriver: false,
    }).start();
  };

  const translateX = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 168],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#F9FAFB", "#FFFFFF"]}
          style={styles.gradientHeader}
        >
          <Animated.View
            style={[
              styles.headerShadow,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.headerRow}>
              <View style={styles.leftSection}>
                <View style={styles.profileCircle}>
                  <Image
                    source={require("../assets/useravatar.png")}
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                </View>

                <View style={styles.textSection}>
                  <Text style={styles.goodMorning}>
                    Good Morning, 👋
                  </Text>
                  <Text style={styles.userName}>
                    {user?.name ||
                      "Rowland Emmanuel Ihezile"}
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.hexIcon}>
                <Image
                  source={require("../assets/settings.png")}
                  style={styles.settingsImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.addressRow}>
              <Text style={styles.address}>
                7 Adeyemi Street, off Bricfield RD
              </Text>
              <Ionicons
                name="chevron-down"
                size={14}
                color="#10B981"
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={18}
                color="#4c4d4d"
              />
              <Text style={styles.searchText}>
                Search something
              </Text>
            </TouchableOpacity>

            <View style={styles.segmentWrapper}>
              <Animated.View
                style={[
                  styles.segmentSlider,
                  { transform: [{ translateX }] },
                ]}
              />

              <TouchableOpacity
                style={styles.segmentBtn}
                onPress={() => toggleSlide("natural")}
              >
                <Text
                  style={[
                    styles.segmentText,
                    activeTab === "natural" &&
                      styles.activeSegmentText,
                  ]}
                >
                  Natural Foods
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.segmentBtn}
                onPress={() => toggleSlide("organic")}
              >
                <Text
                  style={[
                    styles.segmentText,
                    activeTab === "organic" &&
                      styles.activeSegmentText,
                  ]}
                >
                  Organic Foods
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </LinearGradient>

        <HomeCategories
  activeCategory={activeCategory}
  setActiveCategory={setActiveCategory}
/>

<Categories
  navigation={navigation}
  addToCart={addToCart}
/>

<DiscountedItems addToCart={addToCart} />

<HomeSliderBanner />

        {user && (!user.has_bvn || !user.has_nin) && (
          <KYCBanner />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  gradientHeader: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
  },

  headerShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  leftSection: { flexDirection: "row" },

  profileCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },

  profileImage: {
    width: "100%",
    height: "100%",
  },

  textSection: { justifyContent: "center" },

  goodMorning: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
  },

  userName: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },

  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  address: {
    fontSize: 13,
    color: "#10B981",
  },

  hexIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },

  settingsImage: {
    width: 22,
    height: 22,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8e9eb",
    borderRadius: 28,
    paddingHorizontal: 18,
    height: 52,
    marginTop: 22,
  },

  searchText: {
    marginLeft: 10,
    color: "#9CA3AF",
    fontSize: 14,
  },

  segmentWrapper: {
    flexDirection: "row",
    backgroundColor: "#e8e9eb",
    borderRadius: 26,
    marginTop: 22,
    height: 48,
    padding: 4,
    position: "relative",
  },

  segmentSlider: {
    position: "absolute",
    width: 160,
    height: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    top: 4,
    left: 4,
  },

  segmentBtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  segmentText: {
    fontSize: 13,
    color: "#6B7280",
  },

  activeSegmentText: {
    color: "#10B981",
    fontWeight: "600",
  },
});
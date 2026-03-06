import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableNativeFeedback,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Animated,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const categories = [
  { id: 1, name: "Vegetables", count: "7 products", image: require("../../assets/image25.png"), bg: "#E8F5E9" },
  { id: 2, name: "Fruits", count: "15 products", image: require("../../assets/cart3.png"), bg: "#FDE68A" },
  { id: 3, name: "Chicken", count: "9 products", image: require("../../assets/subcart3.png"), bg: "#FDECEC" },
  { id: 4, name: "Beef", count: "16 products", image: require("../../assets/realbeef.png"), bg: "#FCE8E6" },
  { id: 5, name: "Protein", count: "12 products", image: require("../../assets/cart1.png"), bg: "#F3F4F6" },
  { id: 6, name: "Seafood", count: "7 products", image: require("../../assets/subcart2.png"), bg: "#FFEDEE" },
];

export default function HomeCategoriesSeeall() {
  const navigation = useNavigation();

  const animations = useRef(
    categories.map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(15),
    }))
  ).current;

  useEffect(() => {
    const entrance = animations.map((anim) =>
      Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.stagger(70, entrance).start();
  }, []);

  const handlePress = (item) => {
    navigation.navigate("Categories", { category: item.name });
  };

  const CardWrapper =
    Platform.OS === "android"
      ? TouchableNativeFeedback
      : TouchableOpacity;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <Ionicons
          name="arrow-back"
          size={22}
          color="#111827"
          onPress={() => navigation.goBack()}
        />

        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color="#9CA3AF" />
          <TextInput
            placeholder="Search category"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />
        </View>
      </View>

      <Text style={styles.title}>All categories</Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <View style={styles.grid}>
          {categories.map((item, index) => {
            const anim = animations[index];

            return (
              <View key={item.id} style={styles.cardOuter}>
                <CardWrapper
                  onPress={() => handlePress(item)}
                  {...(Platform.OS === "android"
                    ? {
                        background: TouchableNativeFeedback.Ripple(
                          "#E5E7EB",
                          false
                        ),
                      }
                    : { activeOpacity: 0.9 })}
                >
                  <Animated.View
                    style={[
                      styles.card,
                      {
                        opacity: anim.opacity,
                        transform: [{ translateY: anim.translateY }],
                      },
                    ]}
                  >
                    {/* LEFT TEXT */}
                    <View style={styles.textContainer}>
                      <Text style={styles.name}>{item.name}</Text>
                      <Text style={styles.count}>{item.count}</Text>
                    </View>

                    {/* RIGHT IMAGE BOX */}
                    <View
                      style={[
                        styles.imageBox,
                        { backgroundColor: item.bg },
                      ]}
                    >
                      <Image source={item.image} style={styles.image} />
                    </View>
                  </Animated.View>
                </CardWrapper>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 50,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 25,
    paddingHorizontal: 14,
    height: 40,
    marginLeft: 14,
    flex: 1,
  },

  input: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
    color: "#111827",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: "#111827",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  cardOuter: {
    width: "48%",
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
  },

  card: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 14,
    paddingVertical: 14,
  },

  textContainer: {
    flex: 1,
    justifyContent: "center",
  },

  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },

  count: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 3,
  },

  imageBox: {
    width: 64,
    height: 64,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  image: {
    width: 52,
    height: 52,
    resizeMode: "contain",
  },
});
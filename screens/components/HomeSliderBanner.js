import React, { useEffect, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
} from "react-native";

const { width } = Dimensions.get("window");

const banners = [
 require("../../assets/App-Banner.png"),
  require("../../assets/yellotomato2.png"),
];

export default function HomeSliderBanner() {
  const scrollRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  let currentIndex = 0;

  useEffect(() => {
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % banners.length;

      scrollRef.current?.scrollTo({
        x: currentIndex * width,
        animated: true,
      });
    }, 4000); // slide every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {banners.map((image, index) => (
          <View key={index} style={styles.bannerWrapper}>
            <Image
              source={image}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {banners.map((_, i) => {
          const opacity = scrollX.interpolate({
            inputRange: [
              width * (i - 1),
              width * i,
              width * (i + 1),
            ],
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={i}
              style={[styles.dot, { opacity }]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },

  bannerWrapper: {
    width: width,
    paddingHorizontal: 20,
  },

  bannerImage: {
    width: "100%",
    height: 160,
    borderRadius: 18,
  },

  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginHorizontal: 4,
  },
});
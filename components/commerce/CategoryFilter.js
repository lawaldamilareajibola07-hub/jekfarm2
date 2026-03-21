import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import Animated, {
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const categories = [
  "all",
  "grains",
  "vegetables",
  "fruits",
  "tubers",
  "livestock",
];

export default function CategoryFilter({ selected, onSelect }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
    >
      {categories.map((cat, index) => {
        const active = selected === cat || (cat === "all" && !selected);

        return (
          <Animated.View
            key={cat}
            entering={FadeInRight.delay(index * 80)}
          >
            <TouchableOpacity
              onPress={() => onSelect(cat === "all" ? null : cat)}
              style={[
                styles.category,
                active && styles.activeCategory,
              ]}
            >
              <Text
                style={[
                  styles.text,
                  active && styles.activeText,
                ]}
              >
                {cat.toUpperCase()}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },

  category: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f2f2f2",
    marginRight: 10,
  },

  activeCategory: {
    backgroundColor: "#1a8917",
  },

  text: {
    fontSize: 12,
    fontWeight: "600",
    color: "#444",
  },

  activeText: {
    color: "#fff",
  },
});
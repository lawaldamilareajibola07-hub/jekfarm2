import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, LayoutAnimation, Platform, UIManager } from "react-native";

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const SearchComponent = ({ onCategoryPress }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const slideAnim = useState(new Animated.Value(0))[0];

  const handlePress = (index) => {
    setActiveIndex(index);

    // Animate the indicator
    Animated.spring(slideAnim, {
      toValue: index,
      useNativeDriver: true,
      friction: 8,
      tension: 40
    }).start();

    if (onCategoryPress) {
      onCategoryPress(index === 0 ? "Natural Foods" : "Organic Foods");
    }
  };


  const innerWidth = containerWidth - 12;
  const tabWidth = innerWidth / 2;

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [6, tabWidth + 6] // Start at padding-left (6), move by one tab width
  });

  return (
    <View style={styles.container}>
      <View
        style={styles.buttonParent}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        {/* Animated Indicator */}
        <Animated.View
          style={[
            styles.activeIndicator,
            {
              width: tabWidth,
              transform: [{ translateX }]
            },
          ]}
        />

        {/* Buttons */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => handlePress(0)}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, activeIndex === 0 && styles.activeButtonText]}>
            Natural Foods
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => handlePress(1)}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, activeIndex === 1 && styles.activeButtonText]}>
            Organic Foods
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  buttonParent: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 35,
    height: 50,
    position: "relative",
    alignItems: 'center',
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    height: '100%',
  },
  buttonText: {
    color: "#6b7280",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    fontWeight: "500",
  },
  activeButtonText: {
    color: "#10b981",
    fontWeight: "700",
  },
  activeIndicator: {
    position: "absolute",
    height: 38, // Height of indicator (50 - 6*2 padding)
    backgroundColor: "#fff",
    borderRadius: 25,
    top: 6,
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default SearchComponent;

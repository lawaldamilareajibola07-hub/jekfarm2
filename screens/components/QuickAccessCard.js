import React from "react";
import { TouchableOpacity, View, Text, Image, StyleSheet } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

const QuickAccessCard = ({ item }) => {
  return (
    <Animated.View entering={FadeInUp.duration(500)}>
      <TouchableOpacity
        style={styles.card}
        onPress={item.action}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          {typeof item.icon === "string" ? (
            <Text style={styles.iconText}>{item.icon}</Text>
          ) : (
            <Image source={item.icon} style={styles.iconImage} />
          )}
        </View>
        <Text style={styles.title}>{item.title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 110,
    height: 130,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  iconImage: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
  iconText: {
    fontSize: 24,
  },
  title: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    color: "#111827",
  },
});

export default QuickAccessCard;
import React from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

const TypingIndicator = ({ users = [] }) => {
  if (users.length === 0) return null;

  const typingText =
    users.length === 1
      ? `${users[0].full_name} is typing...`
      : `${users.length} people are typing...`;

  return (
    <View style={styles.container}>
      <View style={styles.dotsContainer}>
        <Animated.View style={[styles.dot, styles.dot1]} />
        <Animated.View style={[styles.dot, styles.dot2]} />
        <Animated.View style={[styles.dot, styles.dot3]} />
      </View>
      <Text style={styles.text}>{typingText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  dotsContainer: {
    flexDirection: "row",
    marginRight: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
    marginHorizontal: 2,
  },
  text: {
    fontSize: 14,
    color: "gray",
    fontStyle: "italic",
  },
});

export default TypingIndicator;

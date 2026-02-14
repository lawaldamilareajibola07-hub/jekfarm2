import React, { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet, View } from "react-native";

const AddToast = ({ visible, message = "Added to cart", duration = 1400, onHide }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let hideTimeout;
    if (visible) {
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start(() => {
        hideTimeout = setTimeout(() => {
          Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
            if (onHide) onHide();
          });
        }, duration);
      });
    }

    return () => clearTimeout(hideTimeout);
  }, [visible, duration, opacity, onHide]);

  if (!visible) return null;

  return (
    <View pointerEvents="none" style={styles.container}>
      <Animated.View style={[styles.toast, { opacity }]}> 
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 28,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
  },
  toast: {
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    maxWidth: "90%",
  },
  text: {
    color: "#fff",
    fontSize: 14,
  },
});

export default AddToast;

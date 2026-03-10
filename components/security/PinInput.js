import React, { useRef } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

const PIN_LENGTH = 6;

export default function PinInput({ pin, setPin }) {
  const inputRef = useRef(null);

  const handleChange = (text) => {
    const value = text.replace(/[^0-9]/g, "");
    if (value.length <= PIN_LENGTH) {
      setPin(value);
    }
  };

  return (
    <Animated.View entering={FadeInUp.duration(400)} style={styles.container}>
      {/* Hidden input */}
      <TextInput
        ref={inputRef}
        value={pin}
        onChangeText={handleChange}
        keyboardType="numeric"
        maxLength={PIN_LENGTH}
        style={styles.hiddenInput}
        autoFocus
      />

      {/* PIN circles */}
      <View style={styles.row}>
        {[...Array(PIN_LENGTH)].map((_, index) => {
          const filled = index < pin.length;

          return (
            <View
              key={index}
              style={[styles.circle, filled && styles.circleFilled]}
            />
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 30,
  },

  hiddenInput: {
    position: "absolute",
    opacity: 0,
  },

  row: {
    flexDirection: "row",
    justifyContent: "center",
  },

  circle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#475569",
    marginHorizontal: 10,
  },

  circleFilled: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
});
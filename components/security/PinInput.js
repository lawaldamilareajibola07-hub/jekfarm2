import React, { useRef, useImperativeHandle, forwardRef } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const PIN_LENGTH = 6;

const PinInput = forwardRef(({ pin, setPin }, ref) => {
  const inputRef = useRef(null);
  const shake = useSharedValue(0);

  const handleChange = (text) => {
    const value = text.replace(/[^0-9]/g, "");

    if (value.length <= PIN_LENGTH) {
      setPin(value);
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  // Shake animation for wrong PIN
  const triggerError = () => {
    shake.value = withSequence(
      withTiming(-10, { duration: 60 }),
      withTiming(10, { duration: 60 }),
      withTiming(-10, { duration: 60 }),
      withTiming(10, { duration: 60 }),
      withTiming(0, { duration: 60 })
    );
  };

  useImperativeHandle(ref, () => ({
    triggerError,
    focus: focusInput,
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  return (
    <Animated.View
      entering={FadeInUp.duration(400)}
      style={[styles.container, animatedStyle]}
    >
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

      {/* Tap area */}
      <TouchableOpacity activeOpacity={1} onPress={focusInput}>
        <View style={styles.row}>
          {[...Array(PIN_LENGTH)].map((_, index) => {
            const filled = index < pin.length;

            return (
              <Animated.View
                key={index}
                style={[styles.circle, filled && styles.circleFilled]}
              />
            );
          })}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

export default PinInput;

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
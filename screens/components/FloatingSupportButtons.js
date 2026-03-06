import React, { useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Animated,
  Easing,
  Image, // ✅ ADDED
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function FloatingSupportButtons({
  onAIPress,
  onSupportPress,
  scrollY,
  showNotification = false,
}) {
  const navigation = useNavigation();

  const containerOpacity = useRef(new Animated.Value(1)).current;
  const containerTranslate = useRef(new Animated.Value(0)).current;

  const labelOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  /* ---------------- AUTO HIDE ON SCROLL ---------------- */
  useEffect(() => {
    if (!scrollY) return;

    const listener = scrollY.addListener(({ value }) => {
      if (value > 50) {
        Animated.parallel([
          Animated.timing(containerOpacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(containerTranslate, {
            toValue: 60,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.timing(containerOpacity, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(containerTranslate, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      }
    });

    return () => {
      scrollY.removeListener(listener);
    };
  }, [scrollY]);

  /* ---------------- LABEL FADE IN ---------------- */
  useEffect(() => {
    Animated.timing(labelOpacity, {
      toValue: 1,
      duration: 600,
      delay: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  /* ---------------- FLOATING ANIMATION ---------------- */
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  /* ---------------- NOTIFICATION PULSE ---------------- */
  useEffect(() => {
    if (!showNotification) return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 700,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [showNotification]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: containerOpacity,
          transform: [
            { translateY: containerTranslate },
            { translateY: floatAnim },
          ],
        },
      ]}
      pointerEvents="box-none"
    >
      {/* ---------------- AI BUTTON ---------------- */}
      <View style={styles.row}>
        <Animated.View style={{ opacity: labelOpacity }}>
          <Text style={styles.label}>Talk to AgriNova AI</Text>
        </Animated.View>

        <TouchableOpacity
          style={styles.aiButton}
          onPress={() => navigation.navigate("AgricNovaAI")}
          activeOpacity={0.85}
        >
          <Ionicons name="sparkles" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ---------------- SUPPORT BUTTON ---------------- */}
      <View style={styles.row}>
        <Animated.View style={{ opacity: labelOpacity }}>
          <Text style={styles.label}>Customer Support</Text>
        </Animated.View>

        <View>
          <Animated.View
            style={[
              styles.supportButton,
              showNotification && {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <TouchableOpacity
              onPress={onSupportPress}
              activeOpacity={0.85}
              style={styles.fullSize}
            >
              {/* ✅ CHANGED TO IMAGE */}
              <Image
                source={require("../../assets/service.jpeg")}
                style={styles.supportImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </Animated.View>

          {showNotification && <View style={styles.badge} />}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 30,
    right: 20,
    alignItems: "flex-end",
    zIndex: 9999,
    elevation: 50,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  label: {
    backgroundColor: "rgba(0,0,0,0.75)",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 12,
    marginRight: 10,
  },

  aiButton: {
    backgroundColor: "#6366F1",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },

  supportButton: {
    backgroundColor: "#10B981",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    overflow: "hidden", // ✅ ensures image stays inside circle
  },

  supportImage: {
    width: "100%",
    height: "100%",
    borderRadius: 28, // ✅ makes image perfectly circular
  },

  fullSize: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#EF4444",
  },
});
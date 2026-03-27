import React, { useEffect, useRef } from "react";
import {
  View,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Animated,
  Image,
  Dimensions,
  PanResponder,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

const { width, height } = Dimensions.get("window");

export default function ImagePromoModal({ visible, onClose }) {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const autoCloseRef = useRef(null);

  /* =========================
     OPEN ANIMATION + AUTO CLOSE
  ========================= */
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto close after 5 seconds
      autoCloseRef.current = setTimeout(() => {
        handleClose();
      }, 5000);
    }

    return () => clearTimeout(autoCloseRef.current);
  }, [visible]);

  /* =========================
     CLOSE ANIMATION
  ========================= */
  const handleClose = () => {
    clearTimeout(autoCloseRef.current);

    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose && onClose();
      translateY.setValue(0);
    });
  };

  /* =========================
     SWIPE TO DISMISS
  ========================= */
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dy) > 10,

      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          translateY.setValue(gesture.dy);
        }
      },

      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 120) {
          handleClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View
          style={[
            styles.overlay,
            { opacity: opacityAnim },
          ]}
        >
          {/* BLUR BACKGROUND */}
          <BlurView
            intensity={40}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />

          {/* Prevent closing when touching modal */}
          <TouchableWithoutFeedback>
            <Animated.View
              {...panResponder.panHandlers}
              style={[
                styles.modalContainer,
                {
                  transform: [
                    { scale: scaleAnim },
                    { translateY: translateY },
                  ],
                },
              ]}
            >
              {/* CLOSE BUTTON */}
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={handleClose}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color="#fff"
                />
              </TouchableOpacity>

              {/* PROMO IMAGE */}
              <Image
                source={require("../../assets/greeting.jpeg")}
                style={styles.image}
                resizeMode="contain"
              />

              {/* CLICKABLE GRAB NOW AREA */}
              <TouchableOpacity
                style={styles.grabOverlay}
                activeOpacity={0.8}
                onPress={() => {
                  handleClose();
                  console.log("Grab Now clicked");
                }}
              />
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    width: width * 0.9,
    alignItems: "center",
  },

  image: {
    width: "100%",
    height: height * 0.72,
  },

  closeBtn: {
    position: "absolute",
    top: -20,
    right: -10,
    backgroundColor: "rgba(0,0,0,0.7)",
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  /* Invisible clickable button positioned over "Grab Now" */
  grabOverlay: {
    position: "absolute",
    bottom: height * 0.1,
    width: width * 0.55,
    height: 55,
    borderRadius: 30,
  },
});
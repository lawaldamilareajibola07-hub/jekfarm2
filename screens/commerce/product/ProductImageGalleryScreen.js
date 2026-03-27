import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Platform,
} from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const resolveUrl = (img) =>
  img?.image_url || img?.url || img?.image_path ||
  img?.path || img?.file_url || img?.media_url || "";

export default function ProductImageGalleryScreen({ route, navigation }) {
  const { images = [], initialIndex = 0 } = route.params;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  const imageUrls = images.map((img) => ({ url: resolveUrl(img) }));

  // ── Animation values ──────────────────────────────────────────
  const backdropOpacity  = useRef(new Animated.Value(0)).current;
  const contentScale    = useRef(new Animated.Value(0.88)).current;
  const contentOpacity  = useRef(new Animated.Value(0)).current;
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const headerTranslateY = useRef(new Animated.Value(-30)).current;
  const footerTranslateY = useRef(new Animated.Value(30)).current;
  const dotScale         = useRef(new Animated.Value(1)).current;

  // ── Mount animation ───────────────────────────────────────────
  useEffect(() => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(contentScale, {
        toValue: 1,
        tension: 65,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(headerTranslateY, {
        toValue: 0,
        tension: 70,
        friction: 10,
        delay: 120,
        useNativeDriver: true,
      }),
      Animated.spring(footerTranslateY, {
        toValue: 0,
        tension: 70,
        friction: 10,
        delay: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ── Close animation ───────────────────────────────────────────
  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(contentScale, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslateY, {
        toValue: -30,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(footerTranslateY, {
        toValue: 30,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => navigation.goBack());
  }, [navigation]);

  // ── Toggle controls visibility on tap ────────────────────────
  const toggleControls = useCallback(() => {
    if (isZoomed) return;
    const next = !controlsVisible;
    setControlsVisible(next);
    Animated.timing(controlsOpacity, {
      toValue: next ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [isZoomed, controlsVisible]);

  // ── Dot bounce on index change ────────────────────────────────
  const handleIndexChange = useCallback((index) => {
    setCurrentIndex(index);
    Haptics.selectionAsync();
    Animated.sequence([
      Animated.timing(dotScale, {
        toValue: 1.4,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(dotScale, {
        toValue: 1,
        tension: 120,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ── Thumbnail dot strip ───────────────────────────────────────
  const renderDots = () => {
    if (imageUrls.length <= 1) return null;
    return (
      <View style={styles.dotsRow}>
        {imageUrls.map((_, i) => {
          const isActive = i === currentIndex;
          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                isActive && styles.dotActive,
                isActive && { transform: [{ scale: dotScale }] },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: backdropOpacity }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000" animated />

      {/* ── Image Viewer ── */}
      <Animated.View
        style={[
          styles.viewerWrapper,
          {
            opacity: contentOpacity,
            transform: [{ scale: contentScale }],
          },
        ]}
      >
        <ImageViewer
          imageUrls={imageUrls}
          index={initialIndex}
          initialIndex={initialIndex}
          enableSwipeDown
          onSwipeDown={handleClose}
          onMove={({ scale }) => setIsZoomed(scale > 1)}
          onChange={handleIndexChange}
          onClick={toggleControls}
          saveToLocalByLongPress={false}
          backgroundColor="transparent"
          renderIndicator={() => null}
          style={styles.imageViewer}
        />
      </Animated.View>

      {/* ── Top gradient + header ── */}
      <Animated.View
        style={[
          styles.headerContainer,
          {
            opacity: controlsOpacity,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
        pointerEvents={controlsVisible ? "box-none" : "none"}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.72)", "transparent"]}
          style={styles.topGradient}
        />
        <SafeAreaView>
          <View style={styles.headerRow}>
            {/* Close button */}
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={handleClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.75}
            >
              <Ionicons name="close" size={22} color="#fff" />
            </TouchableOpacity>

            {/* Counter badge */}
            {imageUrls.length > 1 && (
              <View style={styles.counterBadge}>
                <Text style={styles.counterText}>
                  {currentIndex + 1} / {imageUrls.length}
                </Text>
              </View>
            )}

            {/* Share button placeholder */}
            <TouchableOpacity
              style={styles.iconBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.75}
            >
              <Ionicons name="share-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* ── Bottom gradient + dots ── */}
      <Animated.View
        style={[
          styles.footerContainer,
          {
            opacity: controlsOpacity,
            transform: [{ translateY: footerTranslateY }],
          },
        ]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.65)"]}
          style={styles.bottomGradient}
        >
          {renderDots()}
          <Text style={styles.swipeHint}>Swipe down to close</Text>
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  viewerWrapper: {
    flex: 1,
  },
  imageViewer: {
    flex: 1,
  },

  // ── Header ──
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  topGradient: {
    ...StyleSheet.absoluteFillObject,
    height: 130,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 14 : 10,
    paddingBottom: 16,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  counterBadge: {
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  counterText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  // ── Footer ──
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  bottomGradient: {
    paddingTop: 50,
    paddingBottom: Platform.OS === "ios" ? 44 : 28,
    alignItems: "center",
    gap: 10,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  dotActive: {
    width: 22,
    backgroundColor: "#fff",
    borderRadius: 4,
  },
  swipeHint: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.3,
    marginTop: 2,
  },
});

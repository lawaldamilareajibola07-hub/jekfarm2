import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Image,
  Alert,
  StatusBar,
  Animated,
} from "react-native";

import ReAnimated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { addToCart } from "../../../api/commerce/cart";
import { getMarketplaceProducts } from "../../../api/commerce/marketplace";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_HEIGHT = 320;
const GREEN = "#22c55e";
const GREEN_LIGHT = "#f0fdf4";
const GREEN_DARK = "#16a34a";
const AUTO_SLIDE_INTERVAL = 3000;

// ── Helpers ───────────────────────────────────────────────────────────────────

const resolveUri = (img) => {
  if (!img) return null;
  if (typeof img === "string") return img;
  return (
    img?.image_url ||
    img?.url ||
    img?.image_path ||
    img?.path ||
    img?.file_url ||
    img?.media_url ||
    null
  );
};

const getBestImage = (images) => {
  if (!Array.isArray(images) || images.length === 0) return null;
  const primary = images.find((img) => img?.is_primary);
  return resolveUri(primary) || resolveUri(images[0]) || null;
};

// ── ImageCarousel ─────────────────────────────────────────────────────────────

function ImageCarousel({ images, onImagePress }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef(null);
  const timerRef = useRef(null);

  // Hint animation values
  const hintOpacity = useRef(new Animated.Value(0)).current;
  const hintTranslateY = useRef(new Animated.Value(8)).current;

  const validImages =
    Array.isArray(images) && images.length > 0
      ? [...images].sort((a, b) => (b?.is_primary ? 1 : 0) - (a?.is_primary ? 1 : 0))
      : [];

  const showPlaceholder = validImages.length === 0;

  // ── Hint: fade in then fade out after 2.5s ────────────────────────────────
  useEffect(() => {
    if (validImages.length === 0) return;

    const showTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(hintOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(hintTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => {
          Animated.timing(hintOpacity, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }).start();
        }, 2000);
      });
    }, 800);

    return () => clearTimeout(showTimer);
  }, []);

  // ── Auto-slide ────────────────────────────────────────────────────────────
  const startAutoSlide = useCallback(() => {
    if (validImages.length <= 1) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % validImages.length;
        flatRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, AUTO_SLIDE_INTERVAL);
  }, [validImages.length]);

  const stopAutoSlide = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, [startAutoSlide]);

  const onScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  const onScrollBeginDrag = () => stopAutoSlide();
  const onScrollEndDrag = () => startAutoSlide();

  if (showPlaceholder) {
    return (
      <View style={[carouselStyles.container, carouselStyles.placeholder]}>
        <Text style={carouselStyles.placeholderEmoji}>🌿</Text>
        <Text style={carouselStyles.placeholderText}>No Image</Text>
      </View>
    );
  }

  return (
    <View style={carouselStyles.container}>
      <FlatList
        ref={flatRef}
        data={validImages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        keyExtractor={(_, i) => i.toString()}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        renderItem={({ item, index }) => {
          const uri = resolveUri(item);
          return uri ? (
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() => onImagePress && onImagePress(index)}
            >
              <Image
                source={{ uri }}
                style={carouselStyles.image}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ) : (
            <View style={[carouselStyles.image, carouselStyles.placeholder]}>
              <Text style={carouselStyles.placeholderEmoji}>🌿</Text>
              <Text style={carouselStyles.placeholderText}>No Image</Text>
            </View>
          );
        }}
      />

      {/* Dot indicators */}
      {validImages.length > 1 && (
        <View style={carouselStyles.dots}>
          {validImages.map((_, i) => (
            <View
              key={i}
              style={[
                carouselStyles.dot,
                i === activeIndex && carouselStyles.activeDot,
              ]}
            />
          ))}
        </View>
      )}

      {/* Image count badge — top right */}
      {validImages.length > 1 && (
        <View style={carouselStyles.countBadge}>
          <Text style={carouselStyles.countText}>
            {activeIndex + 1} / {validImages.length}
          </Text>
        </View>
      )}

      {/* Tap hint — animates in then fades out */}
      <Animated.View
        style={[
          carouselStyles.hintContainer,
          {
            opacity: hintOpacity,
            transform: [{ translateY: hintTranslateY }],
          },
        ]}
        pointerEvents="none"
      >
        <Text style={carouselStyles.hintIcon}>🔍</Text>
        <Text style={carouselStyles.hintText}>Tap image to view full screen</Text>
      </Animated.View>
    </View>
  );
}

const carouselStyles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    backgroundColor: "#e8f5e9",
  },
  image: { width: SCREEN_WIDTH, height: IMAGE_HEIGHT },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#e8f5e9",
  },
  placeholderEmoji: { fontSize: 48 },
  placeholderText: { fontSize: 13, color: "#aaa" },

  // Dots
  dots: {
    position: "absolute",
    bottom: 44,
    alignSelf: "center",
    flexDirection: "row",
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  activeDot: { width: 18, backgroundColor: GREEN },

  // Count badge
  countBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  countText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.4,
  },

  // Tap hint
  hintContainer: {
    position: "absolute",
    bottom: 14,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.50)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 30,
  },
  hintIcon: { fontSize: 13 },
  hintText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
});

// ── RelatedCard ───────────────────────────────────────────────────────────────

function RelatedCard({ product, onPress }) {
  const uri = getBestImage(product?.images);
  return (
    <TouchableOpacity style={relatedStyles.card} onPress={onPress} activeOpacity={0.85}>
      {uri ? (
        <Image source={{ uri }} style={relatedStyles.image} resizeMode="cover" />
      ) : (
        <View style={[relatedStyles.image, relatedStyles.placeholder]}>
          <Text style={{ fontSize: 24 }}>🌿</Text>
        </View>
      )}
      <View style={relatedStyles.info}>
        <Text numberOfLines={1} style={relatedStyles.name}>{product?.name}</Text>
        <Text style={relatedStyles.price}>
          ₦{parseFloat(product?.price || 0).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const relatedStyles = StyleSheet.create({
  card: { width: 140, marginRight: 12, borderRadius: 12, backgroundColor: "#fff", overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  image: { width: 140, height: 100 },
  placeholder: { backgroundColor: "#e8f5e9", justifyContent: "center", alignItems: "center" },
  info: { padding: 8 },
  name: { fontSize: 12, fontWeight: "600", color: "#111" },
  price: { fontSize: 13, fontWeight: "700", color: GREEN_DARK, marginTop: 3 },
});

// ── ProductDetailsScreen ──────────────────────────────────────────────────────

export default function ProductDetailsScreen({ route, navigation }) {
  const { product: rawProduct } = route.params;

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const btnScale = useSharedValue(1);
  const animatedBtn = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  // Normalise product data
  useEffect(() => {
    if (!rawProduct) return;
    setProduct({
      ...rawProduct,
      stock_quantity: parseFloat(rawProduct?.stock_quantity ?? 0),
      images: Array.isArray(rawProduct?.images) ? rawProduct.images : [],
      price: parseFloat(rawProduct?.price ?? 0),
      min_order_quantity: parseFloat(rawProduct?.min_order_quantity ?? 1),
    });
  }, [rawProduct]);

  // Fetch related products by category
  useEffect(() => {
    if (!rawProduct?.category) return;
    getMarketplaceProducts({ search: "" })
      .then((res) => {
        const all = res?.data || [];
        const related = all
          .filter((p) => p.category === rawProduct.category && p.id !== rawProduct.id)
          .slice(0, 6)
          .map((p) => ({
            ...p,
            images: Array.isArray(p.images) ? p.images : [],
            price: parseFloat(p.price ?? 0),
          }));
        setRelatedProducts(related);
      })
      .catch(() => {});
  }, [rawProduct]);

  // ✅ Navigate to gallery at the tapped image index
  const handleImagePress = useCallback(
    (index) => {
      navigation.navigate("ProductImageGallery", {
        images: product.images,
        initialIndex: index,
      });
    },
    [product, navigation]
  );

  // Add to cart with spring button animation
  const handleAddToCart = async () => {
    if (!product) return;

    // ✅ DEBUG LOGS — remove after fixing
    console.log("=== PRODUCT ID ===", product.id);
    console.log("=== FULL PRODUCT ===", JSON.stringify(product));

    btnScale.value = withSpring(0.95, {}, () => {
      btnScale.value = withSpring(1);
    });

    try {
      setAddingToCart(true);
      await addToCart({ productId: product.id, quantity });
      Alert.alert(
        "Added to Cart ✓",
        `${product.name} (×${quantity}) added successfully.`,
        [
          { text: "Continue Shopping", style: "cancel" },
          { text: "View Cart", onPress: () => navigation.navigate("ShoppingCart") },
        ]
      );
    } catch (err) {
      console.error("Add to cart error:", err);
      Alert.alert("Error", err?.message || "Could not add item to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  // ── Guards ────────────────────────────────────────────────────────────────

  if (!rawProduct) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Product not found.</Text>
        <TouchableOpacity style={styles.goBackBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.goBackText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={GREEN} />
      </View>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────

  const inStock = product.stock_quantity > 0;
  const totalPrice = (product.price * quantity).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
  });
  const vendorName = product?.vendor
    ? `${product.vendor.first_name || ""} ${product.vendor.last_name || ""}`.trim()
    : "Unknown Vendor";
  const vendorId = product?.vendor?.id;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.headerBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity style={[styles.headerBtn, styles.headerBtnGreen]} onPress={() => {}}>
          <Text style={styles.chatIcon}>💬</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ✅ Carousel — auto-slides + tappable */}
        <ReAnimated.View entering={FadeIn.duration(400)}>
          <ImageCarousel
            images={product.images}
            onImagePress={handleImagePress}
          />
        </ReAnimated.View>

        {/* Product info */}
        <ReAnimated.View entering={FadeInDown.delay(100).duration(400)} style={styles.infoSection}>
          <View style={styles.nameRow}>
            <Text style={styles.productName}>{product.name}</Text>
            <TouchableOpacity onPress={() => setWishlist((w) => !w)}>
              <Text style={[styles.heartIcon, wishlist && styles.heartActive]}>
                {wishlist ? "❤️" : "🤍"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ✅ Vendor name — tappable link to VendorStoreScreen */}
          <ReAnimated.View entering={FadeInDown.delay(120).duration(350)}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                vendorId &&
                navigation.navigate("VendorStore", {
                  vendorId,
                  vendorName,
                })
              }
              style={vendorLinkStyles.row}
            >
              <Text style={vendorLinkStyles.byText}>Sold by </Text>
              <View style={vendorLinkStyles.pill}>
                <Text style={vendorLinkStyles.storeName}>🏪 {vendorName}</Text>
                <Text style={vendorLinkStyles.arrow}>›</Text>
              </View>
            </TouchableOpacity>
          </ReAnimated.View>

          <View style={[styles.stockBadge, !inStock && styles.stockBadgeOut]}>
            <View style={[styles.stockDot, !inStock && styles.stockDotOut]} />
            <Text style={[styles.stockText, !inStock && styles.stockTextOut]}>
              {inStock ? `In Stock (${product.stock_quantity})` : "Out of Stock"}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>PRICE / {product?.unit || "unit"}</Text>
              <Text style={styles.price}>₦{product.price.toLocaleString()}</Text>
            </View>
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={[styles.qtyBtn, quantity <= (product.min_order_quantity || 1) && styles.qtyBtnDisabled]}
                onPress={() => setQuantity((q) => Math.max(product.min_order_quantity || 1, q - 1))}
                disabled={quantity <= (product.min_order_quantity || 1)}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity
                style={[styles.qtyBtn, quantity >= product.stock_quantity && styles.qtyBtnDisabled]}
                onPress={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                disabled={quantity >= product.stock_quantity}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ReAnimated.View>

        <View style={styles.divider} />

        {/* Description */}
        {product?.description ? (
          <ReAnimated.View entering={FadeInDown.delay(150).duration(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </ReAnimated.View>
        ) : null}

        <View style={styles.divider} />

        {/* Product Info */}
        <ReAnimated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Product Info</Text>
          <View style={styles.metaGrid}>
            {product?.category ? <View style={styles.metaItem}><Text style={styles.metaKey}>Category</Text><Text style={styles.metaValue}>{product.category}</Text></View> : null}
            {product?.unit ? <View style={styles.metaItem}><Text style={styles.metaKey}>Unit</Text><Text style={styles.metaValue}>{product.unit}</Text></View> : null}
            {product?.min_order_quantity ? <View style={styles.metaItem}><Text style={styles.metaKey}>Min. Order</Text><Text style={styles.metaValue}>{product.min_order_quantity}</Text></View> : null}
            {product?.pickup_location ? <View style={styles.metaItem}><Text style={styles.metaKey}>Pickup</Text><Text style={styles.metaValue}>{product.pickup_location}</Text></View> : null}
            {product?.logistics_preference ? <View style={styles.metaItem}><Text style={styles.metaKey}>Logistics</Text><Text style={styles.metaValue}>{product.logistics_preference}</Text></View> : null}
            {product?.stock_quantity !== undefined ? <View style={styles.metaItem}><Text style={styles.metaKey}>Available</Text><Text style={styles.metaValue}>{product.stock_quantity}</Text></View> : null}
          </View>
        </ReAnimated.View>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <>
            <View style={styles.divider} />
            <ReAnimated.View entering={FadeInDown.delay(250).duration(400)} style={styles.section}>
              <Text style={styles.sectionTitle}>Related Products</Text>
              <FlatList
                data={relatedProducts}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item?.id?.toString()}
                renderItem={({ item }) => (
                  <RelatedCard
                    product={item}
                    onPress={() => navigation.replace("ProductDetails", { product: item })}
                  />
                )}
                contentContainerStyle={{ paddingBottom: 4 }}
              />
            </ReAnimated.View>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom bar */}
      <ReAnimated.View style={[styles.bottomBar, animatedBtn]}>
        <View style={styles.totalBlock}>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.totalPrice}>₦{totalPrice}</Text>
        </View>

        <TouchableOpacity
          style={[styles.addToCartBtn, (!inStock || addingToCart) && styles.addToCartDisabled]}
          onPress={handleAddToCart}
          disabled={!inStock || addingToCart}
          activeOpacity={0.85}
        >
          {addingToCart ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.cartIcon}>🛒</Text>
              <Text style={styles.addToCartText}>
                {inStock ? "Add to Cart" : "Out of Stock"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ReAnimated.View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  errorText: { fontSize: 16, color: "#666" },
  goBackBtn: { paddingVertical: 10, paddingHorizontal: 20, backgroundColor: GREEN_LIGHT, borderRadius: 10 },
  goBackText: { fontSize: 14, fontWeight: "600", color: GREEN_DARK },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  headerBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#f3f4f6", justifyContent: "center", alignItems: "center" },
  headerBtnGreen: { backgroundColor: GREEN_LIGHT },
  headerBtnText: { fontSize: 26, color: "#111", lineHeight: 30, marginTop: -2 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#111" },
  chatIcon: { fontSize: 18 },
  scrollContent: { paddingBottom: 20 },
  infoSection: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 4 },
  nameRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  productName: { fontSize: 24, fontWeight: "700", color: "#111", flex: 1, marginRight: 12 },
  heartIcon: { fontSize: 26, color: "#ddd" },
  heartActive: { color: "#ef4444" },
  stockBadge: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", backgroundColor: GREEN_LIGHT, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 16, gap: 6 },
  stockBadgeOut: { backgroundColor: "#fef2f2" },
  stockDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: GREEN },
  stockDotOut: { backgroundColor: "#ef4444" },
  stockText: { fontSize: 13, fontWeight: "600", color: GREEN_DARK },
  stockTextOut: { color: "#dc2626" },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  priceLabel: { fontSize: 11, fontWeight: "700", color: "#999", letterSpacing: 1, marginBottom: 2 },
  price: { fontSize: 30, fontWeight: "800", color: GREEN, letterSpacing: -0.5 },
  qtyRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#f3f4f6", borderRadius: 14, overflow: "hidden" },
  qtyBtn: { width: 44, height: 44, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", margin: 3, borderRadius: 10, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  qtyBtnDisabled: { opacity: 0.3 },
  qtyBtnText: { fontSize: 20, fontWeight: "400", color: "#111", lineHeight: 22 },
  qtyValue: { width: 38, textAlign: "center", fontSize: 16, fontWeight: "700", color: "#111" },
  divider: { height: 8, backgroundColor: "#f5f5f5", marginTop: 16 },
  section: { paddingHorizontal: 20, paddingVertical: 18 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#111", marginBottom: 10 },
  description: { fontSize: 14, color: "#555", lineHeight: 22, marginBottom: 16 },
  metaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  metaItem: { minWidth: "44%" },
  metaKey: { fontSize: 11, fontWeight: "600", color: "#aaa", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 2 },
  metaValue: { fontSize: 13, fontWeight: "600", color: "#222" },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14, paddingBottom: 28, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#f0f0f0", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, elevation: 10 },
  totalBlock: { gap: 2 },
  totalLabel: { fontSize: 12, color: "#999", fontWeight: "500" },
  totalPrice: { fontSize: 20, fontWeight: "800", color: "#111", letterSpacing: -0.3 },
  addToCartBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: GREEN, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 30, shadowColor: GREEN, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6 },
  addToCartDisabled: { backgroundColor: "#ccc", shadowOpacity: 0 },
  cartIcon: { fontSize: 18 },
  addToCartText: { color: "#fff", fontSize: 15, fontWeight: "700", letterSpacing: 0.2 },
});

// ── Vendor Link Styles ────────────────────────────────────────────────────────

const vendorLinkStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  byText: {
    fontSize: 13,
    color: "#777",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GREEN_LIGHT,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  storeName: {
    fontSize: 13,
    fontWeight: "700",
    color: GREEN_DARK,
  },
  arrow: {
    fontSize: 16,
    fontWeight: "700",
    color: GREEN_DARK,
    marginTop: -1,
  },
});
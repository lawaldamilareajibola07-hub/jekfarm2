import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Dimensions,
} from "react-native";
import Animated, {
  FadeInUp,
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";

// ✅ FIXED: use marketplace API with vendor_id param instead of vendor-only endpoint
import { getVendorMarketplaceProducts } from "../../../api/commerce/marketplace";
import ProductCard from "../../../components/commerce/ProductCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GREEN = "#22c55e";
const GREEN_LIGHT = "#f0fdf4";
const GREEN_DARK = "#16a34a";

// ── Sort options ──────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price ↑", value: "price_asc" },
  { label: "Price ↓", value: "price_desc" },
  { label: "Name", value: "name" },
];

// ── Sort chip ─────────────────────────────────────────────────────────────────

function SortChip({ label, active, onPress }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.9, {}, () => {
      scale.value = withSpring(1);
    });
    onPress();
  };

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={[chipStyles.chip, active && chipStyles.chipActive]}
      >
        <Text style={[chipStyles.label, active && chipStyles.labelActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    marginRight: 8,
  },
  chipActive: { backgroundColor: GREEN },
  label: { fontSize: 13, fontWeight: "600", color: "#555" },
  labelActive: { color: "#fff" },
});

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ query, onClear }) {
  return (
    <Animated.View entering={FadeIn.duration(400)} style={emptyStyles.container}>
      <Text style={emptyStyles.emoji}>🌿</Text>
      <Text style={emptyStyles.title}>
        {query ? "No results found" : "No products yet"}
      </Text>
      <Text style={emptyStyles.subtitle}>
        {query
          ? `No products match "${query}"`
          : "This vendor hasn't listed any products yet."}
      </Text>
      {query ? (
        <TouchableOpacity onPress={onClear} style={emptyStyles.btn}>
          <Text style={emptyStyles.btnText}>Clear Search</Text>
        </TouchableOpacity>
      ) : null}
    </Animated.View>
  );
}

const emptyStyles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, paddingHorizontal: 32 },
  emoji: { fontSize: 52, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: "700", color: "#111", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#888", textAlign: "center", lineHeight: 20 },
  btn: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: GREEN_LIGHT, borderRadius: 20 },
  btnText: { fontSize: 14, fontWeight: "600", color: GREEN_DARK },
});

// ── Stats bar ─────────────────────────────────────────────────────────────────

function StatsBar({ total, filtered }) {
  return (
    <Animated.View entering={FadeInDown.delay(100).duration(350)} style={statsStyles.container}>
      <View style={statsStyles.stat}>
        <Text style={statsStyles.value}>{total}</Text>
        <Text style={statsStyles.key}>Products</Text>
      </View>
      <View style={statsStyles.divider} />
      <View style={statsStyles.stat}>
        <Text style={statsStyles.value}>{filtered}</Text>
        <Text style={statsStyles.key}>Showing</Text>
      </View>
      <View style={statsStyles.divider} />
      <View style={statsStyles.stat}>
        <Text style={[statsStyles.value, { color: GREEN }]}>
          {total > 0 ? Math.round((filtered / total) * 100) : 0}%
        </Text>
        <Text style={statsStyles.key}>Match</Text>
      </View>
    </Animated.View>
  );
}

const statsStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#fafafa",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  stat: { alignItems: "center" },
  value: { fontSize: 18, fontWeight: "800", color: "#111" },
  key: { fontSize: 11, color: "#aaa", fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 },
  divider: { width: 1, height: 28, backgroundColor: "#e5e7eb" },
});

// ── VendorStoreScreen ─────────────────────────────────────────────────────────

export default function VendorStoreScreen({ route, navigation }) {
  const { vendorId, vendorName } = route.params;

  const [allProducts, setAllProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeSort, setActiveSort] = useState("newest");

  // Header shrink animation on scroll
  const scrollY = useSharedValue(0);
  const headerAnim = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 60], [1, 0.85], Extrapolate.CLAMP),
    transform: [
      {
        translateY: interpolate(scrollY.value, [0, 60], [0, -4], Extrapolate.CLAMP),
      },
    ],
  }));

  // ── Fetch ───────────────────────────────────────────────────────────────────

  const fetchProducts = useCallback(async () => {
    try {
      setError(null);
      // ✅ FIXED: calls GET /commerce/marketplace/products?vendor_id=uuid
      const res = await getVendorMarketplaceProducts(vendorId);
      // Handle both res.data.data and res.data response shapes
      const data = res?.data?.data ?? res?.data ?? [];
      setAllProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("VendorStoreScreen fetch error:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Filter + sort ───────────────────────────────────────────────────────────

  useEffect(() => {
    let result = [...allProducts];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p?.name?.toLowerCase().includes(q) ||
          p?.category?.toLowerCase().includes(q) ||
          p?.description?.toLowerCase().includes(q)
      );
    }

    switch (activeSort) {
      case "price_asc":
        result.sort((a, b) => parseFloat(a.price || 0) - parseFloat(b.price || 0));
        break;
      case "price_desc":
        result.sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0));
        break;
      case "name":
        result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "newest":
      default:
        result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
    }

    setDisplayProducts(result);
  }, [allProducts, search, activeSort]);

  // ── Refresh ─────────────────────────────────────────────────────────────────

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  // ── Render item ─────────────────────────────────────────────────────────────

  const renderItem = ({ item, index }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 60).duration(400).springify()}
      style={styles.cardWrapper}
    >
      <ProductCard
        product={item}
        onPress={() => navigation.navigate("ProductDetails", { product: item })}
      />
    </Animated.View>
  );

  // ── Loading state ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.centerScreen}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ActivityIndicator size="large" color={GREEN} />
        <Text style={styles.loadingText}>Loading store…</Text>
      </View>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────

  if (error) {
    return (
      <View style={styles.centerScreen}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => { setLoading(true); fetchProducts(); }}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Header ── */}
      <Animated.View style={[styles.header, headerAnim]}>

        {/* Back button + title */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleBlock}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              🏪 {vendorName}
            </Text>
            <Text style={styles.headerSub}>
              {allProducts.length} product{allProducts.length !== 1 ? "s" : ""} available
            </Text>
          </View>
          <View style={{ width: 38 }} />
        </Animated.View>

        {/* Search bar */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search products…"
              placeholderTextColor="#bbb"
              style={styles.searchInput}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Sort chips */}
        <Animated.View entering={FadeInDown.delay(140).duration(400)}>
          <FlatList
            data={SORT_OPTIONS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.value}
            contentContainerStyle={styles.sortRow}
            renderItem={({ item }) => (
              <SortChip
                label={item.label}
                active={activeSort === item.value}
                onPress={() => setActiveSort(item.value)}
              />
            )}
          />
        </Animated.View>

      </Animated.View>

      {/* ── Stats bar ── */}
      <StatsBar total={allProducts.length} filtered={displayProducts.length} />

      {/* ── Product grid ── */}
      <FlatList
        data={displayProducts}
        keyExtractor={(item) => item?.id?.toString()}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScroll={(e) => {
          scrollY.value = e.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={GREEN}
            colors={[GREEN]}
          />
        }
        ListEmptyComponent={
          <EmptyState query={search} onClear={() => setSearch("")} />
        }
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },

  // Center screens (loading / error)
  centerScreen: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12, backgroundColor: "#fff" },
  loadingText: { fontSize: 14, color: "#aaa", marginTop: 8 },
  errorEmoji: { fontSize: 40 },
  errorText: { fontSize: 15, color: "#555", textAlign: "center", paddingHorizontal: 32 },
  retryBtn: { marginTop: 8, paddingHorizontal: 28, paddingVertical: 10, backgroundColor: GREEN_LIGHT, borderRadius: 20 },
  retryText: { fontSize: 14, fontWeight: "700", color: GREEN_DARK },

  // Header
  header: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  backBtnText: { fontSize: 26, color: "#111", lineHeight: 30, marginTop: -2 },
  headerTitleBlock: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#111" },
  headerSub: { fontSize: 12, color: "#aaa", marginTop: 2 },

  // Search
  searchRow: { paddingHorizontal: 16, marginBottom: 10 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchIcon: { fontSize: 15 },
  searchInput: { flex: 1, fontSize: 14, color: "#111", padding: 0 },
  clearIcon: { fontSize: 13, color: "#aaa", fontWeight: "600", padding: 4 },

  // Sort
  sortRow: { paddingHorizontal: 16, paddingBottom: 4 },

  // List
  listContent: { padding: 12, paddingBottom: 40 },
  columnWrapper: { justifyContent: "space-between" },
  cardWrapper: { width: (SCREEN_WIDTH - 36) / 2, marginBottom: 12 },
});
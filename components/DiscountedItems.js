import React, { useState, useEffect } from "react";
const BASE_URL = "https://jekfarms.com.ng";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const DiscountedItems = ({ addToCart }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/data/products.php`);
      const data = await response.json();

      if (data.status === "success" && (data.products || data.data)) {
        const rawProducts = data.products || data.data;

        // Map API products to UI format
        const formattedItems = rawProducts.map(p => ({
          id: p.id,
          name: p.name,
          discount: p.discount_percent ? `-${p.discount_percent}%` : "",
          price: `₦${parseFloat(p.price).toLocaleString()}`,
          rawPrice: p.price,
          image: p.image_url
            ? { uri: `${BASE_URL}/${p.image_url}`.replace(/([^:]\/)\/+/g, "$1") }
            : { uri: "https://img.icons8.com/?size=100&id=18042&format=png&color=000000" },
          desc: p.description || "Fresh produce",
          comingSoon: false,
          category_name: p.category_name
        }));

        setItems(formattedItems);
      }
    } catch (error) {
      console.error("Error fetching discounted items:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* FIRST ROW – Featured Products */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {items.length > 0 ? (
          items.slice(0, 5).map((item, index) => (
            <View key={item.id || index} style={{ alignItems: "center", marginRight: 15 }}>
              <View style={styles.productCard}>
                <View style={styles.imageContainer}>
                  <Image
                    source={
                      typeof item.image === "string"
                        ? { uri: item.image }
                        : item.image
                    }
                    style={[
                      styles.image,
                      item.comingSoon && styles.comingSoonImage
                    ]}
                  />
                </View>

                {/* Coming Soon Flag - positioned at top-right */}
                {item.comingSoon && (
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>Coming Soon</Text>
                  </View>
                )}

                {/* Discount badge - positioned at top-left */}
                {item.discount ? (
                  <Text style={styles.discount}>{item.discount}</Text>
                ) : null}

                <TouchableOpacity
                  style={[
                    styles.addButton,
                    item.comingSoon && styles.disabledAddButton
                  ]}
                  onPress={() => !item.comingSoon && addToCart && addToCart({
                    ...item,
                    price: parseFloat(item.rawPrice)
                  })}
                  disabled={item.comingSoon}
                >
                  <Ionicons name="add" size={20} color={item.comingSoon ? "#9ca3af" : "#fff"} />
                </TouchableOpacity>
              </View>

              <View style={styles.itemInfo}>
                <Text style={styles.price}>{item.price}</Text>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.perKg} numberOfLines={1}>{item.desc}</Text>
              </View>
            </View>
          ))
        ) : (
          !loading && <Text style={{ color: '#9ca3af', padding: 20 }}>No featured products yet.</Text>
        )}
      </ScrollView>

      {/* SECOND ROW – Meat Items */}
      {items.some(item => item.category_name === "Meat") && (
        <>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryTitle}>Fresh Meats</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scrollView}
          >
            {items
              .filter(item => item.category_name === "Meat")
              .map((item, index) => (
                <View key={item.id || index} style={{ alignItems: "center", marginRight: 15 }}>
                  <View style={styles.productCard}>
                    <View style={styles.imageContainer}>
                      <Image
                        source={
                          typeof item.image === "string"
                            ? { uri: item.image }
                            : item.image
                        }
                        style={[
                          styles.image,
                          item.comingSoon && styles.comingSoonImage
                        ]}
                      />
                    </View>

                    {item.discount ? (
                      <Text style={styles.discount}>{item.discount}</Text>
                    ) : null}

                    <TouchableOpacity
                      style={[
                        styles.addButton,
                        item.comingSoon && styles.disabledAddButton
                      ]}
                      onPress={() => !item.comingSoon && addToCart && addToCart({
                        ...item,
                        price: parseFloat(item.rawPrice)
                      })}
                      disabled={item.comingSoon}
                    >
                      <Ionicons name="add" size={20} color={item.comingSoon ? "#9ca3af" : "#fff"} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.itemInfo}>
                    <Text style={styles.price}>{item.price}</Text>
                    <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.perKg} numberOfLines={1}>{item.desc}</Text>
                  </View>
                </View>
              ))}
          </ScrollView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    backgroundColor: "#fff"
  },
  categoryHeader: {
    marginTop: 25,
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
  },
  scrollView: {
    flexGrow: 0,
    paddingLeft: 0
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 10,
    width: 170,
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
  },
  imageContainer: {
    width: "100%",
    height: 120,
    backgroundColor: "#F9FAFB",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  image: {
    width: "80%",
    height: "80%",
    resizeMode: "contain",
  },
  comingSoonImage: {
    opacity: 0.4,
  },
  discount: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#EF4444",
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 10,
    fontWeight: "800",
    borderRadius: 8,
    zIndex: 1,
  },
  comingSoonBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#3B82F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 2,
  },
  comingSoonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 9,
  },
  itemInfo: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  price: {
    fontWeight: "800",
    color: "#10B981",
    fontSize: 17,
    letterSpacing: -0.5,
  },
  name: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "700",
    marginTop: 4,
  },
  perKg: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  addButton: {
    backgroundColor: "#10B981",
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 10,
    bottom: 10,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledAddButton: {
    backgroundColor: "#F3F4F6",
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default DiscountedItems;
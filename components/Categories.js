import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Dimensions
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../screens/CartContext";

const BASE_URL = "https://jekfarms.com.ng";

// Get screen dimensions for full-page modal
const { width, height } = Dimensions.get('window');

// Import category images at the TOP LEVEL (outside component)
import carotsImage from "../assets/carots.png";
import packbeafImage from "../assets/packbeaf.png";
import yellotomato2Image from "../assets/yellotomato2.png";
import singletomato4Image from "../assets/singletomato4.png";
import blackcucumberImage from "../assets/blackcucumber.png";

// Import modal background image
import modalBgImage from "../assets/AgreonIcon.jpeg";

const Categories = () => {
  const navigation = useNavigation();
  const { addToCart } = useCart();

  // Modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [addedProductName, setAddedProductName] = useState("");
  const timerRef = useRef(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState(null);

  // Define category images array
  const categoryImages = [
    carotsImage,
    packbeafImage,
    yellotomato2Image,
    singletomato4Image,
    blackcucumberImage
  ];

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();

    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Fetch products when selected category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchProducts(selectedCategory.id);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/data/categories.php`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      let categoriesData = [];

      if (Array.isArray(data)) {
        categoriesData = data;
      } else if (data.categories && Array.isArray(data.categories)) {
        categoriesData = data.categories;
      } else if (data.data && Array.isArray(data.data)) {
        categoriesData = data.data;
      } else {
        throw new Error("Invalid categories data format");
      }

      const formattedCategories = categoriesData.map((category, index) => {
        const categoryImage = categoryImages[index] || categoryImages[0];

        return {
          id: category.id?.toString() || category.category_id?.toString() || Math.random().toString(),
          name: category.name || category.category_name || "Unnamed Category",
          image: categoryImage,
          originalData: category
        };
      });

      setCategories(formattedCategories);

      if (formattedCategories.length > 0) {
        setSelectedCategory(formattedCategories[0]);
      }

    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories. Please try again.");

      const fallbackCategories = [
        { id: "1", name: "Vegetables", image: carotsImage },
        { id: "2", name: "Meat", image: packbeafImage },
        { id: "3", name: "Beaf", image: yellotomato2Image },
        { id: "4", name: "DairyDay", image: singletomato4Image },
        { id: "5", name: "Grains", image: blackcucumberImage },
      ];
      setCategories(fallbackCategories);
      if (fallbackCategories.length > 0) {
        setSelectedCategory(fallbackCategories[0]);
      }
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchProducts = async (categoryId) => {
    try {
      setLoadingProducts(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/data/products.php?category_id=${categoryId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      let productsData = [];

      if (Array.isArray(data)) {
        productsData = data;
      } else if (data.products && Array.isArray(data.products)) {
        productsData = data.products;
      } else if (data.data && Array.isArray(data.data)) {
        productsData = data.data;
      } else {
        throw new Error("Invalid products data format");
      }

      const formattedProducts = productsData.map(product => ({
        id: product.id?.toString() || product.product_id?.toString() || Math.random().toString(),
        name: product.name || product.product_name || "Unnamed Product",
        price: product.price ? `₦${parseFloat(product.price).toFixed(2)}` : "₦0.00",
        description: product.description,
        originalPrice: parseFloat(product.price) || 0,
        image: product.image_url || product.image
          ? { uri: `${BASE_URL}/${product.image_url || product.image}`.replace(/([^:]\/)\/+/g, "$1") }
          : null,
        details: product.description || product.details || "Fresh produce",
        category_id: product.category_id || categoryId,
        originalData: product
      }));

      setProducts(formattedProducts);
    } catch (err) {
      console.error("Error fetching products:", err);
      // Better error message if the server returns a specific error
      const errorMsg = err.message || "Failed to load products. Please try again.";
      setError(errorMsg);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
  };

  const goToAllCategories = () => {
    navigation.navigate("CategoriesScreen", {
      categories,
      selectedCategory,
      onCategorySelect: handleCategoryPress
    });
  };

  const handleAddToCart = (item) => {
    try {
      const parsePrice = (priceStr) => {
        if (item.originalPrice) return item.originalPrice;

        const cleaned = String(priceStr)
          .replace(/[^\d.,-]/g, "")
          .replace(/,/g, "");
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
      };

      const payload = {
        ...item,
        price: parsePrice(item.price),
        quantity: 1,
        image: item.image || null
      };

      // Add to cart
      addToCart(payload);

      // Show success modal
      setAddedProductName(item.name);
      setShowSuccessModal(true);

      // Clear previous timer if exists
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Auto hide modal after 3 seconds (with OK button)
      timerRef.current = setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);

    } catch (error) {
      console.error("Error in handleAddToCart:", error);
      // Show error modal instead
      setAddedProductName("Error adding to cart");
      setShowSuccessModal(true);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const retryFetch = () => {
    setError(null);
    if (selectedCategory) {
      fetchProducts(selectedCategory.id);
    } else {
      fetchCategories();
    }
  };

  // Function to chunk products into rows of max 3
  const chunkProducts = (productsArray, maxPerRow = 3) => {
    const rows = [];
    for (let i = 0; i < productsArray.length; i += maxPerRow) {
      rows.push(productsArray.slice(i, i + maxPerRow));
    }
    return rows;
  };

  if (loadingCategories) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="green" />
        <Text style={{ marginTop: 10, color: "#666" }}>Loading categories...</Text>
      </View>
    );
  }

  // Calculate card width - show 2 cards visible, but allow up to 3 per row
  const cardWidth = (width - 48) / 2; // 2 cards visible at a time

  // Render product item for horizontal scroll
  const renderProductItem = ({ item }) => (
    <View style={[styles.productCard, { width: cardWidth }]}>
      {item.image ? (
        <Image source={item.image} style={styles.image} />
      ) : (
        <View style={[styles.image, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: '#999', fontSize: 12 }}>No Image</Text>
        </View>
      )}

      {/* Product details - Stacked vertically */}
      <View style={styles.productDetails}>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.price} numberOfLines={1}>{item.price}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description || "Fresh produce"}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddToCart(item)}
      >
        <Text style={{ color: "#34A853", fontSize: 16, fontWeight: 'bold' }}>+</Text>
      </TouchableOpacity>
    </View>
  );

  // Render a row with horizontal scroll (max 3 products)
  const renderProductRow = (rowProducts, rowIndex) => (
    <View key={`row-${rowIndex}`} style={styles.productRow}>
      <FlatList
        horizontal
        data={rowProducts}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        renderItem={renderProductItem}
        contentContainerStyle={styles.horizontalList}
        snapToInterval={cardWidth + 15}
        snapToAlignment="start"
        decelerationRate="fast"
      />
    </View>
  );

  // Chunk products into rows of max 3
  const productRows = chunkProducts(products, 3);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Categories Tabs - Horizontal Scroll */}
      <View style={{ marginBottom: 25, marginTop: 10 }}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item, index }) => {
            const bgColors = ["#E8F5E9", "#F3E5F5", "#FFF3E0", "#E3F2FD", "#FCE4EC"];
            const bgColor = bgColors[index % bgColors.length];
            return (
              <TouchableOpacity
                style={styles.categoryCircleWrapper}
                onPress={() => handleCategoryPress(item)}
              >
                <View style={[
                  styles.categoryCircle,
                  { backgroundColor: bgColor },
                  selectedCategory?.id === item.id && styles.activeCategoryCircle
                ]}>
                  <Image
                    source={item.image}
                    style={styles.categoryCircleImage}
                  />
                </View>
                <Text
                  style={[
                    styles.categoryCircleText,
                    selectedCategory?.id === item.id && styles.activeCategoryCircleText,
                  ]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Products Section Header */}
      <View style={styles.productsHeader}>
        <Text style={styles.productsTitle}>
          {selectedCategory?.name || "All"} Products
        </Text>
        <Text style={styles.productsCount}>
          {products.length} items
        </Text>
      </View>

      {/* Multiple Rows with Horizontal Scroll (max 3 per row) */}
      {loadingProducts ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="green" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : products.length > 0 ? (
        <View style={styles.productsContainer}>
          {productRows.map((rowProducts, rowIndex) =>
            renderProductRow(rowProducts, rowIndex)
          )}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No products available in this category</Text>
          <TouchableOpacity onPress={retryFetch} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Success Modal - EXACTLY like Confirm Order Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccessModal}
        statusBarTranslucent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>


            {/* Overlay for better text visibility */}
            <View style={styles.modalOverlayLayer} />

            {/* Modal Content */}
            <View style={styles.modalInner}>
              <Text style={styles.modalTitle}>Added to Cart!</Text>

              <View style={styles.modalAmountContainer}>
                <Text style={styles.modalAmountLabel}>Product Added</Text>
                <Text style={styles.modalAmount}>{addedProductName}</Text>
              </View>

              <Text style={styles.modalSuccessMessage}>
                The item has been successfully added to your shopping cart.
              </Text>

              <Text style={styles.modalInstruction}>
                You can continue shopping or proceed to checkout.
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={handleCloseModal}
                >
                  <Text style={styles.modalCancelText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },

  // Button at top for full categories
  categoriesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 17,
    paddingHorizontal: 16,
  },
  categoriesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    fontFamily: 'Inter_700Bold'
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#10b981",
  },

  // Error styling
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    marginHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 12,
    flex: 1,
  },
  retryText: {
    color: "#1976d2",
    fontWeight: "bold",
    marginLeft: 10,
  },

  // Categories List
  categoriesList: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },

  // Products Header
  productsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 15,
    marginTop: 10,
  },
  productsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  productsCount: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  // Loading container
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    height: 200,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
  },

  // Products Container
  productsContainer: {
    paddingHorizontal: 0,
  },

  // Product Row
  productRow: {
    marginBottom: 20,
  },

  // Horizontal List
  horizontalList: {
    paddingHorizontal: 16,
    paddingVertical: 5,
  },

  // Product Card - Horizontal Scroll with max 3 per row
  productCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 12,
    marginRight: 15,
    position: "relative",
    height: 190,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 75,
    resizeMode: "contain",
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
  },
  productDetails: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
    lineHeight: 16,
    height: 32,
  },
  price: {
    fontWeight: "bold",
    color: "green",
    fontSize: 15,
    marginBottom: 8,
  },
  description: {
    fontSize: 12,
    color: "#666",
    lineHeight: 14,
    height: 28,
  },

  addButton: {
    backgroundColor: "white",
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 10,
    bottom: 10,
    borderWidth: 1,
    borderColor: "#34A853",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  // Empty state
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    height: 200,
    width: '100%',
  },
  emptyText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  // Category Tabs
  categoryCircleWrapper: {
    alignItems: 'center',
    marginRight: 20,
    width: 70,
  },
  categoryCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeCategoryCircle: {
    borderColor: '#10b981',
    borderWidth: 2,
    transform: [{ scale: 1.1 }],
  },
  categoryCircleImage: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },
  categoryCircleText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
    textAlign: 'center',
  },
  activeCategoryCircleText: {
    color: '#059669',
    fontWeight: '700',
  },


  modalOverlay: {
    flex: 1,
    width: width,
    height: height,
    backgroundColor: 'rgba(34, 33, 33, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    height: '100%',
    maxWidth: 400,
    maxHeight: 500,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  modalBg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  modalOverlayLayer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(29, 28, 28, 0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  modalInner: {
    flex: 1,
    padding: 25,
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  modalAmountContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  modalAmountLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  modalAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#34A853',
    textAlign: 'center',
  },
  modalSuccessMessage: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  modalInstruction: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 25,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});

export default Categories;
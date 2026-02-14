import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "../screens/CartContext"; // Add this import

const BASE_URL = "https://jekfarms.com.ng";
const { width } = Dimensions.get('window');

export default function UserProduct({ navigation, route }) {
  const { searchQuery } = route.params || {}; // Only get searchQuery from params
  const { addToCart } = useCart(); // Use the cart context

  const [searchText, setSearchText] = useState(searchQuery || "");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [highlightedProduct, setHighlightedProduct] = useState(null);
  const [noResults, setNoResults] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all products from backend on component mount
  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Handle search when component mounts with searchQuery or when searchText changes
  useEffect(() => {
    if (allProducts.length > 0) {
      if (searchText.trim() === "") {
        // Show all products if search is empty
        setFilteredProducts(allProducts);
        setHighlightedProduct(null);
        setNoResults(false);
      } else {
        // Perform search
        performSearch(searchText);
      }
    }
  }, [searchText, allProducts]);

  // Update search text when searchQuery param changes
  useEffect(() => {
    if (searchQuery) {
      setSearchText(searchQuery);
    }
  }, [searchQuery]);

  // Fetch all products from backend (all categories)
  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch products using the general endpoint (which now supports paging and categories)
      const response = await fetch(`${BASE_URL}/data/products.php?per_page=100`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "error") {
        throw new Error(data.message || "Server returned an error");
      }

      const productsData = data.products || data.data || [];

      // Format products
      const formattedProducts = productsData.map(product => ({
        id: product.id?.toString() || product.product_id?.toString() || Math.random().toString(),
        name: product.name || product.product_name || "Unnamed Product",
        price: product.price ? `₦${parseFloat(product.price).toFixed(2)}` : "₦0.00",
        description: product.description || "Fresh produce",
        originalPrice: parseFloat(product.price) || 0,
        image: product.image_url || product.image
          ? { uri: `${BASE_URL}/${product.image_url || product.image}`.replace(/([^:]\/)\/+/g, "$1") }
          : null,
        details: product.description || product.details || "Fresh produce",
        category_id: product.category_id,
        category_name: product.category_name,
        originalData: product
      }));

      setAllProducts(formattedProducts);

      // If we have a search query, perform search
      if (searchText && formattedProducts.length > 0) {
        performSearch(searchText);
      } else {
        setFilteredProducts(formattedProducts);
        setNoResults(formattedProducts.length === 0);
      }

    } catch (err) {
      console.error("Error fetching all products:", err);
      setError(err.message || "Failed to load products. Please try again.");
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = (query) => {
    console.log("Performing search for:", query);

    if (!query || query.trim() === "") {
      setFilteredProducts(allProducts);
      setHighlightedProduct(null);
      setNoResults(false);
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    const matched = allProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm)
    );

    console.log("Search results:", matched.length);

    if (matched.length === 0) {
      // No products found
      setNoResults(true);
      setFilteredProducts([]);
      setHighlightedProduct(null);
    } else {
      // Products found
      setNoResults(false);
      setHighlightedProduct(matched[0]);
      setFilteredProducts(matched);
    }
  };

  const handleSearch = (text) => {
    console.log("Typing:", text);
    setSearchText(text);
    // No need to call performSearch here - it will be handled by useEffect
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

      // Add to cart using CartContext
      addToCart(payload);

      Alert.alert("Added to cart", `${item.name} has been added.`);

    } catch (error) {
      console.error("Error in handleAddToCart:", error);
      Alert.alert("Error", "Failed to add to cart. Please try again.");
    }
  };

  const handleProductPress = (product) => {
    navigation.navigate("UserProductDetails", {
      product: product
    });
  };

  const clearSearch = () => {
    setSearchText("");
    // This will trigger useEffect to show all products
  };

  const retryFetch = () => {
    fetchAllProducts();
  };

  const renderProductCard = (item, isHighlighted = false) => {
    const cardWidth = (width - 48) / 2;

    if (isHighlighted) {
      return (
        <TouchableOpacity
          style={styles.highlightedCard}
          onPress={() => handleProductPress(item)}
        >
          {item.image ? (
            <Image
              source={item.image}
              style={styles.highlightImage}
            />
          ) : (
            <View style={[styles.highlightImage, styles.placeholderImage]}>
              <Ionicons name="image-outline" size={40} color="#999" />
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
          <View style={styles.highlightInfo}>
            <Text style={styles.highlightName}>{item.name}</Text>
            <Text style={styles.highlightPrice}>{item.price}</Text>
            <Text style={styles.highlightDesc} numberOfLines={2}>
              {item.description}
            </Text>
            <TouchableOpacity
              style={styles.highlightAddButton}
              onPress={() => handleAddToCart(item)}
            >
              <Text style={styles.addButtonText}>+ Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.productCard, { width: cardWidth }]}
        onPress={() => handleProductPress(item)}
      >
        {item.image ? (
          <Image source={item.image} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Ionicons name="image-outline" size={30} color="#999" />
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}

        <View style={styles.productDetails}>
          <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.price} numberOfLines={1}>{item.price}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAddToCart(item)}
        >
          <Text style={{ color: "#34A853", fontSize: 16, fontWeight: 'bold' }}>+</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.container}>
        {/* Search Bar Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>

          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#757575" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              value={searchText}
              onChangeText={handleSearch}
              autoFocus={true}
              returnKeyType="search"
              onSubmitEditing={() => {
                // Handle enter key press
                if (searchText.trim() !== "") {
                  performSearch(searchText);
                }
              }}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {/* Loading State */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="green" />
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          )}

          {/* Error State */}
          {error && !loading && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={60} color="#ff6b6b" />
              <Text style={styles.errorTitle}>Unable to Load Products</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={retryFetch} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* No Results Message */}
          {!loading && !error && noResults && (
            <View style={styles.noResultsContainer}>
              <Ionicons name="search-outline" size={80} color="#ddd" />
              <Text style={styles.noResultsTitle}>Product Not Found</Text>
              <Text style={styles.noResultsText}>
                Sorry, we couldn't find any products matching "{searchText}"
              </Text>
              <Text style={styles.noResultsSubtext}>
                Try searching for different terms
              </Text>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={clearSearch}
              >
                <Text style={styles.browseButtonText}>View All Products</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Highlighted Product Section */}
          {!loading && !error && !noResults && highlightedProduct && (
            <View style={styles.highlightSection}>
              <Text style={styles.sectionTitle}>Search Result</Text>
              {renderProductCard(highlightedProduct, true)}
            </View>
          )}

          {/* Products Grid */}
          {!loading && !error && !noResults && filteredProducts.length > 0 && (
            <View style={styles.productsSection}>
              <Text style={styles.sectionTitle}>
                {highlightedProduct ? "Other Products" : "All Products"}
                <Text style={styles.productCount}> ({filteredProducts.length})</Text>
              </Text>

              <View style={styles.productsGrid}>
                {filteredProducts
                  .filter(product => !highlightedProduct || product.id !== highlightedProduct.id)
                  .map((item) => renderProductCard(item, false))}
              </View>
            </View>
          )}

          {/* Empty State */}
          {!loading && !error && !noResults && filteredProducts.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="cart-outline" size={80} color="#ddd" />
              <Text style={styles.emptyTitle}>No Products Available</Text>
              <Text style={styles.emptyText}>
                There are no products to display at the moment.
              </Text>
              <TouchableOpacity onPress={retryFetch} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    fontSize: 16,
    color: "#333",
  },
  // Loading Styles
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
  // Error Styles
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  // No Results Styles
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  noResultsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  noResultsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  noResultsSubtext: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
    marginBottom: 10,
  },
  browseButton: {
    backgroundColor: "#10b981",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    elevation: 3,
    marginTop: 10,
  },
  browseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Empty State
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: "#10b981",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Product Styles
  highlightSection: {
    marginBottom: 25,
  },
  highlightedCard: {
    flexDirection: "row",
    backgroundColor: "#e6f9ef",
    borderRadius: 15,
    padding: 15,
    borderWidth: 2,
    borderColor: "#10b981",
    alignItems: "center",
  },
  highlightImage: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginRight: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  highlightInfo: {
    flex: 1,
  },
  highlightName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  highlightPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "green",
    marginBottom: 8,
  },
  highlightDesc: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
    lineHeight: 18,
  },
  highlightAddButton: {
    backgroundColor: "#10b981",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  productsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  productCount: {
    fontSize: 14,
    color: "#666",
    fontWeight: "normal",
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
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
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#999",
    fontSize: 12,
    marginTop: 5,
  },
  productDetails: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
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
});
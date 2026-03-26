import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StatusBar,
  Dimensions,
  Switch
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { TouchableWithoutFeedback } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const BASE_URL = 'https://productionbackend2.agreonpay.com.ng/api';

// Dummy categories fallback
const DUMMY_CATEGORIES = [
  { id: "vegetables", name: "Vegetables" },
  { id: "fruits", name: "Fruits" },
  { id: "grains", name: "Grains" },
  { id: "dairy", name: "Dairy" },
  { id: "meat", name: "Meat" },
  { id: "other", name: "Other" },
];

const ProductsList = () => {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [vendorId, setVendorId] = useState(null);
  const [token, setToken] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    total_pages: 1,
  });

  // Selection
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [categories, setCategories] = useState(DUMMY_CATEGORIES);

  // Edit form fields
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editStockQty, setEditStockQty] = useState('');
  const [editMinOrderQty, setEditMinOrderQty] = useState('');
  const [editPickupLocation, setEditPickupLocation] = useState('');
  const [editIsPerishable, setEditIsPerishable] = useState(false);
  const [editLogisticsPref, setEditLogisticsPref] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editImage, setEditImage] = useState(null);
  const [originalImages, setOriginalImages] = useState([]);

  // Image error state per product
  const [imageErrors, setImageErrors] = useState({});

  // Header logout modal state
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [scaleValue] = useState(new Animated.Value(0));
  const [fadeValue] = useState(new Animated.Value(0));

  // Refresh products when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (vendorId) {
        fetchProducts(vendorId, 1, 10, searchQuery, token);
      }
    }, [vendorId, searchQuery, token])
  );

  useEffect(() => {
    if (showLogoutModal) {
      StatusBar.setHidden(true, 'fade');
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      StatusBar.setHidden(false, 'fade');
      Animated.timing(fadeValue, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
      scaleValue.setValue(0);
    }
  }, [showLogoutModal]);

  // Helper: get token from SecureStore (fallback to AsyncStorage)
  const getToken = async () => {
    let storedToken = await SecureStore.getItemAsync("token");
    if (!storedToken) {
      storedToken = await AsyncStorage.getItem("token");
    }
    return storedToken;
  };

  // Helper: get headers with token
  const getHeaders = async (tokenOverride = null) => {
    const authToken = tokenOverride || (await getToken());
    return {
      'Content-Type': 'application/json',
      ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
    };
  };

  const fetchProducts = async (vendorId, page = 1, perPage = 10, query = '', tokenOverride = null) => {
    try {
      setLoading(true);
      if (!vendorId) return;
      let url = `${BASE_URL}/commerce/vendor/products?vendor_id=${vendorId}&page=${page}&per_page=${perPage}`;
      if (query) url += `&search=${query}`;
      const headers = await getHeaders(tokenOverride);
      const response = await fetch(url, { headers });
      const responseText = await response.text();
      let json;
      try {
        json = JSON.parse(responseText);
      } catch {
        json = { message: responseText };
      }
      if (response.ok) {
        const fetchedProducts = (json.data || []).map(product => {
          const imageUrl = product.images?.find(img => img.is_primary)?.image_url || product.images?.[0]?.image_url || null;
          return {
            ...product,
            selected: false,
            imageUrl,
          };
        });
        setProducts(fetchedProducts);
        setImageErrors({});
        setPagination({
          current_page: json.current_page || 1,
          total: json.total || 0,
          total_pages: Math.ceil((json.total || 0) / perPage),
        });
        setError(null);
        setSelectedProducts([]);
        setIsSelectionMode(false);
      } else {
        throw new Error(json.message || 'Failed to fetch products');
      }
    } catch (err) {
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Get token from SecureStore (fallback to AsyncStorage)
        const tokenStr = await getToken();
        if (!tokenStr) {
          setError('Authentication required. Please login again.');
          setLoading(false);
          // Optionally redirect to Login
          navigation.replace('Login');
          return;
        }
        setToken(tokenStr);

        // 2. Get user data
        const userDataStr = await AsyncStorage.getItem('user');
        if (!userDataStr) {
          setError('No user data. Please login again.');
          setLoading(false);
          navigation.replace('Login');
          return;
        }
        const user = JSON.parse(userDataStr);
        const foundId = user.id || user.user_id || user.farmer_id || user.uid;
        if (foundId) {
          setVendorId(foundId.toString());
          await fetchProducts(foundId.toString(), 1, 10, '', tokenStr);
        } else {
          setError('Vendor ID not found');
        }
      } catch (err) {
        console.error("Load data error:", err);
        setError('Failed to load user data');
      }
      // Load categories (optional, don't block UI)
      fetchCategories();
    };
    loadData();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://jekfarms.com.ng/data/categories.php');
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.warn('Categories response is not JSON, using dummy categories.');
        return; // keep existing dummy categories
      }
      if (data.status === 'success' && data.categories?.length) {
        setCategories(data.categories.map(cat => ({ id: cat.id.toString(), name: cat.name })));
      } else {
        console.warn('Categories API returned unexpected data, using dummy categories.');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Keep the existing dummy categories – no alert needed
    }
  };

  const toggleProductSelection = (productId) => {
    const updated = products.map(p => p.id === productId ? { ...p, selected: !p.selected } : p);
    setProducts(updated);
    setSelectedProducts(updated.filter(p => p.selected));
    setIsSelectionMode(updated.some(p => p.selected));
  };

  const selectAllProducts = () => {
    const updated = products.map(p => ({ ...p, selected: true }));
    setProducts(updated);
    setSelectedProducts(updated);
    setIsSelectionMode(true);
  };

  const clearAllSelections = () => {
    const updated = products.map(p => ({ ...p, selected: false }));
    setProducts(updated);
    setSelectedProducts([]);
    setIsSelectionMode(false);
  };

  const handleDeleteProducts = () => {
    if (!vendorId || selectedProducts.length === 0) return;
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      const results = await Promise.all(
        selectedProducts.map(async (product) => {
          try {
            const url = `${BASE_URL}/commerce/vendor/products/${product.id}?vendor_id=${vendorId}`;
            const headers = await getHeaders();
            const response = await fetch(url, {
              method: 'DELETE',
              headers,
            });
            const json = await response.json();
            return { productId: product.id, success: response.ok, message: json.message };
          } catch {
            return { productId: product.id, success: false };
          }
        })
      );
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success);
      if (failed.length === 0) {
        Alert.alert('Success', `${successful} product(s) deleted.`);
      } else {
        Alert.alert('Partial Success', `${successful} deleted, ${failed.length} failed.`);
      }
      fetchProducts(vendorId, pagination.current_page, 10, searchQuery, token);
      setShowDeleteModal(false);
    } catch {
      Alert.alert('Error', 'Failed to delete products.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    if (selectedProducts.length !== 1) {
      Alert.alert('Info', 'Select exactly one product to edit.');
      return;
    }
    const p = selectedProducts[0];
    setEditingProduct(p);
    setEditName(p.name || '');
    setEditDescription(p.description || '');
    setEditPrice(p.price?.toString() || '');
    setEditUnit(p.unit || '');
    setEditStockQty(p.stock_quantity?.toString() || '');
    setEditMinOrderQty(p.min_order_quantity?.toString() || '');
    setEditPickupLocation(p.pickup_location || '');
    setEditIsPerishable(p.is_perishable || false);
    setEditLogisticsPref(p.logistics_preference || '');
    setEditCategory(p.category || '');
    setOriginalImages(p.images || []);
    setEditImage(null);
    setShowEditModal(true);
  };

  const pickEditImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Enable gallery access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets) {
      setEditImage(result.assets[0]);
    }
  };

  // Simulated image upload – replace with actual upload logic
  const uploadImageToServer = async (uri) => {
    return new Promise(resolve => setTimeout(() => resolve('https://storage.provider/updated.jpg'), 500));
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct || !vendorId || !token) return;

    if (!editName || !editPrice || !editCategory || !editUnit) {
      Alert.alert('Error', 'Name, price, category, and unit are required.');
      return;
    }

    setEditLoading(true);
    try {
      let updatedImages = [...originalImages];
      if (editImage) {
        const newUrl = await uploadImageToServer(editImage.uri);
        updatedImages = [{ url: newUrl, is_primary: true }];
      }

      const payload = {
        name: editName,
        description: editDescription || '',
        category: editCategory,
        price: parseFloat(editPrice),
        unit: editUnit,
        stock_quantity: parseFloat(editStockQty) || 0,
        min_order_quantity: parseInt(editMinOrderQty) || 1,
        pickup_location: editPickupLocation || undefined,
        is_perishable: editIsPerishable,
        logistics_preference: editLogisticsPref || undefined,
        images: updatedImages,
        vendor_id: vendorId,
      };

      const url = `${BASE_URL}/commerce/vendor/products/${editingProduct.id}`;
      const headers = await getHeaders();
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });

      const json = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Product updated!');
        setShowEditModal(false);
        fetchProducts(vendorId, pagination.current_page, 10, searchQuery, token);
      } else {
        Alert.alert('Error', json.message || 'Update failed.');
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    if (vendorId) fetchProducts(vendorId, 1, 10, searchQuery, token).finally(() => setRefreshing(false));
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (vendorId) fetchProducts(vendorId, 1, 10, query, token);
  };

  const loadMore = () => {
    if (!loading && pagination.current_page < pagination.total_pages && vendorId) {
      fetchProducts(vendorId, pagination.current_page + 1, 10, searchQuery, token);
    }
  };

  const handleLogoutPress = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['user', 'token']);
      await SecureStore.deleteItemAsync('token'); // Also delete from SecureStore
      navigation.reset({
        index: 0,
        routes: [{ name: 'AuthLoading' }],
      });
    } catch (err) {
      console.error("Logout error:", err);
      setShowLogoutModal(false);
    }
  };

  const cancelLogout = () => {
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeValue, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowLogoutModal(false);
    });
  };

  const renderProduct = ({ item }) => {
    const hasError = imageErrors[item.id];
    const stockInt = parseInt(item.stock_quantity, 10);
    return (
      <TouchableOpacity
        style={[styles.productCard, item.selected && styles.selectedProductCard]}
        onLongPress={() => toggleProductSelection(item.id)}
        delayLongPress={300}
      >
        <TouchableOpacity style={styles.checkboxContainer} onPress={() => toggleProductSelection(item.id)}>
          <View style={[styles.checkbox, item.selected && styles.checkboxSelected]}>
            {item.selected && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
        </TouchableOpacity>

        <View style={styles.imageContainer}>
          {item.imageUrl && !hasError ? (
            <Image
              style={styles.productImage}
              source={{ uri: item.imageUrl, headers: { Authorization: `Bearer ${token}` } }}
              contentFit="cover"
              onError={() => setImageErrors(prev => ({ ...prev, [item.id]: true }))}
            />
          ) : (
            <View style={[styles.productImage, styles.noImageContainer]}>
              <Text style={styles.noImageText}>No Image</Text>
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.productDescription} numberOfLines={2}>{item.description}</Text>
          <View style={styles.detailsRow}>
            <Text style={styles.detailItem}>₦{item.price}</Text>
            <Text style={styles.detailItem}>Unit: {item.unit}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailItem}>Stock: {isNaN(stockInt) ? '0' : stockInt}</Text>
            <Text style={styles.detailItem}>Min Qty: {item.min_order_quantity}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={[styles.detailItem, item.is_perishable ? styles.perishableYes : styles.perishableNo]}>
              {item.is_perishable ? 'Perishable' : 'Non-perishable'}
            </Text>
          </View>
        </View>

        <View style={styles.productCode}>
          <Text style={styles.codeText}>ID: {item.id}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !products.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  if (error && !products.length) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Selection Bar */}
      {isSelectionMode && (
        <View style={styles.selectionBar}>
          <View style={styles.selectionInfo}>
            <Text style={styles.selectionCount}>{selectedProducts.length} selected</Text>
            <TouchableOpacity onPress={clearAllSelections}><Text style={styles.clearSelectionText}>Clear</Text></TouchableOpacity>
          </View>
          <View style={styles.selectionActions}>
            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDeleteProducts} disabled={deleteLoading}>
              {deleteLoading ? <ActivityIndicator size="small" color="#fff" /> : <><Ionicons name="trash-outline" size={18} color="#fff" /><Text style={styles.actionButtonText}>Delete</Text></>}
            </TouchableOpacity>
            {selectedProducts.length === 1 && (
              <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleEditProduct(selectedProducts[0])}>
                <Ionicons name="create-outline" size={18} color="#fff" /><Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput style={styles.searchInput} placeholder="Search products..." value={searchQuery} onChangeText={handleSearch} />
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsText}>{pagination.total} product(s) found</Text>
          <Text style={styles.pageText}>Page {pagination.current_page} of {pagination.total_pages}</Text>
        </View>
      </View>

      {/* Select All */}
      {!isSelectionMode && products.length > 0 && (
        <TouchableOpacity style={styles.selectAllButton} onPress={selectAllProducts}>
          <Ionicons name="checkbox-outline" size={20} color="#10b981" /><Text style={styles.selectAllText}>Select All</Text>
        </TouchableOpacity>
      )}

      {/* List */}
      {products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={64} color="#6b7280" />
          <Text style={styles.emptyText}>No products found</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Ionicons name="refresh" size={20} color="#fff" /><Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={item => item.id.toString()}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={loading && pagination.current_page > 1 ? <ActivityIndicator /> : null}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Edit Modal */}
      <Modal visible={showEditModal} transparent animationType="slide" onRequestClose={() => !editLoading && setShowEditModal(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.editModalContent}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Edit Product</Text>
              <TouchableOpacity onPress={() => !editLoading && setShowEditModal(false)} disabled={editLoading}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.editFormScroll}>
              <View style={styles.editForm}>
                {/* Name */}
                <View style={styles.editInputGroup}>
                  <Text style={styles.editLabel}>Product Name *</Text>
                  <TextInput style={styles.editInput} value={editName} onChangeText={setEditName} />
                </View>
                {/* Category */}
                <View style={styles.editInputGroup}>
                  <Text style={styles.editLabel}>Category *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.categoryButtons}>
                      {categories.map(cat => (
                        <TouchableOpacity
                          key={cat.id}
                          style={[styles.categoryButton, editCategory === cat.id && styles.categoryButtonSelected]}
                          onPress={() => setEditCategory(cat.id)}
                        >
                          <Text style={[styles.categoryButtonText, editCategory === cat.id && styles.categoryButtonTextSelected]}>{cat.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
                {/* Unit */}
                <View style={styles.editInputGroup}>
                  <Text style={styles.editLabel}>Unit *</Text>
                  <TextInput style={styles.editInput} value={editUnit} onChangeText={setEditUnit} placeholder="e.g. basket" />
                </View>
                {/* Price */}
                <View style={styles.editInputGroup}>
                  <Text style={styles.editLabel}>Price (₦) *</Text>
                  <TextInput style={styles.editInput} value={editPrice} onChangeText={setEditPrice} keyboardType="decimal-pad" />
                </View>
                {/* Stock Quantity */}
                <View style={styles.editInputGroup}>
                  <Text style={styles.editLabel}>Stock Quantity *</Text>
                  <TextInput style={styles.editInput} value={editStockQty} onChangeText={setEditStockQty} keyboardType="numeric" />
                </View>
                {/* Min Order Qty */}
                <View style={styles.editInputGroup}>
                  <Text style={styles.editLabel}>Min Order Quantity *</Text>
                  <TextInput style={styles.editInput} value={editMinOrderQty} onChangeText={setEditMinOrderQty} keyboardType="numeric" />
                </View>
                {/* Pickup Location */}
                <View style={styles.editInputGroup}>
                  <Text style={styles.editLabel}>Pickup Location</Text>
                  <TextInput style={styles.editInput} value={editPickupLocation} onChangeText={setEditPickupLocation} />
                </View>
                {/* Is Perishable */}
                <View style={styles.editInputGroup}>
                  <Text style={styles.editLabel}>Perishable?</Text>
                  <View style={styles.switchContainer}>
                    <Text>No</Text>
                    <Switch value={editIsPerishable} onValueChange={setEditIsPerishable} trackColor={{ false: "#767577", true: "#22C55E" }} />
                    <Text>Yes</Text>
                  </View>
                </View>
                {/* Logistics Preference */}
                <View style={styles.editInputGroup}>
                  <Text style={styles.editLabel}>Logistics Preference</Text>
                  <TextInput style={styles.editInput} value={editLogisticsPref} onChangeText={setEditLogisticsPref} placeholder="e.g. cold_truck" />
                </View>
                {/* Description */}
                <View style={styles.editInputGroup}>
                  <Text style={styles.editLabel}>Description</Text>
                  <TextInput style={[styles.editInput, styles.editTextArea]} value={editDescription} onChangeText={setEditDescription} multiline />
                </View>
                {/* Image */}
                <View style={styles.editInputGroup}>
                  <Text style={styles.editLabel}>Product Image</Text>
                  <TouchableOpacity style={styles.editImageUploadBox} onPress={pickEditImage}>
                    {editImage ? (
                      <>
                        <Image source={{ uri: editImage.uri }} style={styles.editImagePreview} />
                        <View style={styles.editImageOverlay}><Ionicons name="camera" size={24} color="#fff" /><Text style={styles.changeImageText}>Change</Text></View>
                      </>
                    ) : originalImages.length > 0 ? (
                      <>
                        <Image source={{ uri: originalImages.find(i => i.is_primary)?.image_url || originalImages[0]?.image_url }} style={styles.editImagePreview} />
                        <View style={styles.editImageOverlay}><Ionicons name="camera" size={24} color="#fff" /><Text style={styles.changeImageText}>Change</Text></View>
                      </>
                    ) : (
                      <>
                        <Ionicons name="image-outline" size={40} color="#90CAF9" />
                        <Text style={styles.uploadText}>Tap to select new image</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
            <View style={styles.editModalFooter}>
              <TouchableOpacity style={[styles.editButton, styles.cancelEditButton]} onPress={() => setShowEditModal(false)} disabled={editLoading}>
                <Text style={styles.cancelEditButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.editButton, styles.updateButton]} onPress={handleUpdateProduct} disabled={editLoading}>
                {editLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.updateButtonText}>Update</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={() => !deleteLoading && setShowDeleteModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="warning-outline" size={48} color="#ef4444" />
            <Text style={styles.modalTitle}>Delete Products</Text>
            <Text style={styles.modalMessage}>Delete {selectedProducts.length} product(s)? This cannot be undone.</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelModalButton]} onPress={() => setShowDeleteModal(false)} disabled={deleteLoading}>
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.confirmModalButton]} onPress={confirmDelete} disabled={deleteLoading}>
                {deleteLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmModalButtonText}>Delete</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Styles – exactly as in your original file (unchanged)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Selection Bar
  selectionBar: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  selectionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectionCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  clearSelectionText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
  selectionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  editButton: {
    backgroundColor: '#3b82f6', // blue
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Product Card
  productCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#fff',
  },
  selectedProductCard: {
    backgroundColor: '#f0f9ff',
  },
  checkboxContainer: {
    marginRight: 12,
    marginTop: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  imageContainer: {
    marginRight: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  noImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
  },
  noImageText: {
    fontSize: 12,
    color: '#6b7280',
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
    minWidth: 180,
    padding: 4,
    borderRadius: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 18,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  detailItem: {
    fontSize: 12,
    color: '#374151',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
  },
  productCode: {
    alignItems: 'flex-end',
  },
  codeText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  // Search Container
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 8,
  },
  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsText: {
    fontSize: 14,
    color: '#6b7280',
  },
  pageText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  // Select All Button
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 8,
  },
  selectAllText: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '600',
  },
  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#10b981',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 8,
    marginTop: 16,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  refreshText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  // Edit Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  editModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  editFormScroll: {
    maxHeight: 500,
  },
  editForm: {
    padding: 20,
  },
  editInputGroup: {
    marginBottom: 20,
  },
  editLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '500',
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111',
  },
  editTextArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  categoryButtonSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  categoryButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  // Edit Image Upload
  editImageUploadBox: {
    height: 150,
    borderWidth: 2,
    borderColor: '#90CAF9',
    borderStyle: 'dashed',
    borderRadius: 10,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  editImagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  editImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeImageText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  uploadText: {
    color: '#1976D2',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  // Edit Modal Footer
  editModalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  editButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelEditButton: {
    backgroundColor: '#ef4444',
  },
  cancelEditButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  updateButton: {
    backgroundColor: '#22C55E',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  // Delete Modal Styles
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelModalButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelModalButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmModalButton: {
    backgroundColor: '#ef4444',
  },
  confirmModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  perishableYes: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  perishableNo: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
});

export default ProductsList;
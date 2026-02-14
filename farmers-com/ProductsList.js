import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_items: 0,
    items_per_page: 10,
    total_pages: 1
  });

  // Selection state
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Edit state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // Edit form fields
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editImage, setEditImage] = useState(null);
  const [originalImageUrl, setOriginalImageUrl] = useState('');

  const API_URL = 'https://jekfarms.com.ng/farmerinterface/inventory/list.php';
  const DELETE_API_URL = 'https://jekfarms.com.ng/farmerinterface/inventory/delete.php';
  const UPDATE_API_URL = 'https://jekfarms.com.ng/farmerinterface/inventory/update.php';
  const CATEGORIES_API_URL = 'https://jekfarms.com.ng/data/categories.php';

  // Get user ID from AsyncStorage
  useEffect(() => {
    const getUserId = async () => {
      try {
        const userDataStr = await AsyncStorage.getItem('user');
        if (userDataStr) {
          try {
            const userData = JSON.parse(userDataStr);

            let foundId = null;
            if (userData.id) {
              foundId = userData.id.toString();
            } else if (userData.user_id) {
              foundId = userData.user_id.toString();
            } else if (userData.farmer_id) {
              foundId = userData.farmer_id.toString();
            }

            if (foundId) {
              setUserId(foundId);
              fetchProducts(foundId, 1, 10, '');
              fetchCategories();
            } else {
              setError('User ID not found in user data');
              setLoading(false);
            }
          } catch (parseError) {
            console.error('Error parsing user data:', parseError);
            setError('Invalid user data format');
            setLoading(false);
          }
        } else {
          setError('No user data found. Please login again.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error getting user ID:', err);
        setError('Failed to load user information');
        setLoading(false);
      }
    };

    getUserId();
  }, []);

  const fetchProducts = async (userId, page = 1, perPage = 10, query = '') => {
    try {
      setLoading(true);

      let url = `${API_URL}?farmer_id=${userId}&page=${page}&per_page=${perPage}`;

      if (query) {
        url += `&search=${query}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'success') {
        const processedProducts = (data.data.products || []).map(product => {
          let imageUrl = null;

          if (product.image_url && typeof product.image_url === 'string' && product.image_url.trim() !== '') {
            const imgValue = product.image_url.trim();
            const cleanImgValue = imgValue.startsWith('/') ? imgValue.substring(1) : imgValue;
            imageUrl = `https://jekfarms.com.ng/${cleanImgValue}`;
          }

          return {
            ...product,
            imageUrl: imageUrl,
            selected: false
          };
        });

        setProducts(processedProducts);
        setPagination(data.data.pagination || {
          current_page: 1,
          total_items: 0,
          items_per_page: 10,
          total_pages: 1
        });
        setError(null);

        setSelectedProducts([]);
        setIsSelectionMode(false);

        return processedProducts;
      } else {
        throw new Error(data.message || 'Failed to fetch products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      setProducts([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(CATEGORIES_API_URL);
      const data = await response.json();

      if (data.status === 'success' && data.categories && Array.isArray(data.categories)) {
        // Extract just id and name for the category selection
        const simplifiedCategories = data.categories.map(cat => ({
          id: cat.id.toString(),
          name: cat.name
        }));
        setCategories(simplifiedCategories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Handle product selection
  const toggleProductSelection = (productId) => {
    const updatedProducts = products.map(product => {
      if (product.id === productId) {
        return { ...product, selected: !product.selected };
      }
      return product;
    });

    setProducts(updatedProducts);

    const selected = updatedProducts.filter(product => product.selected);
    setSelectedProducts(selected);
    setIsSelectionMode(selected.length > 0);
  };

  // Select all products
  const selectAllProducts = () => {
    const updatedProducts = products.map(product => ({
      ...product,
      selected: true
    }));

    setProducts(updatedProducts);
    setSelectedProducts(updatedProducts);
    setIsSelectionMode(true);
  };

  // Clear all selections
  const clearAllSelections = () => {
    const updatedProducts = products.map(product => ({
      ...product,
      selected: false
    }));

    setProducts(updatedProducts);
    setSelectedProducts([]);
    setIsSelectionMode(false);
  };

  // Handle edit product
  const handleEditProduct = (product) => {
    // Only allow editing one product at a time
    if (selectedProducts.length !== 1) {
      Alert.alert('Info', 'Please select only one product to edit');
      return;
    }

    const productToEdit = selectedProducts[0];
    setEditingProduct(productToEdit);

    // Populate edit form with current values
    setEditName(productToEdit.name || '');
    setEditDescription(productToEdit.description || '');
    setEditPrice(productToEdit.price || '');
    setEditStock(productToEdit.stock || productToEdit.stock_availability || '');
    setEditCategory(productToEdit.category_id || '');
    setEditImage(null);
    setOriginalImageUrl(productToEdit.imageUrl || '');

    setShowEditModal(true);
  };

  // Image picker for edit
  const pickEditImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'Enable gallery access to upload an image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        aspect: undefined,
        quality: 0.8,
        selectionLimit: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setEditImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct || !userId) {
      Alert.alert('Error', 'Product information missing');
      return;
    }

    // Validate required fields
    if (!editName || !editPrice || !editCategory) {
      Alert.alert('Error', 'Product name, price, and category are required.');
      return;
    }

    if (!editStock || isNaN(editStock) || parseInt(editStock) <= 0) {
      Alert.alert('Error', 'Please enter a valid stock quantity.');
      return;
    }

    setEditLoading(true);

    try {
      // Create JSON payload - ensure IDs are correct
      console.log('=== DEBUG: Update Payload ===');
      console.log('Editing Product ID:', editingProduct.id);
      console.log('User ID:', userId);
      console.log('Edit Category:', editCategory);
      console.log('Edit Category Type:', typeof editCategory);

      const payload = {
        farmer_id: parseInt(userId),
        product_id: editingProduct.id,
        product_name: editName,
        description: editDescription || '',
        price: parseFloat(editPrice),
        stock_quantity: parseInt(editStock),
        category: editCategory.toString(), // Ensure it's string
      };

      console.log('Sending JSON payload:', payload);
      console.log('To URL:', UPDATE_API_URL);

      const response = await fetch(UPDATE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('Update response:', result);

      if (result.status === 'success') {
        Alert.alert(
          '✅ Success',
          'Product updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                setShowEditModal(false);
                fetchProducts(userId, 1, 10, searchQuery);
              }
            }
          ]
        );
      } else {
        Alert.alert(
          '❌ Error',
          result.message || 'Failed to update product. Please try again.'
        );
      }
    } catch (error) {
      console.error('Error updating product:', error);
      Alert.alert('Error', `Failed to connect to server: ${error.message}`);
    } finally {
      setEditLoading(false);
    }
  };

  // Handle delete products (existing function)
  const handleDeleteProducts = async () => {
    if (!userId || selectedProducts.length === 0) {
      Alert.alert('Error', 'No products selected');
      return;
    }

    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);

    try {
      console.log('=== DEBUG: Delete Process ===');
      console.log('Selected products:', selectedProducts.length);
      console.log('User ID:', userId);

      const deletePromises = selectedProducts.map(async (product) => {
        try {
          console.log(`\n=== Deleting: ${product.name} (ID: ${product.id}) ===`);
          console.log('Product details:', {
            id: product.id,
            name: product.name,
            farmer_id: userId
          });

          const payload = {
            farmer_id: parseInt(userId), // Ensure it's number
            product_id: parseInt(product.id) // Ensure it's number
          };

          console.log('Delete payload:', payload);

          const response = await fetch(DELETE_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          console.log('Response status:', response.status);

          const result = await response.json();
          console.log('Delete result:', result);

          return {
            productId: product.id,
            productName: product.name,
            success: result.status === 'success',
            message: result.message || 'No message',
          };

        } catch (error) {
          console.error(`Error deleting ${product.name}:`, error);
          return {
            productId: product.id,
            productName: product.name,
            success: false,
            message: error.message || 'Network error',
          };
        }
      });

      const deleteResults = await Promise.all(deletePromises);
      const successfulDeletes = deleteResults.filter(r => r.success);
      const failedDeletes = deleteResults.filter(r => !r.success);

      console.log('=== Delete Summary ===');
      console.log('Total:', deleteResults.length);
      console.log('Successful:', successfulDeletes.length);
      console.log('Failed:', failedDeletes.length);
      console.log('Failed details:', failedDeletes);

      if (failedDeletes.length === 0) {
        Alert.alert(
          'Success',
          `${successfulDeletes.length} product(s) deleted successfully`,
          [
            {
              text: 'OK',
              onPress: () => {
                fetchProducts(userId, 1, 10, searchQuery);
                setShowDeleteModal(false);
              }
            }
          ]
        );
      } else if (successfulDeletes.length > 0) {
        const failedNames = failedDeletes.map(p => p.productName).join(', ');
        Alert.alert(
          'Partial Success',
          `${successfulDeletes.length} product(s) deleted successfully, but ${failedDeletes.length} failed: ${failedNames}`,
          [
            {
              text: 'OK',
              onPress: () => {
                fetchProducts(userId, 1, 10, searchQuery);
                setShowDeleteModal(false);
              }
            }
          ]
        );
      } else {
        // Try one more thing: check if IDs need to be strings
        console.log('Trying with string IDs instead of numbers...');

        const retryPayload = {
          farmer_id: userId.toString(), // Try as string
          product_id: selectedProducts[0].id.toString() // Try as string
        };

        console.log('Retry payload (strings):', retryPayload);

        const retryResponse = await fetch(DELETE_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(retryPayload),
        });

        const retryResult = await retryResponse.json();
        console.log('Retry result:', retryResult);

        if (retryResult.status === 'success') {
          Alert.alert(
            'Success',
            'Product deleted successfully!',
            [
              {
                text: 'OK',
                onPress: () => {
                  fetchProducts(userId, 1, 10, searchQuery);
                  setShowDeleteModal(false);
                }
              }
            ]
          );
        } else {
          Alert.alert(
            'Error',
            `Failed to delete product: ${retryResult.message || 'Unknown error'}`,
            [
              {
                text: 'OK',
                onPress: () => setShowDeleteModal(false)
              }
            ]
          );
        }
      }

    } catch (err) {
      console.error('Error in delete process:', err);
      Alert.alert('Error', 'Failed to delete products. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (userId) {
      await fetchProducts(userId, 1, 10, searchQuery);
    }
    setRefreshing(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (userId) {
      fetchProducts(userId, 1, 10, query);
    }
  };

  const loadMore = () => {
    if (!loading && pagination.current_page < pagination.total_pages && userId) {
      const nextPage = pagination.current_page + 1;
      fetchProducts(userId, nextPage, pagination.items_per_page, searchQuery);
    }
  };

  const renderProduct = ({ item }) => {
    return (
      <TouchableOpacity
        style={[
          styles.productCard,
          item.selected && styles.selectedProductCard
        ]}
        onLongPress={() => toggleProductSelection(item.id)}
        delayLongPress={300}
      >
        {/* Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => toggleProductSelection(item.id)}
        >
          <View style={[
            styles.checkbox,
            item.selected && styles.checkboxSelected
          ]}>
            {item.selected && (
              <Ionicons name="checkmark" size={14} color="#fff" />
            )}
          </View>
        </TouchableOpacity>

        {/* Product Image */}
        <View style={styles.imageContainer}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.productImage, styles.noImageContainer]}>
              <Text style={styles.noImageText}>No Image</Text>
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.name || 'Unnamed Product'}
          </Text>

          <Text style={styles.productDescription} numberOfLines={2}>
            {item.description || 'No description available'}
          </Text>

          <View style={styles.detailsRow}>
            <Text style={styles.detailItem}>Price: ₦{item.price ? parseFloat(item.price).toFixed(2) : '0.00'}</Text>
            <Text style={styles.detailItem}>Stock: {item.stock || '0'}</Text>
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.detailItem}>Status: {item.status || 'Unknown'}</Text>
            <Text style={[styles.detailItem,
            item.status === 'active' ? styles.statusActive : styles.statusInactive
            ]}>
              {item.status === 'active' ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        <View style={styles.productCode}>
          <Text style={styles.codeText}>ID: {item.id}</Text>
          <Text style={styles.createdDate}>
            {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (loading && pagination.current_page > 1) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color="#0000ff" />
          <Text style={styles.loadingText}>Loading more...</Text>
        </View>
      );
    }
    return null;
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
      {/* Selection Action Bar */}
      {isSelectionMode && (
        <View style={styles.selectionBar}>
          <View style={styles.selectionInfo}>
            <Text style={styles.selectionCount}>
              {selectedProducts.length} selected
            </Text>
            <TouchableOpacity onPress={clearAllSelections}>
              <Text style={styles.clearSelectionText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.selectionActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDeleteProducts}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                  <Text style={styles.actionButtonText}>Delete</Text>
                </>
              )}
            </TouchableOpacity>

            {selectedProducts.length === 1 && (
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => handleEditProduct(selectedProducts[0])}
              >
                <Ionicons name="create-outline" size={18} color="#fff" />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Search and Product Count */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsText}>
            {pagination.total_items} product{pagination.total_items !== 1 ? 's' : ''} found
          </Text>
          <Text style={styles.pageText}>
            Page {pagination.current_page} of {pagination.total_pages}
          </Text>
        </View>
      </View>

      {/* Select All Button */}
      {!isSelectionMode && products.length > 0 && (
        <TouchableOpacity
          style={styles.selectAllButton}
          onPress={selectAllProducts}
        >
          <Ionicons name="checkbox-outline" size={20} color="#10b981" />
          <Text style={styles.selectAllText}>Select All</Text>
        </TouchableOpacity>
      )}

      {/* Products List */}
      {products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={64} color="#6b7280" />
          <Text style={styles.emptyText}>No products found</Text>
          <Text style={styles.emptySubtext}>
            {searchQuery ? 'Try a different search term' : 'Add your first product to get started'}
          </Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Ionicons name="refresh" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Edit Product Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => !editLoading && setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.editModalContent}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Edit Product</Text>
              <TouchableOpacity
                onPress={() => !editLoading && setShowEditModal(false)}
                disabled={editLoading}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.editFormScroll}>
              <View style={styles.editForm}>
                {/* Product Name */}
                <View style={styles.editInputGroup}>
                  <Text style={styles.editLabel}>Product Name *</Text>
                  <TextInput
                    style={styles.editInput}
                    placeholder="Enter product name"
                    value={editName}
                    onChangeText={setEditName}
                  />
                </View>

                {/* Category */}
                <View style={styles.editInputGroup}>
                  <Text style={styles.editLabel}>Category *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.categoryButtons}>
                      {categories.map(category => (
                        <TouchableOpacity
                          key={category.id}
                          style={[
                            styles.categoryButton,
                            editCategory === category.id && styles.categoryButtonSelected
                          ]}
                          onPress={() => setEditCategory(category.id)}
                        >
                          <Text style={[
                            styles.categoryButtonText,
                            editCategory === category.id && styles.categoryButtonTextSelected
                          ]}>
                            {category.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                  <TextInput
                    style={[styles.editInput, { marginTop: 8 }]}
                    placeholder="Or enter category ID"
                    value={editCategory}
                    onChangeText={setEditCategory}
                    keyboardType="numeric"
                  />
                </View>

                {/* Image */}
                <View style={styles.editInputGroup}>
                  <Text style={styles.editLabel}>Product Image</Text>
                  <TouchableOpacity style={styles.editImageUploadBox} onPress={pickEditImage}>
                    {editImage ? (
                      <>
                        <Image source={{ uri: editImage.uri }} style={styles.editImagePreview} />
                        <View style={styles.editImageOverlay}>
                          <Ionicons name="camera" size={24} color="#fff" />
                          <Text style={styles.changeImageText}>Change Image</Text>
                        </View>
                      </>
                    ) : originalImageUrl ? (
                      <>
                        <Image source={{ uri: originalImageUrl }} style={styles.editImagePreview} />
                        <View style={styles.editImageOverlay}>
                          <Ionicons name="camera" size={24} color="#fff" />
                          <Text style={styles.changeImageText}>Change Image</Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <Ionicons name="image-outline" size={40} color="#90CAF9" />
                        <Text style={styles.uploadText}>Tap to select new image</Text>
                        <Text style={styles.uploadSubtext}>Optional - Keep existing if not changed</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Description */}
                <View style={styles.editInputGroup}>
                  <Text style={styles.editLabel}>Description</Text>
                  <TextInput
                    style={[styles.editInput, styles.editTextArea]}
                    placeholder="Product description (optional)"
                    multiline
                    numberOfLines={4}
                    value={editDescription}
                    onChangeText={setEditDescription}
                  />
                </View>

                {/* Price */}
                <View style={styles.editInputGroup}>
                  <Text style={styles.editLabel}>Price (₦) *</Text>
                  <TextInput
                    style={styles.editInput}
                    placeholder="e.g., 300.00"
                    keyboardType="decimal-pad"
                    value={editPrice}
                    onChangeText={(text) => {
                      const cleaned = text.replace(/[^0-9.]/g, '');
                      const parts = cleaned.split('.');
                      if (parts.length > 2) {
                        setEditPrice(parts[0] + '.' + parts.slice(1).join(''));
                      } else {
                        setEditPrice(cleaned);
                      }
                    }}
                  />
                </View>

                {/* Stock */}
                <View style={styles.editInputGroup}>
                  <Text style={styles.editLabel}>Stock Availability *</Text>
                  <TextInput
                    style={styles.editInput}
                    placeholder="e.g., 10"
                    keyboardType="numeric"
                    value={editStock}
                    onChangeText={(text) => {
                      const cleaned = text.replace(/[^0-9]/g, '');
                      setEditStock(cleaned);
                    }}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.editModalFooter}>
              <TouchableOpacity
                style={[styles.editButton, styles.cancelEditButton]}
                onPress={() => !editLoading && setShowEditModal(false)}
                disabled={editLoading}
              >
                <Text style={styles.cancelEditButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.editButton, styles.updateButton]}
                onPress={handleUpdateProduct}
                disabled={editLoading}
              >
                {editLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.updateButtonText}>Update Product</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => !deleteLoading && setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="warning-outline" size={48} color="#ef4444" />
            <Text style={styles.modalTitle}>Delete Products</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete {selectedProducts.length} selected product(s)? This action cannot be undone.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => !deleteLoading && setShowDeleteModal(false)}
                disabled={deleteLoading}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmModalButton]}
                onPress={confirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmModalButtonText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Selection Bar Styles
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
    backgroundColor: '#113f88ff',
    color: '#0b18ccff'
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
    marginRight: 12,
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
  },
  detailItem: {
    fontSize: 12,
    color: '#374151',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusActive: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  statusInactive: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  productCode: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  codeText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  createdDate: {
    fontSize: 11,
    color: '#9ca3af',
    fontStyle: 'italic',
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
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 24,
    textAlign: 'center',
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
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
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
  // Category Buttons
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
  uploadSubtext: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
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
});

export default ProductsList;
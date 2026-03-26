import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Platform,
  Modal,
  Dimensions,
  Switch,
  FlatList,
  TouchableWithoutFeedback
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store"; // <-- added SecureStore
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get('window');

const DUMMY_CATEGORIES = [
  { key: "vegetables", label: "Vegetables" },
  { key: "fruits", label: "Fruits" },
  { key: "grains", label: "Grains" },
  { key: "dairy", label: "Dairy" },
  { key: "meat", label: "Meat" },
  { key: "other", label: "Other" },
];

export default function AddProductScreen() {
  const navigation = useNavigation();
  const [vendorId, setVendorId] = useState(null);
  const [token, setToken] = useState(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [categoryLabel, setCategoryLabel] = useState("Select Category");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [minOrderQuantity, setMinOrderQuantity] = useState("1");
  const [pickupLocation, setPickupLocation] = useState("");
  const [isPerishable, setIsPerishable] = useState(false);
  const [logisticsPreference, setLogisticsPreference] = useState("");
  const [images, setImages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [categories] = useState(DUMMY_CATEGORIES);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [addedProductName, setAddedProductName] = useState("");

  // Helper: get token from SecureStore (fallback to AsyncStorage)
  const getToken = async () => {
    let storedToken = await SecureStore.getItemAsync("token");
    if (!storedToken) {
      storedToken = await AsyncStorage.getItem("token");
    }
    return storedToken;
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // 1. Get token (from SecureStore first)
        const tokenStr = await getToken();
        if (tokenStr) {
          setToken(tokenStr);
          console.log("✅ Token loaded in AddProductScreen");
        } else {
          console.warn("⚠️ No token found");
        }

        // 2. Get user data to extract vendor ID
        const userDataStr = await AsyncStorage.getItem("user");
        if (userDataStr) {
          const user = JSON.parse(userDataStr);
          console.log("👤 User data:", user);
          const foundId = user.id || user.user_id || user.farmer_id || user.uid || user.vendor_id;
          if (foundId) {
            setVendorId(foundId.toString());
            console.log("✅ Vendor ID set:", foundId);
          } else {
            console.warn("⚠️ No vendor ID found in user object");
          }
        } else {
          console.warn("⚠️ No user data in AsyncStorage");
        }
      } catch (error) {
        console.error("Load user error:", error);
      }
    };
    loadUserData();
  }, []);

  const pickImages = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission required", "Enable gallery access to upload images.");
        return;
      }
      if (images.length >= 5) {
        Alert.alert("Limit Reached", "You can only upload up to 5 images per product.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 5 - images.length,
      });
      if (!result.canceled && result.assets?.length) {
        const newImages = [...images, ...result.assets];
        setImages(newImages.slice(0, 5));
      }
    } catch (error) {
      console.error("Error picking images:", error);
      Alert.alert("Error", "Failed to pick images.");
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Upload a single image to the server
  const uploadImageToServer = async (imageUri) => {
    // Use current token (if it's missing, we'll fetch fresh)
    let authToken = token;
    if (!authToken) {
      authToken = await getToken();
      if (!authToken) throw new Error("No authentication token available");
    }

    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      name: `product_${Date.now()}.jpg`,
      type: 'image/jpeg',
    });

    const uploadUrl = 'https://productionbackend2.agreonpay.com.ng/api/media/upload';
    console.log('Uploading image to:', uploadUrl);

    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });

      const responseText = await response.text();
      console.log('Upload response status:', response.status);
      console.log('Upload response body:', responseText);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} - ${responseText}`);
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        throw new Error('Invalid JSON response from upload server');
      }

      // Return the URL – adjust based on actual response structure
      return result.url || result.data?.url || result.image_url;
    } catch (error) {
      console.error('Upload error details:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    // Check for vendorId and token
    if (!vendorId) {
      Alert.alert("Error", "Vendor ID not found. Please login again.");
      return;
    }

    let authToken = token;
    if (!authToken) {
      // Try to fetch fresh token if state is empty
      authToken = await getToken();
      if (!authToken) {
        Alert.alert("Error", "Authentication token missing. Please login again.");
        return;
      }
      setToken(authToken); // update state
    }

    if (!name || !price || !category || !unit) {
      Alert.alert("Error", "Product name, price, category, and unit are required.");
      return;
    }

    const stockQty = parseFloat(stockQuantity);
    if (isNaN(stockQty) || stockQty < 0) {
      Alert.alert("Error", "Please enter a valid stock quantity (0 or more).");
      return;
    }

    const minQty = parseFloat(minOrderQuantity);
    if (isNaN(minQty) || minQty < 1) {
      Alert.alert("Error", "Minimum order quantity must be at least 1.");
      return;
    }

    setLoading(true);
    setUploadingImages(images.length > 0);

    try {
      let uploadedImageUrls = [];
      if (images.length > 0) {
        const uploadPromises = images.map(async (img, index) => {
          try {
            const url = await uploadImageToServer(img.uri);
            return { url, is_primary: index === 0 };
          } catch (error) {
            console.warn(`Image ${index + 1} upload failed:`, error);
            Alert.alert('Warning', `Image ${index + 1} could not be uploaded and will be skipped.`);
            return null;
          }
        });
        const results = await Promise.all(uploadPromises);
        uploadedImageUrls = results.filter(item => item !== null);
      }

      const payload = {
        name,
        description: description || "",
        category,
        price: parseFloat(price),
        unit,
        stock_quantity: stockQty,
        min_order_quantity: minQty,
        pickup_location: pickupLocation || undefined,
        is_perishable: isPerishable,
        logistics_preference: logisticsPreference || undefined,
        images: uploadedImageUrls,
        vendor_id: vendorId,
      };

      console.log("Sending payload:", JSON.stringify(payload, null, 2));

      const response = await fetch("https://productionbackend2.agreonpay.com.ng/api/commerce/vendor/products", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log("Product creation response:", response.status, responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        result = { message: responseText };
      }

      if (response.ok) {
        setAddedProductName(name);
        setShowSuccessModal(true);
      } else {
        Alert.alert("Error", result.message || `HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Submit error:", error);
      Alert.alert("Error", "Network error. Please check your connection and try again.");
    } finally {
      setUploadingImages(false);
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setCategory("");
    setCategoryLabel("Select Category");
    setDescription("");
    setPrice("");
    setUnit("");
    setStockQuantity("");
    setMinOrderQuantity("1");
    setPickupLocation("");
    setIsPerishable(false);
    setLogisticsPreference("");
    setImages([]);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    resetForm();
    navigation.goBack();
  };

  return (
    <View style={styles.fullScreen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Product</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput style={styles.input} placeholder="e.g. Fresh Tomatoes" value={name} onChangeText={setName} />
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            <TouchableOpacity
              style={[styles.input, styles.pickerButton]}
              onPress={() => setShowCategoryModal(true)}
            >
              <Text style={category ? styles.selectedText : styles.placeholderText}>
                {categoryLabel}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            <Modal visible={showCategoryModal} transparent animationType="slide" onRequestClose={() => setShowCategoryModal(false)}>
              <TouchableWithoutFeedback onPress={() => setShowCategoryModal(false)}>
                <View style={styles.modalOverlay}>
                  <TouchableWithoutFeedback>
                    <View style={styles.pickerModal}>
                      <View style={styles.pickerHeader}>
                        <Text style={styles.pickerTitle}>Select Category</Text>
                        <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                          <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                      </View>
                      <FlatList
                        data={categories}
                        keyExtractor={(item) => item.key}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.pickerItem}
                            onPress={() => {
                              setCategory(item.key);
                              setCategoryLabel(item.label);
                              setShowCategoryModal(false);
                            }}
                          >
                            <Text style={styles.pickerItemText}>{item.label}</Text>
                            {category === item.key && <Ionicons name="checkmark" size={20} color="#22C55E" />}
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          </View>

          {/* Unit */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Unit *</Text>
            <TextInput style={styles.input} placeholder="e.g. basket" value={unit} onChangeText={setUnit} />
          </View>

          {/* Price */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price (₦) *</Text>
            <TextInput
              style={styles.input}
              placeholder="15000.00"
              keyboardType="decimal-pad"
              value={price}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9.]/g, '');
                const parts = cleaned.split('.');
                setPrice(parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned);
              }}
            />
          </View>

          {/* Stock Quantity */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Stock Quantity *</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              keyboardType="numeric"
              value={stockQuantity}
              onChangeText={(text) => setStockQuantity(text.replace(/[^0-9]/g, ''))}
            />
          </View>

          {/* Min Order Quantity */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Minimum Order Quantity *</Text>
            <TextInput
              style={styles.input}
              placeholder="1"
              keyboardType="numeric"
              value={minOrderQuantity}
              onChangeText={(text) => setMinOrderQuantity(text.replace(/[^0-9]/g, '') || '1')}
            />
          </View>

          {/* Pickup Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pickup Location (optional)</Text>
            <TextInput style={styles.input} placeholder="e.g. Farm 4 Kano-Zaria" value={pickupLocation} onChangeText={setPickupLocation} />
          </View>

          {/* Perishable Switch */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Perishable?</Text>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>No</Text>
              <Switch
                value={isPerishable}
                onValueChange={setIsPerishable}
                trackColor={{ false: "#767577", true: "#22C55E" }}
                thumbColor={isPerishable ? "#fff" : "#f4f3f4"}
              />
              <Text style={styles.switchLabel}>Yes</Text>
            </View>
          </View>

          {/* Logistics Preference */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Logistics Preference (optional)</Text>
            <TextInput style={styles.input} placeholder="e.g. cold_truck" value={logisticsPreference} onChangeText={setLogisticsPreference} />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Product description (optional)"
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Images */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Images (Up to 5)</Text>
            <TouchableOpacity style={styles.imageUploadBox} onPress={pickImages}>
              <Ionicons name="images-outline" size={50} color="#90CAF9" />
              <Text style={styles.uploadText}>Tap to select product images</Text>
              <Text style={styles.uploadSubtext}>Select multiple images (up to 5)</Text>
            </TouchableOpacity>
            {images.length > 0 && (
              <View style={styles.imagePreviewContainer}>
                {images.map((img, index) => (
                  <View key={index} style={styles.imagePreviewWrapper}>
                    <Image source={{ uri: img.uri }} style={styles.imageThumbnail} />
                    <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
                      <Ionicons name="close-circle" size={24} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            {uploadingImages && (
              <View style={{ marginTop: 10 }}>
                <ActivityIndicator size="small" color="#22C55E" />
                <Text style={{ textAlign: 'center', color: '#666' }}>Uploading images...</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={[styles.cancelButton, { marginBottom: 10 }]} onPress={() => navigation.goBack()} disabled={loading}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.saveButton, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Product</Text>}
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal animationType="fade" transparent visible={showSuccessModal} statusBarTranslucent onRequestClose={handleSuccessModalClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalOverlayLayer} />
            <View style={styles.modalInner}>
              <Text style={styles.modalTitle}>Success!</Text>
              <View style={styles.modalAmountContainer}>
                <Text style={styles.modalAmountLabel}>Product Added</Text>
                <Text style={styles.modalAmount}>{addedProductName}</Text>
              </View>
              <Text style={styles.modalSuccessMessage}>Your product has been added successfully.</Text>
              <Text style={styles.modalInstruction}>You can view it in your product list.</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalButton, styles.modalCancelButton]} onPress={handleSuccessModalClose}>
                  <Text style={styles.modalCancelText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Styles – unchanged from your original
const styles = StyleSheet.create({
  fullScreen: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 40 : 50,
    paddingBottom: 15,
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#111827" },
  container: { padding: 16 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: "#374151", marginBottom: 8, fontWeight: "500" },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111",
  },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 16,
    color: '#111',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.6,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#111',
  },
  imageUploadBox: {
    height: 200,
    borderWidth: 2,
    borderColor: "#90CAF9",
    borderStyle: "dashed",
    borderRadius: 10,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    padding: 20,
  },
  uploadText: { color: "#1976D2", fontSize: 16, fontWeight: "600", marginTop: 8, textAlign: "center" },
  uploadSubtext: { color: "#666", fontSize: 12, marginTop: 4, textAlign: "center" },
  imagePreviewContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 12, gap: 10 },
  imagePreviewWrapper: { width: 100, height: 100, borderRadius: 8, overflow: "hidden", position: "relative" },
  imageThumbnail: { width: "100%", height: "100%", resizeMode: "cover" },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 10,
  },
  switchLabel: { fontSize: 16, color: "#374151" },
  bottomButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  saveButton: { backgroundColor: "#22C55E", borderRadius: 10, paddingVertical: 14, alignItems: "center" },
  saveButtonText: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  cancelButton: { backgroundColor: "#EF4444", borderRadius: 10, paddingVertical: 14, alignItems: "center" },
  cancelButtonText: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  modalContent: {
    width: '100%',
    height: '100%',
    maxWidth: 400,
    maxHeight: 500,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  modalOverlayLayer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
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
  modalAmountLabel: { fontSize: 16, color: '#666', marginBottom: 5 },
  modalAmount: { fontSize: 22, fontWeight: 'bold', color: '#22C55E', textAlign: 'center' },
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
  modalButtons: { flexDirection: 'row', justifyContent: 'center' },
  modalButton: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  modalCancelButton: { backgroundColor: 'rgba(255,255,255,0.9)' },
  modalCancelText: { fontSize: 16, fontWeight: '600', color: '#666' },
});
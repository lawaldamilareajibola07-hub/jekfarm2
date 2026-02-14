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
  Dimensions
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import ModalSelector from "react-native-modal-selector";
import api from "../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from '@react-native-community/datetimepicker';

// Import modal background image
import modalBgImage from "../assets/AgreonIcon.jpeg";

const { width, height } = Dimensions.get('window');

export default function AddProductScreen() {
  const navigation = useNavigation();
  const [farmerId, setFarmerId] = useState(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [categoryLabel, setCategoryLabel] = useState("Select Category");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [stockLabel, setStockLabel] = useState("Select Stock Availability");
  const [harvestDate, setHarvestDate] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // Success Modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [addedProductName, setAddedProductName] = useState("");

  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Get farmer ID and fetch categories
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Get farmer ID
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          console.log("User data:", user);

          if (user.id) {
            setFarmerId(user.id);
          } else if (user.user_id) {
            setFarmerId(user.user_id);
          } else if (user.uid) {
            setFarmerId(user.uid);
          } else if (user.farmer_id) {
            setFarmerId(user.farmer_id);
          }
        }

        // Fetch categories from API
        fetchCategories();
      } catch (error) {
        console.error("Error initializing data:", error);
      }
    };

    initializeData();
  }, []);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await fetch('http://jekfarms.com.ng/data/categories.php');
      const data = await response.json();

      if (data.status === "success" && data.categories && Array.isArray(data.categories)) {
        // Format categories for ModalSelector
        const formattedCategories = data.categories.map(cat => ({
          key: cat.id.toString(),
          label: cat.name
        }));
        setCategories(formattedCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Stock availability options
  const stockOptions = [
    { key: "5", label: "5 units" },
    { key: "10", label: "10 units" },
    { key: "20", label: "20 units" },
    { key: "50", label: "50 units" },
    { key: "100", label: "100 units" },
    { key: "200", label: "200+ units" },
  ];

  // Image Picker - Multiple images (up to 5)
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

      // Launch image picker for multiple images
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        aspect: undefined,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 5 - images.length, // Limit to remaining slots
      });

      console.log("Image picker result:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImages = [...images, ...result.assets];
        if (newImages.length > 5) {
          Alert.alert("Limit Exceeded", "Only the first 5 images will be used.");
          setImages(newImages.slice(0, 5));
        } else {
          setImages(newImages);
        }
      }
    } catch (error) {
      console.error("Error picking images:", error);
      Alert.alert("Error", "Failed to pick images. Please try again.");
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  // Date picker handlers
  const handleDatePress = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);

    if (date) {
      setSelectedDate(date);
      // Format date as YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0];
      setHarvestDate(formattedDate);
    }
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle success modal close
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    resetForm();
    navigation.goBack();
  };

  // Submit Handler
  const handleSubmit = async () => {
    if (!farmerId) {
      Alert.alert("Error", "Please login again to get farmer ID.");
      return;
    }

    if (!name || !price || !category) {
      Alert.alert("Error", "Product name, price, and category are required.");
      return;
    }

    if (!stock || isNaN(stock) || parseInt(stock) <= 0) {
      Alert.alert("Error", "Please enter a valid stock quantity.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      // Add all required fields as per API documentation
      formData.append("farmer_id", farmerId);
      formData.append("product_name", name);
      formData.append("description", description || "");
      formData.append("price", parseFloat(price));
      formData.append("stock_availability", parseInt(stock));
      formData.append("category", category);

      // Add optional fields
      if (harvestDate) {
        formData.append("harvest_date", harvestDate);
      }

      // Add multiple images if selected
      if (images && images.length > 0) {
        images.forEach((img, index) => {
          const uriParts = img.uri.split('.');
          const fileExtension = uriParts[uriParts.length - 1];
          const fileName = `product_${Date.now()}_${index}.${fileExtension}`;

          formData.append(`images[]`, {
            uri: img.uri,
            name: fileName,
            type: img.mimeType || `image/${fileExtension}`,
          });
        });
        console.log(`Adding ${images.length} images to form data`);
      } else {
        console.log("No images selected");
      }

      console.log("Submitting form data...");
      console.log("Farmer ID:", farmerId);
      console.log("Product Name:", name);
      console.log("Price:", price);
      console.log("Stock:", stock);
      console.log("Category:", category);
      console.log("Harvest Date:", harvestDate);

      // Use the correct endpoint
      const res = await api.post("/farmerinterface/inventory/add.php", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      });

      console.log("API Response:", res.data);

      if (res.data.status === "success") {
        // Show success modal instead of Alert.alert
        setAddedProductName(name);
        setShowSuccessModal(true);
      } else {
        Alert.alert(
          "❌ Error",
          res.data.message || "Failed to add product. Please try again."
        );
      }
    } catch (error) {
      console.error("Add product error:", error);
      let errorMessage = "Failed to connect to the server.";

      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.message.includes("timeout")) {
        errorMessage = "Request timeout. Please check your connection and try again.";
      } else if (error.message === "Network Error") {
        errorMessage = "Network error. Please check your internet connection.";
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setCategory("");
    setCategoryLabel("Select Category");
    setDescription("");
    setPrice("");
    setStock("");
    setStockLabel("Select Stock Availability");
    setHarvestDate("");
    setImages([]);
    setSelectedDate(new Date());
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter product name"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            <ModalSelector
              data={categories}
              initValue={categoryLabel}
              onChange={(option) => {
                setCategory(option.key);
                setCategoryLabel(option.label);
              }}
              style={styles.dropdown}
              selectTextStyle={styles.dropdownText}
              optionTextStyle={styles.dropdownOption}
              cancelText="Cancel"
            />
          </View>

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
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price (₦) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 300.00"
              keyboardType="decimal-pad"
              value={price}
              onChangeText={(text) => {
                // Allow only numbers and decimal point
                const cleaned = text.replace(/[^0-9.]/g, '');
                // Ensure only one decimal point
                const parts = cleaned.split('.');
                if (parts.length > 2) {
                  setPrice(parts[0] + '.' + parts.slice(1).join(''));
                } else {
                  setPrice(cleaned);
                }
              }}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Stock Availability *</Text>
            <ModalSelector
              data={stockOptions}
              initValue={stockLabel}
              onChange={(option) => {
                setStock(option.key);
                setStockLabel(option.label);
              }}
              style={styles.dropdown}
              selectTextStyle={styles.dropdownText}
              optionTextStyle={styles.dropdownOption}
              cancelText="Cancel"
            />
            <TextInput
              style={[styles.input, { marginTop: 8 }]}
              placeholder="Or enter custom quantity"
              keyboardType="numeric"
              value={stock}
              onChangeText={(text) => {
                // Allow only numbers
                const cleaned = text.replace(/[^0-9]/g, '');
                setStock(cleaned);
                if (cleaned) {
                  setStockLabel(`${cleaned} units`);
                }
              }}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Harvest Date (Optional)</Text>
            <TouchableOpacity
              style={[styles.input, styles.dateInput]}
              onPress={handleDatePress}
            >
              <Text style={harvestDate ? styles.dateText : styles.placeholderText}>
                {harvestDate ? formatDateForDisplay(harvestDate) : "Tap to select harvest date"}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#666" />
            </TouchableOpacity>

            {harvestDate ? (
              <TouchableOpacity
                style={styles.clearDateButton}
                onPress={() => setHarvestDate("")}
              >
                <Text style={styles.clearDateText}>Clear Date</Text>
              </TouchableOpacity>
            ) : null}
          </View>

        </View>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
          style={styles.datePicker}
        />
      )}

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={[styles.cancelButton, { marginBottom: 10 }]}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Product</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Success Modal - EXACTLY like Confirm Order Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccessModal}
        statusBarTranslucent={true}
        onRequestClose={handleSuccessModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>


            {/* Overlay for better text visibility */}
            <View style={styles.modalOverlayLayer} />

            {/* Modal Content */}
            <View style={styles.modalInner}>
              <Text style={styles.modalTitle}>Success!</Text>

              <View style={styles.modalAmountContainer}>
                <Text style={styles.modalAmountLabel}>Product Added</Text>
                <Text style={styles.modalAmount}>{addedProductName}</Text>
              </View>

              <Text style={styles.modalSuccessMessage}>
                Your product has been successfully added to your inventory.
              </Text>

              <Text style={styles.modalInstruction}>
                You can view it in your product list.
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={handleSuccessModalClose}
                >
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

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: "#F9FAFB"
  },
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827"
  },
  container: {
    padding: 16
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20
  },
  inputGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
    fontWeight: "500"
  },
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
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    color: "#111",
  },
  placeholderText: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top"
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    backgroundColor: "#FFF",
  },
  dropdownText: {
    fontSize: 16,
    color: "#111",
    paddingVertical: 12,
    paddingHorizontal: 12
  },
  dropdownOption: {
    fontSize: 16,
    color: "#111",
    paddingVertical: 12,
    paddingHorizontal: 12
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
    overflow: "hidden",
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    resizeMode: "cover",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  changeImageText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 5,
  },
  uploadText: {
    color: "#1976D2",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  uploadSubtext: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  imagePreviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 10,
  },
  imagePreviewWrapper: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  imageThumbnail: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
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
  clearDateButton: {
    marginTop: 8,
    alignSelf: "flex-end",
  },
  clearDateText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "500",
  },
  bottomButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 40,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  saveButton: {
    backgroundColor: "#22C55E",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700"
  },
  cancelButton: {
    backgroundColor: "#EF4444",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700"
  },
  datePicker: {
    backgroundColor: "#fff",
  },


  modalOverlay: {
    flex: 1,
    width: width,
    height: height,
    backgroundColor: 'rgba(39, 38, 38, 0.8)',
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
  modalAmountLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  modalAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#22C55E',
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
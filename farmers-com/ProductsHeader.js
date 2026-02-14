import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  TouchableWithoutFeedback,
  Animated,
  StatusBar,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleLogout } from '../utils/logout';

const { width, height } = Dimensions.get('window');

const ProductsHeader = () => {
  const navigation = useNavigation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [scaleValue] = useState(new Animated.Value(0));
  const [fadeValue] = useState(new Animated.Value(0));

  useEffect(() => {
    if (showLogoutModal) {
      // Hide status bar when modal opens
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
      // Show status bar when modal closes
      StatusBar.setHidden(false, 'fade');
      
      Animated.timing(fadeValue, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
      scaleValue.setValue(0);
    }
  }, [showLogoutModal]);

  const handleLogoutPress = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      setShowLogoutModal(false);
      setTimeout(async () => {
        await handleLogout(navigation, user, 'AuthLoading');
      }, 300);
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

  return (
    <View style={styles.container}>
      {/* Left Section */}
      <View>
        <Text style={styles.title}>Products List</Text>
        <Text style={styles.subtitle}>Show: All Products ▼</Text>
      </View>

      {/* Right Section */}
      <View style={styles.icons}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="filter-outline" size={20} color="#111827" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddProduct')}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogoutPress}
        >
          <Ionicons name="log-out" size={20} color="#dc2626" />
        </TouchableOpacity>
      </View>

      {/* Enhanced Logout Modal - Full Page Overlay */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="none"
        onRequestClose={cancelLogout}
        statusBarTranslucent={true}
      >
        <Animated.View 
          style={[
            styles.fullPageOverlay, 
            { opacity: fadeValue }
          ]}
        >
          <TouchableWithoutFeedback onPress={cancelLogout}>
            <View style={styles.fullPageTouchable}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <Animated.View 
                  style={[
                    styles.modalContainer,
                    { transform: [{ scale: scaleValue }] }
                  ]}
                >
                  <View style={styles.modalHeader}>
                    <View style={styles.modalIconContainer}>
                      <Ionicons name="log-out" size={28} color="#dc2626" />
                    </View>
                    <View>
                      <Text style={styles.modalTitle}>Confirm Logout</Text>
                      <Text style={styles.modalSubtitle}>Session Management</Text>
                    </View>
                  </View>
                  
                  <View style={styles.modalContent}>
                    <Text style={styles.modalMessage}>
                      You're about to logout from your account. This will end your current session.
                    </Text>
                    
                    <View style={styles.warningContainer}>
                      <Ionicons name="information-circle" size={18} color="#f59e0b" />
                      <Text style={styles.warningText}>
                        You'll need to login again to access your products.
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.modalFooter}>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={cancelLogout}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close" size={18} color="#374151" />
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.logoutConfirmButton]}
                      onPress={confirmLogout}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="log-out" size={18} color="#fff" />
                      <Text style={styles.logoutButtonText}>Yes, Logout</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    backgroundColor: '#f9fafb',
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#22c55e',
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  logoutButton: {
    backgroundColor: '#f9fafb',
    padding: 8,
    borderRadius: 8,
  },
  // Full Page Modal Styles
  fullPageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)', // Darker overlay for full page
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullPageTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  modalContent: {
    padding: 24,
  },
  modalMessage: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  warningText: {
    fontSize: 14,
    color: '#92400e',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    paddingTop: 8,
    backgroundColor: '#fafafa',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 120,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  logoutConfirmButton: {
    backgroundColor: '#dc2626',
    shadowColor: '#dc2626',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ProductsHeader;
// screens/FarmerUserSearch.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://jekfarms.com.ng";
const PRIMARY_COLOR = "#10b981";

const FarmerUserSearch = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [recentContacts, setRecentContacts] = useState([]);
  const [currentUserToken, setCurrentUserToken] = useState(null);

  // ==================== INITIALIZATION ====================
  useEffect(() => {
    const getUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUserId(parsedUser.id);
          console.log("📱 Current User ID:", parsedUser.id);
          
          // Get token if available
          const token = await AsyncStorage.getItem('token');
          if (token) {
            setCurrentUserToken(token);
          }
        } else {
          Alert.alert("Error", "User not logged in");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Error getting user:", error);
        Alert.alert("Error", "Could not load user data");
      }
    };
    getUser();
    loadRecentContacts();
  }, []);

  // ==================== RECENT CONTACTS ====================
  const loadRecentContacts = async () => {
    try {
      const contacts = await AsyncStorage.getItem('farmer_recent_contacts');
      if (contacts) {
        setRecentContacts(JSON.parse(contacts));
      }
    } catch (error) {
      console.error('Error loading recent contacts:', error);
    }
  };

  const saveToRecentContacts = async (user) => {
    try {
      let contacts = [...recentContacts];
      contacts = contacts.filter(contact => contact.id !== user.id);
      contacts.unshift({
        id: user.id,
        name: user.name || "Unknown User",
        email: user.email,
        image: user.profile_image || user.image
      });
      
      if (contacts.length > 10) contacts = contacts.slice(0, 10);
      
      setRecentContacts(contacts);
      await AsyncStorage.setItem('farmer_recent_contacts', JSON.stringify(contacts));
    } catch (error) {
      console.error('Error saving recent contact:', error);
    }
  };

  // ==================== SEARCH USERS ====================
  const searchUsers = useCallback(async () => {
    if (!searchQuery.trim()) {
      setUsers([]);
      return;
    }

    if (!currentUserId) {
      Alert.alert("Error", "Please login first");
      return;
    }

    setLoading(true);
    try {
      console.log("🔍 Searching for:", searchQuery);
      
      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add token if available
      if (currentUserToken) {
        headers['Authorization'] = `Bearer ${currentUserToken}`;
      }
      
      console.log("📡 Search URL:", `${BASE_URL}/chatinterface/users/search.php?search=${encodeURIComponent(searchQuery.trim())}&current_user_id=${currentUserId}`);
      
      const response = await fetch(
        `${BASE_URL}/chatinterface/users/search.php?search=${encodeURIComponent(searchQuery.trim())}&current_user_id=${currentUserId}`,
        { headers }
      );
      
      console.log("📡 Response status:", response.status);
      
      if (response.ok) {
        const responseText = await response.text();
        console.log("📄 Raw response:", responseText);
        
        // Handle empty response
        if (!responseText.trim()) {
          console.log("📭 Empty response from server");
          setUsers([]);
          return;
        }
        
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error("❌ Failed to parse JSON:", e);
          console.log("Response text that failed to parse:", responseText);
          
          // Try alternative endpoint if main one fails
          try {
            const altResponse = await fetch(
              `${BASE_URL}/api/users/search?q=${encodeURIComponent(searchQuery.trim())}`,
              { headers }
            );
            
            if (altResponse.ok) {
              const altData = await altResponse.json();
              console.log("✅ Alternative endpoint data:", altData);
              
              if (altData.users && Array.isArray(altData.users)) {
                const formattedUsers = altData.users.map(user => ({
                  id: user.id,
                  name: user.name || user.username,
                  email: user.email || "",
                  profile_image: user.profile_image || user.avatar,
                }));
                setUsers(formattedUsers);
              } else {
                setUsers([]);
              }
            } else {
              setUsers([]);
            }
          } catch (altError) {
            console.error("Alternative endpoint error:", altError);
            setUsers([]);
          }
          return;
        }
        
        console.log("📊 Parsed data:", data);
        
        // Handle different response formats
        let foundUsers = [];
        
        if (data.status === "success") {
          if (data.data && Array.isArray(data.data)) {
            foundUsers = data.data;
          } else if (Array.isArray(data)) {
            foundUsers = data;
          } else if (data.users && Array.isArray(data.users)) {
            foundUsers = data.users;
          }
        } else if (Array.isArray(data)) {
          foundUsers = data;
        } else if (data.message && data.message.includes("No users found")) {
          console.log("📭 No users found");
          setUsers([]);
          return;
        } else if (data.error) {
          console.error("Server error:", data.error);
          Alert.alert("Error", data.error);
          setUsers([]);
          return;
        }
        
        // Format users consistently
        const formattedUsers = foundUsers.map(user => ({
          id: user.id || user.user_id || user.uid,
          name: user.name || user.username || user.full_name || 
                (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : null) ||
                user.email?.split('@')[0] || 
                "Unknown User",
          email: user.email || user.email_address || "",
          profile_image: user.profile_image || user.image || user.avatar,
          phone: user.phone || user.phone_number || user.mobile,
        })).filter(user => user.id !== currentUserId); // Exclude current user
        
        console.log(`✅ Found ${formattedUsers.length} users`);
        setUsers(formattedUsers);
        
      } else {
        console.error("❌ Search failed with status:", response.status);
        // Try without current_user_id parameter
        try {
          console.log("🔄 Trying search without current_user_id parameter...");
          const altResponse = await fetch(
            `${BASE_URL}/chatinterface/users/search.php?search=${encodeURIComponent(searchQuery.trim())}`,
            { headers }
          );
          
          if (altResponse.ok) {
            const altData = await altResponse.json();
            console.log("✅ Alternative search data:", altData);
            
            if (altData.users && Array.isArray(altData.users)) {
              const formattedUsers = altData.users.map(user => ({
                id: user.id,
                name: user.name || user.username,
                email: user.email || "",
                profile_image: user.profile_image || user.avatar,
              })).filter(user => user.id !== currentUserId);
              setUsers(formattedUsers);
            } else {
              setUsers([]);
            }
          } else {
            Alert.alert("Error", "Search failed. Please try again.");
            setUsers([]);
          }
        } catch (fallbackError) {
          console.error("Fallback search error:", fallbackError);
          Alert.alert("Error", "Network error. Please check your connection.");
          setUsers([]);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      Alert.alert("Error", "Network error. Please check your connection.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentUserId, currentUserToken]);

  // ==================== DEBOUNCE SEARCH ====================
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers();
      } else {
        setUsers([]);
      }
    }, 800); // Increased debounce time

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchUsers]);

  // ==================== CREATE CONVERSATION ====================
  const createConversation = async (otherUserId) => {
    if (!currentUserId) {
      throw new Error("User not logged in");
    }

    try {
      console.log(`🔄 Creating conversation between ${currentUserId} and ${otherUserId}`);
      
      const headers = {
        "Content-Type": "application/json",
      };
      
      if (currentUserToken) {
        headers["Authorization"] = `Bearer ${currentUserToken}`;
      }
      
      const response = await fetch(`${BASE_URL}/chatinterface/conversations/create.php`, {
        method: "POST",
        headers,
        body: JSON.stringify({ 
          user1_id: currentUserId, 
          user2_id: otherUserId 
        }),
      });

      console.log("📡 Response status:", response.status);
      
      const responseText = await response.text();
      console.log("📄 Raw response:", responseText);
      
      if (!response.ok) {
        console.error(`❌ HTTP error ${response.status}`);
        throw new Error(`Server error: ${response.status}`);
      }
      
      // Try to parse JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("❌ Failed to parse JSON:", e.message);
        
        // Try to extract JSON from response
        const jsonMatch = responseText.match(/\{.*\}/s);
        if (jsonMatch) {
          try {
            data = JSON.parse(jsonMatch[0]);
          } catch (e2) {
            throw new Error("Invalid server response format");
          }
        } else {
          throw new Error("Invalid server response");
        }
      }
      
      console.log("📊 Parsed data:", data);
      
      // Check for success
      if (data.status === "success") {
        let conversationId;
        
        if (data.conversation_id) {
          conversationId = data.conversation_id;
        } else if (data.data && data.data.id) {
          conversationId = data.data.id;
        } else if (data.id) {
          conversationId = data.id;
        } else if (data.conversationId) {
          conversationId = data.conversationId;
        } else if (data.data && data.data.conversation_id) {
          conversationId = data.data.conversation_id;
        }
        
        if (conversationId) {
          console.log("✅ Created conversation ID:", conversationId);
          return conversationId;
        } else {
          throw new Error("No conversation ID in response");
        }
      } else if (data.message && data.message.includes("Conversation found")) {
        if (data.data && data.data.id) {
          const conversationId = data.data.id;
          console.log("✅ Found existing conversation:", conversationId);
          return conversationId;
        } else if (data.conversation_id) {
          console.log("✅ Found existing conversation:", data.conversation_id);
          return data.conversation_id;
        } else {
          throw new Error("Conversation exists but no ID found");
        }
      } else {
        throw new Error(data.message || data.error || "Failed to create conversation");
      }
    } catch (error) {
      console.error("Create conversation error:", error);
      throw error;
    }
  };

  // ==================== START CHAT ====================
  const startChatWithUser = async (user) => {
    if (!currentUserId) {
      Alert.alert("Error", "Please login first");
      return;
    }

    setLoading(true);
    try {
      console.log("🤝 Starting chat with user:", user.name);
      const conversationId = await createConversation(user.id);
      
      // Save to recent contacts
      await saveToRecentContacts(user);
      
      console.log("🎯 Navigating to chat with conversation ID:", conversationId);
      
      // Navigate to chat screen
      navigation.navigate("FarmerChat", {
        conversationId: conversationId,
        otherUserId: user.id,
        otherUserName: user.name,
        otherUserImage: user.profile_image,
      });
    } catch (error) {
      console.error("Error starting chat:", error);
      Alert.alert("Error", error.message || "Failed to start chat");
    } finally {
      setLoading(false);
    }
  };

  // ==================== HANDLE RECENT CONTACT ====================
  const handleRecentContactPress = async (contact) => {
    if (!currentUserId) {
      Alert.alert("Error", "Please login first");
      return;
    }

    setLoading(true);
    try {
      const conversationId = await createConversation(contact.id);
      
      navigation.navigate("FarmerChat", {
        conversationId: conversationId,
        otherUserId: contact.id,
        otherUserName: contact.name,
        otherUserImage: contact.image,
      });
    } catch (error) {
      console.error("Error opening recent chat:", error);
      Alert.alert("Error", "Could not open chat");
    } finally {
      setLoading(false);
    }
  };

  // ==================== RENDER FUNCTIONS ====================
  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => startChatWithUser(item)}
      disabled={loading}
    >
      <View style={styles.avatarContainer}>
        {item.profile_image ? (
          <Image source={{ uri: item.profile_image }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>
              {item.name?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1}>
          {item.name || "Unknown User"}
        </Text>
        {item.email ? (
          <Text style={styles.userEmail} numberOfLines={1}>
            {item.email}
          </Text>
        ) : item.phone ? (
          <Text style={styles.userEmail} numberOfLines={1}>
            {item.phone}
          </Text>
        ) : null}
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={PRIMARY_COLOR} />
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      )}
    </TouchableOpacity>
  );

  const renderRecentContactItem = ({ item }) => (
    <TouchableOpacity
      style={styles.recentItem}
      onPress={() => handleRecentContactPress(item)}
      disabled={loading}
    >
      <View style={styles.recentAvatarContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.recentAvatar} />
        ) : (
          <View style={[styles.recentAvatar, styles.recentAvatarPlaceholder]}>
            <Text style={styles.recentAvatarText}>
              {item.name?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.recentName} numberOfLines={1}>
        {item.name || "Unknown"}
      </Text>
    </TouchableOpacity>
  );

  // ==================== MAIN RENDER ====================
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          disabled={loading}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Customers</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search customers by name, email, or phone..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
            returnKeyType="search"
            editable={!loading}
          />
          {searchQuery.length > 0 && !loading && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
          {loading && (
            <ActivityIndicator size="small" color={PRIMARY_COLOR} style={{ marginLeft: 8 }} />
          )}
        </View>
      </View>

      {/* RECENT CONTACTS */}
      {recentContacts.length > 0 && !searchQuery && !loading && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Contacts</Text>
          <FlatList
            horizontal
            data={recentContacts}
            keyExtractor={(item) => `recent-${item.id}`}
            renderItem={renderRecentContactItem}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentList}
          />
        </View>
      )}

      {/* SEARCH RESULTS */}
      <View style={styles.resultsContainer}>
        {loading && !searchQuery ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          </View>
        ) : searchQuery ? (
          <>
            <Text style={styles.resultsTitle}>
              {loading ? "Searching..." : 
               users.length > 0 
                ? `Found ${users.length} customer${users.length !== 1 ? 's' : ''}` 
                : 'No customers found'}
            </Text>
            <FlatList
              data={users}
              keyExtractor={(item) => `user-${item.id}`}
              renderItem={renderUserItem}
              contentContainerStyle={styles.usersList}
              ListEmptyComponent={
                !loading && (
                  <View style={styles.centerContainer}>
                    <Ionicons name="search-outline" size={60} color="#ddd" />
                    <Text style={styles.emptyText}>No customers found</Text>
                    <Text style={styles.emptySubtext}>
                      Try a different search term
                    </Text>
                  </View>
                )
              }
            />
          </>
        ) : (
          <View style={styles.centerContainer}>
            <Ionicons name="people-outline" size={80} color="#e0e0e0" />
            <Text style={styles.initialText}>Search for customers</Text>
            <Text style={styles.initialSubtext}>
              Enter a name, email, or phone number to find customers to chat with
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: "#fff",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
    padding: 0,
    paddingVertical: 0,
  },
  section: {
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  recentList: {
    paddingHorizontal: 16,
  },
  recentItem: {
    alignItems: "center",
    marginRight: 20,
    width: 70,
  },
  recentAvatarContainer: {
    marginBottom: 8,
  },
  recentAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  recentAvatarPlaceholder: {
    backgroundColor: PRIMARY_COLOR,
    justifyContent: "center",
    alignItems: "center",
  },
  recentAvatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  recentName: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  resultsTitle: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  usersList: {
    paddingBottom: 20,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    backgroundColor: PRIMARY_COLOR,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
  initialText: {
    fontSize: 18,
    color: "#666",
    marginTop: 20,
    marginBottom: 8,
    fontWeight: "500",
  },
  initialSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});

export default FarmerUserSearch;
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import debounce from "lodash.debounce";

const BASE_URL = "https://jekfarms.com.ng/chatinterface";

const UserSearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [userType, setUserType] = useState("");
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Get logged-in user
  useEffect(() => {
    const getUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUserId(parsedUser.id || parsedUser.user_id);
          setUserType(parsedUser.role || "");
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
  }, []);

  // Search users API
  const searchUsers = async (query) => {
    if (!currentUserId) return;
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      // NEW - send JSON with correct keys
const response = await fetch(`${BASE_URL}/users/search.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: currentUserId,
        search_query: query.trim(),
        role: userType || "",
      }),
    });



      const data = await response.json();
      if (data.status === "success" && Array.isArray(data.data)) {
        setUsers(data.data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      Alert.alert("Network error", "Could not search users");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useMemo(
    () => debounce((text) => searchUsers(text), 400),
    [currentUserId, userType]
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Start or navigate to conversation
  const handleUserSelect = async (user) => {
    const targetUserId = user.id || user.user_id;
    if (!targetUserId) return Alert.alert("Error", "Invalid user data");

    try {
      const response = await fetch(`${BASE_URL}/conversations/create.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user1_id: currentUserId,
          user2_id: targetUserId,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        const conversationId =
          data.data?.id || data.conversation_id || data.data?.conversation_id;

        navigation.navigate("Chat", {
          conversationId,
          otherUserId: targetUserId,
          otherUserName: user.full_name,
          otherUserImage: user.profile_image,
          isGroup: false,
        });
      } else {
        Alert.alert("Error", data.message || "Could not start conversation");
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      Alert.alert("Network error", "Could not start conversation");
    }
  };

  // Render user item
  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleUserSelect(item)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.full_name?.charAt(0).toUpperCase() || "?"}
        </Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.full_name}</Text>
        <Text style={styles.userType}>{item.role}</Text>
      </View>
      {item.is_online && <View style={styles.onlineDot} />}
    </TouchableOpacity>
  );

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    searchUsers(searchQuery);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.container}>
          <StatusBar 
      barStyle="dark-content" 
      backgroundColor="transparent" 
      translucent 
    />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search Users</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="gray"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              debouncedSearch(text);
            }}
          />
        </View>

        {/* Loader */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#10b981" />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        )}

        {/* User List */}
        <FlatList
          data={users}
          keyExtractor={(item) => (item.id || item.user_id).toString()}
          renderItem={renderUser}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            !loading && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? "No users found"
                    : "Start typing to search for users"}
                </Text>
              </View>
            )
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding:15,
 
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: '#0cb444'
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color:'#fff' },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    margin: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  userType: { fontSize: 14, color: "gray", textTransform: "capitalize" },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10b981",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  loadingText: { color: "gray", marginLeft: 8 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 50,
  },
  emptyText: { fontSize: 16, color: "gray" },
});

export default UserSearchScreen;
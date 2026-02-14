import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://jekfarms.com.ng/chatinterface";

const CreateGroupScreen = ({ navigation }) => {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUserId(parsedUser.id);
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

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim() && currentUserId) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, currentUserId]);

  const performSearch = async (query) => {
    if (!query.trim() || !currentUserId) return;

    setSearching(true);
    
    const payload = {
      user_id: parseInt(currentUserId),
      search_query: query,
    };

    try {
      const response = await fetch(`${BASE_URL}/users/search.php`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        Alert.alert("Error", "Invalid response from server");
        return;
      }

      if (data.status === "success") {
        let users = [];
        
        // Extract users from response
        if (Array.isArray(data.data)) {
          users = data.data;
        } else if (data.data && Array.isArray(data.data.users)) {
          users = data.data.users;
        } else if (data.users && Array.isArray(data.users)) {
          users = data.users;
        } else if (data.data && typeof data.data === 'object') {
          users = Object.values(data.data);
        }
        
        // Filter out already selected users and current user
        const filteredUsers = users.filter(user => {
          if (!user || !user.id) return false;
          
          const isCurrentUser = user.id.toString() === currentUserId.toString();
          const isAlreadySelected = selectedUsers.some(selected => 
            selected.id.toString() === user.id.toString()
          );
          
          return !isCurrentUser && !isAlreadySelected;
        });
        
        setSearchResults(filteredUsers);
      } else {
        setSearchResults([]);
        if (data.message && data.message !== "No users found") {
          Alert.alert("Search Error", data.message);
        }
      }
    } catch (error) {
      console.error("Network error:", error);
      Alert.alert("Network Error", "Failed to search users");
    } finally {
      setSearching(false);
    }
  };

  const toggleUserSelection = (user) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.some((u) => u.id.toString() === user.id.toString());
      if (isSelected) {
        return prev.filter((u) => u.id.toString() !== user.id.toString());
      } else {
        return [...prev, user];
      }
    });
    
    setSearchResults((prev) => prev.filter((u) => u.id.toString() !== user.id.toString()));
  };

  const createGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }

    if (selectedUsers.length === 0) {
      Alert.alert("Error", "Please add at least one member");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        group_name: groupName,
        group_description: groupDescription,
        created_by: parseInt(currentUserId),
        group_type: "group",
        member_ids: selectedUsers.map((u) => parseInt(u.id)),
      };

      const response = await fetch(`${BASE_URL}/groups/create.php`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        Alert.alert("Error", "Invalid response from server");
        return;
      }

      if (data.status === "success") {
        Alert.alert(
          "Success",
          "Group created successfully!",
          [
            {
              text: "OK",
              onPress: () => {
                // Navigate to GroupListScreen instead of going back
                navigation.navigate("GroupList");
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", data.message || "Failed to create group");
      }
    } catch (error) {
      console.error("Error creating group:", error);
      Alert.alert("Network Error", "Could not create group");
    } finally {
      setLoading(false);
    }
  };

  const renderUser = ({ item }) => {
    if (!item) return null;

    const isSelected = selectedUsers.some((u) => 
      u.id && item.id && u.id.toString() === item.id.toString()
    );
    
    let displayName = "Unknown User";
    if (item.full_name) displayName = item.full_name;
    else if (item.name) displayName = item.name;
    else if (item.username) displayName = item.username;
    else if (item.email) displayName = item.email;
    else if (item.first_name || item.last_name) {
      displayName = `${item.first_name || ''} ${item.last_name || ''}`.trim();
    }
    
    const userType = item.user_type || item.role || item.type || "user";

    return (
      <TouchableOpacity
        style={[styles.userItem, isSelected && styles.selectedUser]}
        onPress={() => toggleUserSelection(item)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userType}>{userType}</Text>
          {item.email && <Text style={styles.userEmail}>{item.email}</Text>}
        </View>
        {isSelected ? (
          <Ionicons name="checkmark-circle" size={24} color="#10b981" />
        ) : (
          <Ionicons name="add-circle-outline" size={24} color="#666" />
        )}
      </TouchableOpacity>
    );
  };

  const renderSelectedUser = ({ item }) => {
    let displayName = "Unknown";
    if (item.full_name) displayName = item.full_name;
    else if (item.name) displayName = item.name;
    else if (item.username) displayName = item.username;
    else if (item.email) displayName = item.email;
    
    return (
      <View style={styles.selectedUserChip}>
        <Text style={styles.selectedUserText}>
          {displayName.split(" ")[0]}
        </Text>
        <TouchableOpacity
          onPress={() => toggleUserSelection(item)}
          style={styles.removeButton}
        >
          <Ionicons name="close" size={14} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => navigation.navigate("GroupList")}
              style={styles.groupsButton}
            >
              <Ionicons name="people" size={20} color="#10b981" />
              <Text style={styles.groupsButtonText}>Groups</Text>
            </TouchableOpacity>
          </View>
         
          <TouchableOpacity
            onPress={createGroup}
            disabled={!groupName.trim() || loading || selectedUsers.length === 0}
            style={[
              styles.createButton,
              (!groupName.trim() || loading || selectedUsers.length === 0) &&
                styles.disabledButton,
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Create</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Scrollable Content */}
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={
            <>
              {/* Form Section */}
              <View style={styles.formSection}>
                <View style={styles.formContainer}>
                  <Text style={styles.label}>Group Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter group name"
                    value={groupName}
                    onChangeText={setGroupName}
                    maxLength={50}
                  />
                  
                  <Text style={styles.label}>Description (Optional)</Text>
                  <TextInput
                    style={[styles.input, styles.descriptionInput]}
                    placeholder="Enter group description"
                    value={groupDescription}
                    onChangeText={setGroupDescription}
                    multiline
                    maxLength={200}
                  />
                </View>

                {/* Selected Users */}
                {selectedUsers.length > 0 && (
                  <View style={styles.selectedSection}>
                    <Text style={styles.sectionTitle}>
                      Selected Members ({selectedUsers.length})
                    </Text>
                    <FlatList
                      data={selectedUsers}
                      keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                      renderItem={renderSelectedUser}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.selectedList}
                      contentContainerStyle={styles.selectedListContent}
                    />
                  </View>
                )}

                {/* Search Section - FIXED: This stays at the top */}
                <View style={styles.searchSection}>
                  <Text style={styles.sectionTitle}>Add Members</Text>
                  <View style={styles.searchContainer}>
                    <Ionicons
                      name="search"
                      size={20}
                      color="#999"
                      style={styles.searchIcon}
                    />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search by name, email, or username..."
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      autoCorrect={false}
                      autoCapitalize="none"
                      placeholderTextColor="#999"
                    />
                    {searching && (
                      <ActivityIndicator size="small" color="#10b981" style={styles.searchSpinner} />
                    )}
                    {searchQuery && !searching && (
                      <TouchableOpacity
                        onPress={() => setSearchQuery("")}
                        style={styles.clearButton}
                      >
                        <Ionicons name="close-circle" size={20} color="#999" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>

              {/* Search Results */}
              {searchQuery && (
                <View style={styles.resultsSection}>
                  {searching ? (
                    <View style={styles.centerContainer}>
                      <ActivityIndicator size="large" color="#10b981" />
                      <Text style={styles.loadingText}>Searching users...</Text>
                    </View>
                  ) : searchResults.length > 0 ? (
                    <>
                      <Text style={styles.resultsTitle}>
                        Found {searchResults.length} user{searchResults.length !== 1 ? 's' : ''}
                      </Text>
                      <FlatList
                        data={searchResults}
                        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                        renderItem={renderUser}
                        scrollEnabled={false} // Disable nested scrolling
                        style={styles.resultsList}
                      />
                    </>
                  ) : (
                    <View style={styles.emptyResults}>
                      <Ionicons name="search-outline" size={50} color="#ccc" />
                      <Text style={styles.emptyText}>No users found for "{searchQuery}"</Text>
                      <Text style={styles.emptySubtext}>
                        Try a different search term
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Initial State */}
              {!searchQuery && (
                <View style={styles.initialState}>
                  <Ionicons name="people-outline" size={60} color="#ccc" />
                  <Text style={styles.initialStateText}>Search for users to add</Text>
                  <Text style={styles.initialStateSubtext}>
                    Type a name, email, or username above
                  </Text>
                </View>
              )}
            </>
          }
          ListEmptyComponent={null}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  container: { 
    flex: 1 
  },
  listContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  groupsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9f4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 15,
  },
  groupsButtonText: {
    color: "#10b981",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 5,
  },
  createButton: {
    backgroundColor: "#10b981",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  formSection: {
    padding: 15,
    backgroundColor: "#fff",
  },
  formContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    marginBottom: 15,
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: "top",
  },
  selectedSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  selectedList: {
    flexGrow: 0,
  },
  selectedListContent: {
    paddingRight: 15,
  },
  selectedUserChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedUserText: {
    color: "#fff",
    marginRight: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  removeButton: {
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  searchSection: {
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 25,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  searchSpinner: {
    marginLeft: 10,
  },
  clearButton: {
    padding: 5,
  },
  resultsSection: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  resultsTitle: {
    fontSize: 14,
    color: "#666",
    padding: 15,
    paddingBottom: 10,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  resultsList: {
    paddingHorizontal: 15,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  selectedUser: {
    backgroundColor: "#e8f5e9",
    borderColor: "#10b981",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#333",
  },
  userType: {
    fontSize: 14,
    color: "#666",
    textTransform: "capitalize",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: "#999",
  },
  centerContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  emptyResults: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#fff",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 15,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 5,
    paddingHorizontal: 20,
  },
  initialState: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#f9f9f9",
    flex: 1,
  },
  initialStateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 15,
    textAlign: "center",
  },
  initialStateSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 5,
    paddingHorizontal: 20,
  },
});

export default CreateGroupScreen;
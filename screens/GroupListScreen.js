import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const BASE_URL = "https://jekfarms.com.ng/chatinterface";

const GroupListScreen = ({ navigation }) => {
  const [groups, setGroups] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const fetchGroups = async (showLoader = false) => {
    if (!currentUserId) return;

    if (showLoader) setLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}/groups/list.php?user_id=${currentUserId}`
      );
      const data = await response.json();

      if (data.status === "success") {
        setGroups(data.data || []);
      } else {
        console.warn("Fetch groups error:", data.message);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      Alert.alert("Error", "Failed to load groups");
    } finally {
      if (showLoader) setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGroups(true);
      return () => {
        // No polling to clean up
      };
    }, [currentUserId])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchGroups(false);
  }, [currentUserId]);

  const renderGroup = ({ item }) => (
    <TouchableOpacity
      style={styles.groupItem}
      onPress={() =>
        navigation.navigate("GroupChat", {
          groupId: item.group_id,
          groupName: item.group_name,
          groupImage: item.group_image,
        })
      }
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.group_name?.charAt(0)?.toUpperCase() || "G"}
        </Text>
      </View>
      <View style={styles.groupInfo}>
        <Text style={styles.groupName} numberOfLines={1}>
          {item.group_name}
        </Text>
        {item.last_message && (
          <Text style={styles.lastMessage} numberOfLines={2}>
            {item.last_message}
          </Text>
        )}
        <Text style={styles.memberCount}>
          {item.member_count || 0} members
        </Text>
      </View>
      {item.unread_count > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>
            {item.unread_count > 99 ? '99+' : item.unread_count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading groups...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Groups</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("CreateGroup")}
          style={styles.createGroupButton}
        >
          <Ionicons name="add" size={24} color="#10b981" />
          <Text style={styles.createGroupText}>New Group</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.group_id?.toString()}
        renderItem={renderGroup}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#10b981"]}
            tintColor="#10b981"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>No groups yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first group to start chatting
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate("CreateGroup")}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.emptyButtonText}>Create Group</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  createGroupButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9f4",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createGroupText: {
    marginLeft: 5,
    color: "#10b981",
    fontWeight: "600",
  },
  groupItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold"
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  memberCount: {
    fontSize: 12,
    color: "#999",
  },
  unreadBadge: {
    backgroundColor: "#10b981",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold"
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#666",
    marginTop: 20
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 10,
  },
});

export default GroupListScreen;
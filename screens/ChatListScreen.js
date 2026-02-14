import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Image,
  Platform,
  StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const BASE_URL = "https://jekfarms.com.ng/chatinterface";
const PRIMARY_COLOR = "#10b981";

const ChatListScreen = () => {
  const [conversations, setConversations] = useState([]);
  const [groups, setGroups] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const navigation = useNavigation();

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

  // Function to mark messages as read
  const markMessagesAsRead = useCallback(async (conversationId) => {
    if (!conversationId || !currentUserId) {
      return false;
    }

    try {
      const response = await fetch(`${BASE_URL}/messages/mark-read.php`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          user_id: currentUserId
        }),
      });

      const data = await response.json();
      
      if (data.status === "success" || data.success) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
      return false;
    }
  }, [currentUserId]);

  const fetchChats = useCallback(async () => {
    if (!currentUserId) {
      return;
    }

    try {
      // Fetch conversations WITH last messages and unread counts
      const convResponse = await fetch(
        `${BASE_URL}/conversations/list.php?user_id=${currentUserId}&include_last_message=true`
      );
      
      if (convResponse.ok) {
        const convData = await convResponse.json();
        
        if (convData.status === "success" && convData.data) {
          const conversationsWithUnread = convData.data.map((conv) => {
            // Get last message details
            const lastMessageText = conv.last_message || "No messages yet";
            const lastMessageTime = conv.last_message_time || conv.created_at;
            const lastMessageSenderId = conv.last_message_sender_id;
            const isYourMessage = lastMessageSenderId == currentUserId;
            
            // Format the last message display
            let displayMessage = lastMessageText;
            if (isYourMessage && lastMessageText !== "No messages yet") {
              displayMessage = `You: ${lastMessageText}`;
            } else if (conv.last_message_sender_name && lastMessageText !== "No messages yet" && !isYourMessage) {
              displayMessage = `${conv.last_message_sender_name}: ${lastMessageText}`;
            }
            
            // Format time
            let formattedTime = "";
            if (lastMessageTime) {
              const messageDate = new Date(lastMessageTime);
              const now = new Date();
              const diffMs = now - messageDate;
              const diffHours = diffMs / (1000 * 60 * 60);
              
              if (diffHours < 24) {
                formattedTime = messageDate.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                });
              } else if (diffHours < 48) {
                formattedTime = 'Yesterday';
              } else {
                formattedTime = messageDate.toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric'
                });
              }
            }
            
            return {
              ...conv,
              unread_count: parseInt(conv.unread_count) || 0,
              last_message: displayMessage,
              last_message_text: lastMessageText,
              is_your_last_message: isYourMessage,
              other_user_name: conv.other_user_name || "Unknown User",
              other_user_image: conv.other_user_image || null,
              formatted_time: formattedTime,
              timestamp: lastMessageTime ? new Date(lastMessageTime).getTime() : Date.now(),
            };
          });
          
          // Sort by timestamp (most recent first)
          conversationsWithUnread.sort((a, b) => b.timestamp - a.timestamp);
          
          setConversations(conversationsWithUnread);
        } else {
          setConversations([]);
        }
      } else {
        console.log("Failed to fetch conversations, status:", convResponse.status);
        setConversations([]);
      }

      // Fetch groups
      const groupResponse = await fetch(
        `${BASE_URL}/groups/list.php?user_id=${currentUserId}`
      );
      
      if (groupResponse.ok) {
        const groupData = await groupResponse.json();
        
        if (groupData.status === "success" && groupData.data) {
          const groupsWithFormattedData = groupData.data.map((group) => {
            // Get last message details
            const lastMessageText = group.last_message || "No messages yet";
            const lastMessageTime = group.last_message_time;
            const lastMessageSenderId = group.last_message_sender_id;
            const isYourMessage = lastMessageSenderId == currentUserId;
            
            // Format the last message display
            let displayMessage = lastMessageText;
            if (isYourMessage && lastMessageText !== "No messages yet") {
              displayMessage = `You: ${lastMessageText}`;
            } else if (group.last_message_sender_name && lastMessageText !== "No messages yet" && !isYourMessage) {
              displayMessage = `${group.last_message_sender_name}: ${lastMessageText}`;
            }
            
            // Format time
            let formattedTime = "";
            if (lastMessageTime) {
              const messageDate = new Date(lastMessageTime);
              const now = new Date();
              const diffMs = now - messageDate;
              const diffHours = diffMs / (1000 * 60 * 60);
              
              if (diffHours < 24) {
                formattedTime = messageDate.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                });
              } else if (diffHours < 48) {
                formattedTime = 'Yesterday';
              } else {
                formattedTime = messageDate.toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric'
                });
              }
            }
            
            return {
              ...group,
              unread_count: parseInt(group.unread_count) || 0,
              last_message: displayMessage,
              last_message_text: lastMessageText,
              is_your_last_message: isYourMessage,
              group_name: group.group_name || "Group",
              group_image: group.group_image || null,
              member_count: parseInt(group.member_count) || 0,
              formatted_time: formattedTime,
              timestamp: lastMessageTime ? new Date(lastMessageTime).getTime() : Date.now(),
            };
          });
          
          // Sort by timestamp
          groupsWithFormattedData.sort((a, b) => b.timestamp - a.timestamp);
          
          setGroups(groupsWithFormattedData);
        } else {
          setGroups([]);
        }
      } else {
        setGroups([]);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      setConversations([]);
      setGroups([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUserId]);

  // Refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (currentUserId) {
        fetchChats();
      }
    }, [currentUserId, fetchChats])
  );

  // Also refresh periodically (every 10 seconds) to catch new messages
  useEffect(() => {
    if (!currentUserId) return;

    const interval = setInterval(() => {
      fetchChats();
    }, 10000); // 10 seconds

    return () => {
      clearInterval(interval);
    };
  }, [currentUserId, fetchChats]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchChats();
  }, [fetchChats]);

  const handleChatPress = useCallback(async (item) => {
    try {
      // If there are unread messages, mark them as read
      if (item.unread_count > 0) {
        const success = await markMessagesAsRead(item.conversation_id);
        
        if (success) {
          // Update local state immediately for better UX
          setConversations(prev => prev.map(conv => 
            conv.conversation_id === item.conversation_id 
              ? { ...conv, unread_count: 0 }
              : conv
          ));
        }
      }
      
      // Navigate to chat screen
      navigation.navigate("Chat", {
        conversationId: item.conversation_id,
        otherUserId: item.other_user_id,
        otherUserName: item.other_user_name,
        otherUserImage: item.other_user_image,
        isGroup: false,
      });
      
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert("Error", "Could not open chat. Please try again.");
    }
  }, [navigation, markMessagesAsRead]);

  const handleGroupPress = useCallback((item) => {
    try {
      navigation.navigate("GroupChat", {
        groupId: item.group_id,
        groupName: item.group_name,
        groupImage: item.group_image,
      });
    } catch (error) {
      console.error("Group navigation error:", error);
    }
  }, [navigation]);

  const renderConversation = ({ item }) => {
    const hasUnread = item.unread_count > 0;
    
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => handleChatPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatar}>
          {item.other_user_image ? (
            <Image 
              source={{ uri: item.other_user_image }} 
              style={styles.avatarImage}
            />
          ) : (
            <Text style={styles.avatarText}>
              {item.other_user_name?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          )}
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={[
              styles.chatName, 
              hasUnread && styles.unreadChatName
            ]} numberOfLines={1}>
              {item.other_user_name || "Unknown User"}
            </Text>
            <Text style={styles.time}>
              {item.formatted_time || ""}
            </Text>
          </View>
          <Text style={[
            styles.lastMessage,
            hasUnread && styles.unreadLastMessage
          ]} numberOfLines={1}>
            {item.last_message}
          </Text>
        </View>
        {hasUnread && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {item.unread_count > 99 ? "99+" : item.unread_count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderGroup = ({ item }) => {
    const hasUnread = item.unread_count > 0;
    
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => handleGroupPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatar}>
          {item.group_image ? (
            <Image 
              source={{ uri: item.group_image }} 
              style={styles.avatarImage}
            />
          ) : (
            <Text style={styles.avatarText}>
              {item.group_name?.charAt(0)?.toUpperCase() || "G"}
            </Text>
          )}
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={[
              styles.chatName, 
              hasUnread && styles.unreadChatName
            ]} numberOfLines={1}>
              {item.group_name || "Group"}
            </Text>
            <Text style={styles.time}>
              {item.formatted_time || ""}
            </Text>
          </View>
          <Text style={[
            styles.lastMessage,
            hasUnread && styles.unreadLastMessage
          ]} numberOfLines={1}>
            {item.last_message}
          </Text>
          <Text style={styles.memberCount}>
            {item.member_count || 0} members
          </Text>
        </View>
        {hasUnread && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {item.unread_count > 99 ? "99+" : item.unread_count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Combine all chats
  const combinedChats = [
    ...conversations.map((conv) => ({ ...conv, type: "conversation" })),
    ...groups.map((group) => ({ ...group, type: "group" })),
  ].sort((a, b) => {
    // Sort by timestamp (most recent first)
    const timeA = a.timestamp || 0;
    const timeB = b.timestamp || 0;
    return timeB - timeA;
  });

  // Calculate total unread messages
  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0) +
                     groups.reduce((sum, group) => sum + (group.unread_count || 0), 0);

  if (loading && !refreshing) {
    return (
      <View style={styles.fullContainer}>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor="#fff" 
          translucent={false}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text style={styles.loadingText}>Loading chats...</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#fff" 
        translucent={false}
      />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        {totalUnread > 0 && (
          <View style={styles.totalUnreadBadge}>
            <Text style={styles.totalUnreadText}>
              {totalUnread} unread
            </Text>
          </View>
        )}
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() => navigation.navigate("UserSearch")}
            style={styles.headerButton}
          >
            <Ionicons name="person-add-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("CreateGroup")}
            style={styles.headerButton}
          >
            <Ionicons name="people-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={combinedChats}
        keyExtractor={(item) =>
          item.type === "conversation"
            ? `conv-${item.conversation_id}`
            : `group-${item.group_id}`
        }
        renderItem={({ item }) =>
          item.type === "conversation"
            ? renderConversation({ item })
            : renderGroup({ item })
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[PRIMARY_COLOR]}
            tintColor={PRIMARY_COLOR}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>No conversations yet</Text>
            <Text style={styles.emptySubtext}>
              Start a conversation or join a group to begin chatting
            </Text>
            <TouchableOpacity
              style={styles.startChatButton}
              onPress={() => navigation.navigate("UserSearch")}
            >
              <Ionicons name="person-add" size={20} color="#fff" />
              <Text style={styles.startChatButtonText}>Start New Chat</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  fullContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  totalUnreadBadge: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  totalUnreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  headerButtons: {
    flexDirection: "row",
  },
  headerButton: {
    padding: 8,
    marginLeft: 12,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  unreadChatName: {
    fontWeight: "bold",
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  unreadLastMessage: {
    color: "#333",
    fontWeight: "500",
  },
  memberCount: {
    fontSize: 12,
    color: "#999",
  },
  time: {
    fontSize: 12,
    color: "#999",
    marginLeft: 8,
  },
  unreadBadge: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 30,
  },
  startChatButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  startChatButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default ChatListScreen;
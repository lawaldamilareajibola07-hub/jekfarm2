// screens/InboxScreen.js
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

const BASE_URL = "https://jekfarms.com.ng";
const PRIMARY_COLOR = "#10b981";

const InboxScreen = () => {
  const [conversations, setConversations] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  
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

  const markMessagesAsRead = useCallback(async (conversationId) => {
    if (!conversationId || !currentUserId) {
      return false;
    }

    try {
      const response = await fetch(`${BASE_URL}/chatinterface/messages/mark-read.php`, {
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
      console.log("📱 Fetching conversations for user:", currentUserId);
      const response = await fetch(
        `${BASE_URL}/chatinterface/conversations/list.php?user_id=${currentUserId}`
      );
      
      console.log(" Response status:", response.status);
      
      if (response.ok) {
        const responseText = await response.text();
        console.log(" Raw response:", responseText);
        
        if (!responseText.trim()) {
          console.log("Empty response from server");
          setConversations([]);
          setTotalUnread(0);
          return;
        }
        
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error(" Failed to parse JSON:", e);
          setConversations([]);
          setTotalUnread(0);
          return;
        }
        
        console.log(" Parsed data:", data);
        
        if (data.status === "success" && data.data) {
          const conversationsWithUnread = data.data.map((conv) => {
            let lastMessageText = "No messages yet";
            let lastMessageTime = null;
            let isYourMessage = false;
            
            if (conv.last_message) {
              lastMessageText = conv.last_message;
              lastMessageTime = conv.last_message_time;
              isYourMessage = conv.last_message_sender_id == currentUserId;
            } else if (conv.recent_message) {
              lastMessageText = conv.recent_message;
              lastMessageTime = conv.recent_message_time;
              isYourMessage = conv.recent_message_sender_id == currentUserId;
            }
            
            let displayMessage = lastMessageText;
            if (isYourMessage && lastMessageText !== "No messages yet") {
              displayMessage = `You: ${lastMessageText}`;
            }
            
            return {
              conversation_id: conv.id || conv.conversation_id,
              other_user_id: conv.other_user_id,
              other_user_name: conv.other_user_name || "Unknown User",
              other_user_image: conv.other_user_image,
              unread_count: conv.unread_count || 0,
              last_message: displayMessage,
              last_message_text: lastMessageText,
              is_your_last_message: isYourMessage,
              formatted_time: lastMessageTime 
                ? new Date(lastMessageTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "",
              timestamp: lastMessageTime ? new Date(lastMessageTime).getTime() : 0,
              is_online: conv.is_online || false,
            };
          });
          
          conversationsWithUnread.sort((a, b) => b.timestamp - a.timestamp);
          
          console.log(` Loaded ${conversationsWithUnread.length} conversations`);
          setConversations(conversationsWithUnread);
          
          const unreadTotal = conversationsWithUnread.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
          setTotalUnread(unreadTotal);
        } else {
          console.log("No conversations found or error:", data.message);
          setConversations([]);
          setTotalUnread(0);
        }
      } else {
        console.log(" Failed to fetch conversations, status:", response.status);
        setConversations([]);
        setTotalUnread(0);
      }

    } catch (error) {
      console.error("Error fetching chats:", error);
      setConversations([]);
      setTotalUnread(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;

    const unsubscribe = navigation.addListener('focus', () => {
      setTimeout(() => {
        fetchChats();
      }, 300);
    });

    return unsubscribe;
  }, [navigation, currentUserId, fetchChats]);

  useFocusEffect(
    useCallback(() => {
      if (currentUserId) {
        setTimeout(() => {
          fetchChats();
        }, 500);
      }
    }, [currentUserId, fetchChats])
  );

  useEffect(() => {
    if (!currentUserId) return;

    const interval = setInterval(() => {
      fetchChats();
    }, 10000);

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
      console.log("💬 Opening chat with:", item.other_user_name);
      
      if (item.unread_count > 0) {
        const success = await markMessagesAsRead(item.conversation_id);
        
        if (success) {
          setConversations(prev => prev.map(conv => 
            conv.conversation_id === item.conversation_id 
              ? { ...conv, unread_count: 0 }
              : conv
          ));
          
          setTotalUnread(prev => Math.max(0, prev - item.unread_count));
        }
      }
      
      navigation.navigate("FarmerChat", {
        conversationId: item.conversation_id,
        otherUserId: item.other_user_id,
        otherUserName: item.other_user_name,
        otherUserImage: item.other_user_image,
      });
      
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert("Error", "Could not open chat. Please try again.");
    }
  }, [navigation, markMessagesAsRead]);

  const handleSearchUsers = () => {
    navigation.navigate("FarmerUserSearch");
  };

  const formatLastMessage = (message) => {
    if (!message || message === "No messages yet") {
      return "No messages yet";
    }
    
    if (message.length > 40) {
      return message.substring(0, 40) + '...';
    }
    
    return message;
  };

  const renderConversation = ({ item }) => {
    const hasUnread = item.unread_count > 0;
    
    return (
      <TouchableOpacity
        style={[
          styles.chatItem,
          hasUnread && styles.unreadChatItem
        ]}
        onPress={() => handleChatPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
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
          {item.is_online && <View style={styles.onlineIndicator} />}
        </View>
        <View style={styles.chatInfo}>
          <Text style={[
            styles.chatName, 
            hasUnread && styles.unreadChatName
          ]} numberOfLines={1}>
            {item.other_user_name || "Unknown User"}
          </Text>
          <Text style={[
            styles.lastMessage,
            hasUnread && styles.unreadLastMessage
          ]} numberOfLines={1}>
            {formatLastMessage(item.last_message)}
          </Text>
        </View>
        <View style={styles.chatMeta}>
          <Text style={[
            styles.time,
            hasUnread && styles.unreadTime
          ]}>
            {item.formatted_time || ""}
          </Text>
          {hasUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {item.unread_count > 99 ? "99+" : item.unread_count}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.fullContainer}>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor="transparent" 
          translucent 
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="transparent" 
        translucent 
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Inbox</Text>
            <Text style={styles.headerSubtitle}>
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              {totalUnread > 0 && (
                <Text style={styles.unreadHeaderSubtitle}>
                  {" "}• {totalUnread} unread
                </Text>
              )}
            </Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={handleSearchUsers}
              style={styles.headerButton}
            >
              <Ionicons name="person-add-outline" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={conversations}
          keyExtractor={(item) => `conv-${item.conversation_id}`}
          renderItem={renderConversation}
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
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>
                Start a conversation with customers
              </Text>
              <TouchableOpacity
                style={styles.startChatButton}
                onPress={handleSearchUsers}
              >
                <Ionicons name="person-add" size={20} color="#fff" />
                <Text style={styles.startChatButtonText}>Search Users</Text>
              </TouchableOpacity>
            </View>
          }
          ListHeaderComponent={
            conversations.length > 0 && (
              <View style={styles.listHeader}>
                <Text style={styles.listHeaderText}>
                  Recent Messages {totalUnread > 0 && `(${totalUnread} unread)`}
                </Text>
              </View>
            )
          }
          contentContainerStyle={styles.listContent}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  fullContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e8e8e8",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  unreadHeaderSubtitle: {
    color: PRIMARY_COLOR,
    fontWeight: "600",
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
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  unreadChatItem: {
    backgroundColor: "#f8fdff",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#fff",
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  unreadChatName: {
    fontWeight: "bold",
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
  },
  unreadLastMessage: {
    color: "#333",
    fontWeight: "500",
  },
  chatMeta: {
    alignItems: "flex-end",
  },
  time: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  unreadTime: {
    color: PRIMARY_COLOR,
    fontWeight: "500",
  },
  unreadBadge: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
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
    marginBottom: 20,
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
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f8faf8",
  },
  listHeaderText: {
    fontSize: 12,
    color: "#177e39",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});

export default InboxScreen;
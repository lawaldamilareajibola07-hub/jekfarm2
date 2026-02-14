import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const ConversationCard = ({ conversation, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(conversation)}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {conversation.other_user_name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{conversation.other_user_name}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {conversation.last_message}
        </Text>
      </View>
      <View style={styles.meta}>
        <Text style={styles.time}>
          {new Date(conversation.last_message_time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
        {conversation.unread_count > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{conversation.unread_count}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
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
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  lastMessage: {
    fontSize: 14,
    color: "gray",
  },
  meta: {
    alignItems: "flex-end",
  },
  time: {
    fontSize: 12,
    color: "gray",
    marginBottom: 5,
  },
  unreadBadge: {
    backgroundColor: "#10b981",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default ConversationCard;

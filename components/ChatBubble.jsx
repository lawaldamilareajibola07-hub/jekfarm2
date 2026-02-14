import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ChatBubble = ({ message, isUser }) => {
  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userBubble : styles.otherBubble,
      ]}
    >
      {!isUser && message.sender && (
        <Text style={styles.senderName}>{message.sender}</Text>
      )}
      <Text style={styles.messageText}>{message.text}</Text>
      {message.created_at && (
        <Text style={styles.timestamp}>
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 18,
    marginVertical: 4,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#10b981",
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    color: "gray",
    marginBottom: 4,
    fontWeight: "bold",
  },
  messageText: {
    fontSize: 16,
    color: "#000",
  },
  timestamp: {
    fontSize: 10,
    color: "gray",
    alignSelf: "flex-end",
    marginTop: 4,
  },
});

export default ChatBubble;

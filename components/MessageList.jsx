import React from "react";
import { FlatList, StyleSheet } from "react-native";
import ChatBubble from "./ChatBubble";

const MessageList = ({ messages, currentUserId }) => {
  const renderMessage = ({ item }) => (
    <ChatBubble
      message={item}
      isUser={item.senderId === currentUserId}
    />
  );

  return (
    <FlatList
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={renderMessage}
      style={styles.container}
      contentContainerStyle={styles.content}
      inverted={false}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 10,
  },
});

export default MessageList;

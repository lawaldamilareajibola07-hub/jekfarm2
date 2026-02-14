import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const InputBar = ({ onSendMessage, placeholder = "Type a message..." }) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.attachButton}>
        <Ionicons name="attach" size={24} color="gray" />
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        value={message}
        onChangeText={setMessage}
        placeholder={placeholder}
        multiline
        maxLength={1000}
      />

      <TouchableOpacity
        style={[styles.sendButton, !message.trim() && styles.disabledButton]}
        onPress={handleSend}
        disabled={!message.trim()}
      >
        <Ionicons
          name="send"
          size={20}
          color={message.trim() ? "#fff" : "gray"}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#10b981",
    borderRadius: 20,
    padding: 10,
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: "#f0f0f0",
  },
});

export default InputBar;

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Animated,
  Image,
  Easing,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { Audio } from "expo-av";
import * as Notifications from "expo-notifications";

const STORAGE_KEY = "JEKFARMS_SUPPORT_CHAT";

export default function CustomerSupport() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [recording, setRecording] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const flatListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const typingAnim = useRef(new Animated.Value(0)).current;

  /* ---------------- LOAD CHAT ---------------- */
  useEffect(() => {
    loadMessages();
    registerForPush();
  }, []);

  const loadMessages = async () => {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      const welcome = [
        {
          id: "1",
          text: "👋 Welcome to Agreon Support.\nHow can we help you today?",
          sender: "support",
          type: "text",
        },
      ];
      setMessages(welcome);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(welcome));
    }
  };

  const saveMessages = async (msgs) => {
    setMessages(msgs);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
  };

  /* ---------------- PUSH NOTIFICATION ---------------- */
  const registerForPush = async () => {
    await Notifications.requestPermissionsAsync();
  };

  const sendLocalNotification = async (message) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "New Support Reply",
        body: message,
      },
      trigger: null,
    });
  };

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  /* ---------------- FADE ANIMATION ---------------- */
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  /* ---------------- TYPING DOT ANIMATION ---------------- */
  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnim, {
            toValue: 0,
            duration: 600,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isTyping]);

  /* ---------------- SEND TEXT ---------------- */
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMsg = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      type: "text",
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, newMsg];
    setInput("");
    await saveMessages(updated);
    simulateSupportReply(updated);
  };

  /* ---------------- SIMULATED ADMIN REPLY ---------------- */
  const simulateSupportReply = (currentMessages) => {
    setIsTyping(true);

    setTimeout(async () => {
      const replyText =
        "Thanks for contacting us. Our admin team will respond shortly.";

      const reply = {
        id: Date.now().toString(),
        text: replyText,
        sender: "support",
        type: "text",
        timestamp: new Date().toISOString(),
      };

      const updated = [...currentMessages, reply];
      setIsTyping(false);
      setUnreadCount((prev) => prev + 1);
      await saveMessages(updated);
      await sendLocalNotification(replyText);
    }, 2000);
  };

  /* ---------------- IMAGE ---------------- */
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.6,
    });

    if (!result.canceled) {
      const imageMsg = {
        id: Date.now().toString(),
        image: result.assets[0].uri,
        sender: "user",
        type: "image",
      };

      const updated = [...messages, imageMsg];
      await saveMessages(updated);
      simulateSupportReply(updated);
    }
  };

  /* ---------------- REAL VOICE RECORDING ---------------- */
  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.log("Recording error:", err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);

    const voiceMsg = {
      id: Date.now().toString(),
      sender: "user",
      type: "voice",
      uri,
    };

    const updated = [...messages, voiceMsg];
    await saveMessages(updated);
    simulateSupportReply(updated);
  };

  /* ---------------- RENDER MESSAGE ---------------- */
  const renderItem = ({ item }) => {
    const isUser = item.sender === "user";

    return (
      <Animated.View
        style={[
          styles.messageContainer,
          isUser ? styles.userContainer : styles.supportContainer,
          { opacity: fadeAnim },
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.supportBubble,
          ]}
        >
          {item.type === "text" && (
            <Text
              style={[
                styles.messageText,
                isUser ? styles.userText : styles.supportText,
              ]}
            >
              {item.text}
            </Text>
          )}

          {item.type === "image" && (
            <Image source={{ uri: item.image }} style={styles.imageMsg} />
          )}

          {item.type === "voice" && (
            <View style={styles.voiceContainer}>
              <Ionicons name="mic" size={18} color="#fff" />
              <Text style={{ color: "#fff", marginLeft: 6 }}>
                Voice Message
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  /* ---------------- UI ---------------- */
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#10B981"
        translucent
      />

      <SafeAreaView style={styles.safeHeader}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Customer Support</Text>
            <Text style={styles.statusText}>
              Online • {unreadCount} unread
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />

        {isTyping && (
          <Animated.View
            style={[
              styles.typingContainer,
              { opacity: typingAnim },
            ]}
          >
            <Text style={styles.typingText}>
              Support is typing...
            </Text>
          </Animated.View>
        )}

        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={pickImage}>
            <Ionicons name="image-outline" size={24} color="#10B981" />
          </TouchableOpacity>

          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            style={styles.input}
          />

          <TouchableOpacity
            onPressIn={startRecording}
            onPressOut={stopRecording}
          >
            <Ionicons name="mic-outline" size={24} color="#10B981" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  safeHeader: {
    backgroundColor: "#10B981",
  },

  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  statusText: {
    color: "#D1FAE5",
    fontSize: 12,
    marginTop: 4,
  },

  messageContainer: {
    marginBottom: 14,
    flexDirection: "row",
  },

  userContainer: { justifyContent: "flex-end" },
  supportContainer: { justifyContent: "flex-start" },

  messageBubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 18,
  },

  userBubble: {
    backgroundColor: "#10B981",
    borderBottomRightRadius: 4,
  },

  supportBubble: {
    backgroundColor: "#E5E7EB",
    borderBottomLeftRadius: 4,
  },

  messageText: { fontSize: 14 },
  userText: { color: "#fff" },
  supportText: { color: "#111827" },

  imageMsg: {
    width: 180,
    height: 180,
    borderRadius: 12,
  },

  voiceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
  },

  input: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 14,
  },

  sendButton: {
    backgroundColor: "#10B981",
    padding: 10,
    borderRadius: 20,
  },

  typingContainer: {
    paddingHorizontal: 16,
    paddingBottom: 6,
  },

  typingText: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
  },
});
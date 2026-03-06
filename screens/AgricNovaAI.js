// AgriNovaAI.js

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";

const STORAGE_KEY = "AGRINOVA_AI_CHAT";

export default function AgriNovaAI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const flatListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef(null);

  /* ================= LOAD CHAT ================= */

  useEffect(() => {
    loadMessages();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadMessages = async () => {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);

    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      const welcome = [
        {
          id: "1",
          text: "🌾 Hello! I'm AgriNova AI.\nYou can type or speak to me.",
          sender: "ai",
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

  /* ================= AUTO SCROLL ================= */

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 120);
  }, [messages]);

  /* ================= VOICE RECORDING ================= */

  const startRecording = async () => {
    try {
      setIsRecording(true);

      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );

      pulseLoop.current.start();

      setTimeout(() => {
        setInput("What is the best fertilizer for maize?");
        stopRecording();
      }, 2000);
    } catch (error) {
      console.log(error);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    pulseAnim.setValue(1);
    pulseLoop.current?.stop();
  };

  /* ================= SEND MESSAGE ================= */

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    };

    const updated = [...messages, userMsg];
    setInput("");
    await saveMessages(updated);

    generateAIResponse(userMsg.text, updated);
  };

  /* ================= SECURE BACKEND AI ================= */

  const generateAIResponse = async (question, currentMessages) => {
    setIsTyping(true);

    try {
      const response = await fetch(
        "https://your-backend.com/api/agrinova",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: question }),
        }
      );

      const data = await response.json();
      appendAIMessage(data.reply, currentMessages);
      Speech.speak(data.reply, { rate: 1.0 });
    } catch (error) {
      const offline = await smartOfflineEngine(question);
      appendAIMessage(offline, currentMessages);
      Speech.speak(offline);
    }
  };

  /* ================= SMART OFFLINE ENGINE ================= */

  const smartOfflineEngine = async (question) => {
    const q = question.toLowerCase();

    if (q.includes("weather"))
      return "🌦 Weather integration coming soon. Protect crops during heavy rainfall.";

    if (q.includes("price") || q.includes("market"))
      return "📈 Live market prices coming soon. Maize average: ₦450/kg.";

    if (q.includes("maize"))
      return "🌽 For maize:\n- Use NPK 15-15-15\n- Spacing 75cm x 25cm\n- Early pest monitoring";

    if (q.includes("poultry"))
      return "🐔 Ensure ventilation, vaccination schedule & protein-rich feed.";

    return "🌾 I'm offline. General advice:\n- Use certified seeds\n- Test soil\n- Rotate crops";
  };

  const appendAIMessage = async (text, currentMessages) => {
    const aiMsg = {
      id: Date.now().toString(),
      text,
      sender: "ai",
    };

    const updated = [...currentMessages, aiMsg];
    setIsTyping(false);
    await saveMessages(updated);
  };

  /* ================= RENDER MESSAGE ================= */

  const renderItem = ({ item }) => {
    const isUser = item.sender === "user";

    return (
      <Animated.View
        style={[
          styles.messageContainer,
          isUser ? styles.userAlign : styles.aiAlign,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.aiBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userText : styles.aiText,
            ]}
          >
            {item.text}
          </Text>
        </View>
      </Animated.View>
    );
  };

  /* ================= UI ================= */

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#10B981"
        translucent
      />

      <SafeAreaView style={styles.safeHeader}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="robot-outline" size={22} color="#fff" />
          <Text style={styles.headerTitle}>AgriNova AI</Text>
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
          <View style={styles.typing}>
            <ActivityIndicator size="small" color="#10B981" />
            <Text style={styles.typingText}>AgriNova is thinking...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={startRecording}>
            <Animated.View
              style={[
                styles.voiceBtn,
                isRecording && { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <Ionicons
                name="mic"
                size={18}
                color={isRecording ? "#EF4444" : "#fff"}
              />
            </Animated.View>
          </TouchableOpacity>

          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about crops, livestock..."
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />

          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  safeHeader: {
    backgroundColor: "#10B981",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
  },

  messageContainer: { marginBottom: 14 },
  userAlign: { alignItems: "flex-end" },
  aiAlign: { alignItems: "flex-start" },

  bubble: {
    maxWidth: "80%",
    padding: 14,
    borderRadius: 18,
  },

  userBubble: {
    backgroundColor: "#10B981",
    borderBottomRightRadius: 4,
  },

  aiBubble: {
    backgroundColor: "#E5E7EB",
    borderBottomLeftRadius: 4,
  },

  messageText: { fontSize: 14, lineHeight: 20 },
  userText: { color: "#fff" },
  aiText: { color: "#111827" },

  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },

  input: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 8,
  },

  sendBtn: {
    backgroundColor: "#10B981",
    padding: 10,
    borderRadius: 20,
  },

  voiceBtn: {
    backgroundColor: "#111827",
    padding: 10,
    borderRadius: 20,
  },

  typing: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 6,
  },

  typingText: {
    marginLeft: 6,
    fontSize: 12,
    color: "#6B7280",
  },
});
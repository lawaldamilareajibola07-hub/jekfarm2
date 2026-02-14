import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const PRIMARY_COLOR = "#10b981";
const BOT_COLOR = "#e5e5e5";
const STORAGE_KEY = "chat_messages";
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ChatBotScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [typingDots] = useState(new Animated.Value(0));
  const [userId, setUserId] = useState(null);
  const [loadingUserId, setLoadingUserId] = useState(true);
  const flatListRef = useRef(null);
  const textInputRef = useRef(null);

  // Load user ID from AsyncStorage
  useEffect(() => {
    loadUserId();
  }, []);

  const loadUserId = async () => {
    try {
      setLoadingUserId(true);
      const userDataString = await AsyncStorage.getItem("user");
      
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        const userId = userData.id || userData.user_id;
        
        if (userId) {
          console.log("User ID loaded from AsyncStorage:", userId);
          setUserId(userId.toString()); // Ensure it's a string
        } else {
          console.warn("User ID not found in user data");
        }
      } else {
        console.warn("No user data found in AsyncStorage");
      }
    } catch (error) {
      console.error("Error loading user ID:", error);
    } finally {
      setLoadingUserId(false);
    }
  };

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Load messages after userId is loaded
  useEffect(() => {
    if (!loadingUserId) {
      loadMessages();
    }
  }, [userId, loadingUserId]);

  const loadMessages = async () => {
    try {
      // Use user-specific storage key if userId exists
      const storageKey = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
      const storedMessages = await AsyncStorage.getItem(storageKey);
      
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      } else {
        const welcome = [
          {
            id: "1",
            text: "Hello! I'm your AgreonPay assistant. How can I help you today?",
            sender: "bot",
          },
        ];
        setMessages(welcome);
        if (userId) {
          await AsyncStorage.setItem(storageKey, JSON.stringify(welcome));
        }
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  // Save messages to storage every time they change
  useEffect(() => {
    if (messages.length > 0 && userId) {
      const storageKey = `${STORAGE_KEY}_${userId}`;
      AsyncStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, userId]);

  useEffect(() => {
    if (loading) startTypingAnimation();
    else typingDots.stopAnimation();
  }, [loading]);

  const startTypingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(typingDots, {
          toValue: 3,
          duration: 900,
          useNativeDriver: false,
          easing: Easing.linear,
        }),
        Animated.timing(typingDots, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const renderTyping = () => {
    const dots = Math.floor(typingDots.__getValue()) % 4;
    const dotText = ".".repeat(dots);
    return (
      <View style={styles.typingContainer}>
        <View style={[styles.messageContainer, styles.botMessage]}>
          <Text style={styles.typingText}>Bot is typing{dotText}</Text>
        </View>
      </View>
    );
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !userId) {
      if (!userId) {
        console.warn("Cannot send message: User ID not available");
        return;
      }
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: "user",
    };

    // Update messages immediately
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      console.log("Sending message to API...");
      console.log("Using User ID:", userId);
      
      const response = await fetch(
        "https://jekfarms.com.ng/jekfarm/api/chat.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId, // Dynamic user ID from AsyncStorage
            message: userMessage.text,
            is_premium: false
          }),
        }
      );

      console.log("Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      let botResponse = "No response from bots.";
      
      if (data && data.ok) {
        botResponse = data.reply || "I received your message but couldn't generate a proper response.";
      } else if (data && data.error) {
        botResponse = `Error: ${data.error}`;
      }

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: "bot",
      };

      setMessages((prev) => [...prev, botMessage]);
      
    } catch (err) {
      console.error("API Error:", err);
      const botMessage = {
        id: (Date.now() + 2).toString(),
        text: "Network error. Please check your connection and try again.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setLoading(false);
      // Scroll to bottom after bot response
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === "user" ? styles.userMessage : styles.botMessage,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          { color: item.sender === "user" ? "#fff" : "#000" },
        ]}
      >
        {item.text}
      </Text>
    </View>
  );

  // Calculate dynamic height for messages container
  const messagesContainerHeight = SCREEN_HEIGHT - 
    (Platform.OS === 'ios' ? 180 : 160) -
    keyboardHeight;

  // Show loading or user prompt if user ID is not available
  if (loadingUserId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AgreonPay Chatbot</Text>
          <Ionicons name="leaf" size={22} color={PRIMARY_COLOR} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text style={styles.loadingText}>Loading chatbot...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AgreonPay Chatbot</Text>
          <Ionicons name="leaf" size={22} color={PRIMARY_COLOR} />
        </View>
        <View style={styles.loginPromptContainer}>
          <Ionicons name="person-outline" size={60} color={PRIMARY_COLOR} />
          <Text style={styles.loginPromptText}>
            User session not found
          </Text>
          <Text style={styles.loginSubText}>
            Please log in to use the chatbot
          </Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.replace("Login")}
          >
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={26} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>AgreonPay Chatbot</Text>
            <Ionicons name="leaf" size={22} color={PRIMARY_COLOR} />
          </View>

          {/* Chat messages */}
          <View style={[styles.messagesContainer, { height: messagesContainerHeight }]}>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              contentContainerStyle={styles.messagesContent}
              onContentSizeChange={() => {
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: false });
                }, 100);
              }}
              onLayout={() => {
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: false });
                }, 100);
              }}
              showsVerticalScrollIndicator={false}
            />
          </View>

          {/* Typing animation */}
          {loading && renderTyping()}

          {/* Input area */}
          <View style={[styles.inputContainer, { marginBottom: keyboardHeight > 0 ? 0 : 30 }]}>
            <TextInput
              ref={textInputRef}
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              placeholderTextColor="#888"
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              enablesReturnKeyAutomatically={true}
              multiline={true}
              blurOnSubmit={false}
              onFocus={() => {
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
              }}
            />
            <TouchableOpacity
              onPress={sendMessage}
              disabled={!inputText.trim() || loading}
              style={[
                styles.sendButton,
                { opacity: inputText.trim() && !loading ? 1 : 0.5 },
              ]}
            >
              <Ionicons name="send" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

// Add ActivityIndicator import at the top
import { ActivityIndicator } from "react-native";

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: "#f5f7f8" 
  },
  container: { 
    flex: 1 
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    zIndex: 10,
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: "#000" 
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: { 
    paddingHorizontal: 12, 
    paddingVertical: 8,
    paddingBottom: 20,
  },
  messageContainer: { 
    maxWidth: "80%", 
    padding: 12, 
    borderRadius: 18, 
    marginVertical: 4 
  },
  userMessage: { 
    alignSelf: "flex-end", 
    backgroundColor: PRIMARY_COLOR, 
    borderBottomRightRadius: 5 
  },
  botMessage: { 
    alignSelf: "flex-start", 
    backgroundColor: BOT_COLOR, 
    borderBottomLeftRadius: 5 
  },
  messageText: { 
    fontSize: 15, 
    lineHeight: 20 
  },
  typingContainer: { 
    paddingHorizontal: 12, 
    marginBottom: 4 
  },
  typingText: { 
    fontStyle: "italic", 
    color: "#666",
    fontSize: 15
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  textInput: { 
    flex: 1, 
    backgroundColor: "#f0f0f0", 
    borderRadius: 25, 
    paddingHorizontal: 15, 
    paddingVertical: Platform.OS === 'ios' ? 12 : 10, 
    color: "#000",
    maxHeight: 100,
    fontSize: 16,
    textAlignVertical: 'center',
  },
  sendButton: { 
    backgroundColor: PRIMARY_COLOR, 
    marginLeft: 10, 
    borderRadius: 25, 
    padding: 10,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Loading and login prompt styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  loginPromptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginPromptText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
  },
  loginSubText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    marginBottom: 30,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChatBotScreen;
// screens/FarmerChat.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Dimensions,
  Modal,
  ActionSheetIOS,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const BASE_URL = "https://jekfarms.com.ng/chatinterface";
const PRIMARY_COLOR = "#10b981";

const FarmerChat = ({ navigation, route }) => {
  const { 
    conversationId: initialConversationId,
    otherUserId,
    otherUserName,
    otherUserImage 
  } = route.params || {};

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [conversationId, setConversationId] = useState(initialConversationId || null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadingVoice, setUploadingVoice] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageActions, setShowMessageActions] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);
  
  const flatListRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const messageIdsRef = useRef(new Set());

  // Initialize user data
  useEffect(() => {
    const getUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUserId(parsedUser.id);
          console.log("👤 Current User ID:", parsedUser.id);
        } else {
          Alert.alert("Error", "User not logged in");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Error getting user:", error);
        Alert.alert("Error", "Could not load user data");
        navigation.goBack();
      }
    };
    getUser();
  }, []);

  // Fetch messages when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (conversationId && currentUserId) {
        console.log("Fetching messages for conversation:", conversationId);
        fetchMessages();
        
        const interval = setInterval(() => {
          fetchMessages();
        }, 3000);
        
        return () => clearInterval(interval);
      } else if (initialConversationId) {
        setConversationId(initialConversationId);
      }
    }, [conversationId, currentUserId])
  );

  // Also use regular useEffect for initial load
  useEffect(() => {
    if (initialConversationId) {
      setConversationId(initialConversationId);
      setLoading(false);
    }
  }, [initialConversationId]);

  // ADDED BACK: Format time functions
  const formatRecordingTime = (seconds) => {
    if (!seconds || seconds === 0 || isNaN(seconds)) return "00:00";
    
    const secs = Math.floor(seconds);
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const formatMessageTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "";
    }
  };

  // DEBUGGING: Test URL accessibility
  const testImageUrl = async (url) => {
    try {
      console.log("🔍 Testing URL:", url);
      const response = await fetch(url, { method: 'HEAD' });
      console.log("🔍 URL Status:", response.status);
      return response.status === 200;
    } catch (error) {
      console.log("🔍 URL Test Error:", error.message);
      return false;
    }
  };

  // FIXED: Better URL construction
  const constructFullUrl = (url) => {
    if (!url || url === 'null' || url === 'undefined') {
      console.log("❌ Empty URL provided");
      return null;
    }
    
    // Clean up backslashes
    url = url.toString().replace(/\\/g, '/');
    console.log("🔗 Cleaning URL:", url);
    
    // Remove any leading/trailing quotes
    url = url.replace(/^["']|["']$/g, '');
    
    // If it's already a full URL
    if (url.startsWith('http')) {
      console.log("✅ Already full URL:", url);
      
      // Test if it has /chatinterface/
      if (url.includes('jekfarms.com.ng')) {
        if (!url.includes('/chatinterface/')) {
          // Try to insert /chatinterface/ after .com.ng
          const newUrl = url.replace('jekfarms.com.ng/', 'jekfarms.com.ng/chatinterface/');
          console.log("🔄 Trying modified URL:", newUrl);
          return newUrl;
        }
      }
      return url;
    }
    
    // Handle relative paths
    let finalUrl = '';
    
    // Remove any leading slash or ./ from relative path
    const cleanPath = url.replace(/^\.?\//, '');
    
    // Check if it already starts with uploads/
    if (cleanPath.startsWith('uploads/')) {
      finalUrl = `https://jekfarms.com.ng/chatinterface/${cleanPath}`;
    } else {
      finalUrl = `https://jekfarms.com.ng/chatinterface/uploads/${cleanPath}`;
    }
    
    console.log("🔗 Built final URL:", finalUrl);
    return finalUrl;
  };

 const fetchMessages = useCallback(async () => {
  if (!conversationId || !currentUserId) {
    console.log("Missing conversationId or currentUserId");
    setLoading(false);
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/messages/get.php?conversation_id=${conversationId}&user_id=${currentUserId}&limit=100&offset=0`
    );
    
    if (!response.ok) {
      console.error("Failed to fetch messages, status:", response.status);
      setLoading(false);
      return;
    }
    
    const data = await response.json();
    console.log("📥 Fetch messages response:", JSON.stringify(data, null, 2));
    
    if (data.status === "success") {
      const formattedMessages = [];
      const seenIds = new Set();
      
      (data.data || []).forEach((msg) => {
        const messageId = msg.message_id?.toString();
        
        if (!messageId || seenIds.has(messageId)) {
          return;
        }
        
        seenIds.add(messageId);
        
        // Debug the raw message data
        console.log("📨 Raw message:", {
          id: messageId,
          text: msg.message_text,
          type: msg.message_type,
          media_url: msg.media_url,
          sender: msg.sender_id
        });
        
        // FIXED: Better message type detection
        // Check if it's a voice note
        const isVoiceNote = msg.message_type === 'audio' || 
                           (msg.media_url && msg.media_url.match(/\.(m4a|mp3|wav|aac|caf|ogg|webm)$/i)) ||
                           (msg.media_url && msg.media_url.includes('/voice_notes/'));
        
        // Check if it's an image
        const isImage = msg.message_type === 'image' || 
                       // Server returns empty string for images
                       (msg.message_type === '' && msg.media_url && msg.media_url.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)) ||
                       (msg.media_url && msg.media_url.includes('/media/'));
        
        // Construct URL - use the simple version
        let mediaUrl = null;
        if (msg.media_url) {
          // SIMPLE FIX: Don't modify full URLs
          if (msg.media_url.startsWith('http')) {
            mediaUrl = msg.media_url;
            console.log("✅ Using original full URL:", mediaUrl);
          } else {
            // For relative paths
            if (msg.media_url.includes('/voice_notes/')) {
              mediaUrl = `https://jekfarms.com.ng/chatinterface/${msg.media_url}`;
            } else if (msg.media_url.includes('/media/')) {
              mediaUrl = `https://jekfarms.com.ng/${msg.media_url}`;
            } else {
              mediaUrl = `https://jekfarms.com.ng/chatinterface/${msg.media_url}`;
            }
            console.log("✅ Built relative URL:", mediaUrl);
          }
        }
        
        // For images, test if URL is accessible
        if (mediaUrl && isImage) {
          console.log("🖼️ Testing image URL:", mediaUrl);
          testImageUrl(mediaUrl);
        }
        
        formattedMessages.push({
          id: messageId,
          text: msg.message_text || "",
          sender_id: msg.sender_id,
          isCurrentUser: msg.sender_id == currentUserId,
          created_at: msg.created_at || new Date().toISOString(),
          status: "sent",
          message_type: isVoiceNote ? 'voice' : (isImage ? 'image' : 'text'),
          media_url: mediaUrl,
          voice_note_url: isVoiceNote ? mediaUrl : null,
          voice_note_duration: msg.duration || msg.voice_note_duration || 0,
        });
      });
      
      formattedMessages.forEach(msg => {
        messageIdsRef.current.add(msg.id);
        if (msg.message_type === 'image' && msg.media_url) {
          console.log("🖼️ Added image message:", {
            id: msg.id,
            url: msg.media_url,
            type: msg.message_type
          });
        }
      });
      
      setMessages(formattedMessages);
      setLoading(false);
      
      if (formattedMessages.length > 0) {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } else {
      console.log("❌ Fetch failed:", data.message);
      setLoading(false);
    }
  } catch (error) {
    console.error("Error fetching messages:", error);
    setLoading(false);
  }
}, [conversationId, currentUserId]);
  const sendTextMessage = async () => {
    const messageText = inputText.trim();
    if (!messageText || !conversationId || !currentUserId || sending) {
      return;
    }

    setSending(true);

    const tempId = `temp_${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      text: messageText,
      sender_id: currentUserId,
      isCurrentUser: true,
      created_at: new Date().toISOString(),
      status: "sending",
      message_type: 'text',
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setInputText("");

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await fetch(`${BASE_URL}/messages/send.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          sender_id: currentUserId,
          message_text: messageText,
        }),
      });

      const data = await response.json();
      
      if (data.status === "success") {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === tempId
              ? {
                  ...msg,
                  id: data.message_id?.toString() || msg.id,
                  status: "sent",
                }
              : msg
          )
        );
      } else {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === tempId ? { ...msg, status: "failed" } : msg
          )
        );
        Alert.alert("Error", data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Send error:", error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === tempId ? { ...msg, status: "failed" } : msg
        )
      );
      Alert.alert("Error", "Network error while sending");
    } finally {
      setSending(false);
    }
  };

  const pickAndSendImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Need gallery access to send images');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log("📸 Selected image:", result.assets[0]);
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (uri) => {
    if (!conversationId || !currentUserId) {
      Alert.alert("Error", "Cannot send - no conversation");
      return;
    }

    try {
      setUploadingImage(true);

      const filename = uri.split('/').pop();
      const fileExt = filename.split('.').pop().toLowerCase();
      
      const formData = new FormData();
      const timestamp = Date.now();
      
      const mimeTypes = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'bmp': 'image/bmp',
        'webp': 'image/webp'
      };
      
      const mimeType = mimeTypes[fileExt] || 'image/jpeg';
      const finalFilename = `image_${currentUserId}_${timestamp}.${fileExt}`;
      
      console.log("📤 Preparing to upload:", {
        uri: uri.substring(0, 50) + '...',
        filename: finalFilename,
        mimeType: mimeType,
        conversationId,
        userId: currentUserId
      });
      
      formData.append('file', {
        uri: uri,
        type: mimeType,
        name: finalFilename,
      });
      
      formData.append('conversation_id', String(conversationId));
      formData.append('sender_id', String(currentUserId));
      formData.append('message_text', inputText.trim());

      console.log('📤 Uploading image to:', `${BASE_URL}/messages/media.php`);
      
      const response = await fetch(`${BASE_URL}/messages/media.php`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const responseText = await response.text();
      console.log('📥 Image upload response:', responseText);
      
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("❌ Parse error:", parseError, "Response:", responseText);
        throw new Error("Invalid server response: " + responseText.substring(0, 100));
      }
      
      console.log("📥 Parsed response data:", data);
      
      if (data.status === 'success' || data.success === true || data.message === 'Image uploaded successfully') {
        // Try all possible fields for the image URL
        const imageUrl = data.file || data.url || data.image_url || data.media_url || data.path || data.data?.file || data.data?.url;
        const messageId = data.message_id || data.id || data.data?.message_id || `image_${timestamp}`;
        
        console.log("✅ Upload success! Image URL from server:", imageUrl);
        console.log("✅ Message ID:", messageId);
        
        if (imageUrl) {
          const finalImageUrl = constructFullUrl(imageUrl);
          console.log("✅ Final constructed URL:", finalImageUrl);
          
          // Test if the URL is accessible
          const isAccessible = await testImageUrl(finalImageUrl);
          console.log("✅ URL accessible:", isAccessible);
          
          // Create optimistic message
          const optimisticMessage = {
            id: messageId,
            text: inputText.trim() || "Image",
            sender_id: currentUserId,
            isCurrentUser: true,
            created_at: new Date().toISOString(),
            status: "sent",
            message_type: 'image',
            media_url: finalImageUrl,
          };
          
          // Add to messages immediately
          setMessages(prev => {
            const newMessages = [...prev, optimisticMessage];
            console.log("📝 Messages after adding image:", newMessages.length);
            return newMessages;
          });
          
          messageIdsRef.current.add(messageId);
          setInputText("");
          
          // Force immediate UI update
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
          
          // Also force a refresh of messages from server
          setTimeout(() => {
            fetchMessages();
          }, 500);
        } else {
          console.warn("⚠️ No image URL in response");
          // Still create a placeholder message
          const optimisticMessage = {
            id: messageId,
            text: inputText.trim() || "Image (uploading...)",
            sender_id: currentUserId,
            isCurrentUser: true,
            created_at: new Date().toISOString(),
            status: "sent",
            message_type: 'image',
            media_url: null,
          };
          
          setMessages(prev => [...prev, optimisticMessage]);
          setInputText("");
        }
      } else {
        const errorMsg = data.error || data.message || 'Upload failed';
        console.error("❌ Upload failed:", errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error("❌ Upload Error:", error);
      Alert.alert("Upload Error", error.message || "Failed to upload image");
      
      // Add failed message
      const failedMessage = {
        id: `failed_${Date.now()}`,
        text: "Failed to send image",
        sender_id: currentUserId,
        isCurrentUser: true,
        created_at: new Date().toISOString(),
        status: "failed",
        message_type: 'text',
      };
      
      setMessages(prev => [...prev, failedMessage]);
    } finally {
      setUploadingImage(false);
    }
  };

  // ADDED BACK: Recording functions
  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Need microphone access for voice notes");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(rec);
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const stopRecording = async () => {
    try {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      const rec = recording;
      setRecording(null);
      setIsRecording(false);

      if (!rec) return;

      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      const duration = recordingTime;

      if (!uri || duration < 1) {
        Alert.alert("Too Short", "Recording must be at least 1 second");
        return;
      }

      await sendVoiceNote(uri, duration);
      setRecordingTime(0);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to record voice note");
    } finally {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    }
  };

  const sendVoiceNote = async (uri, duration) => {
    if (!conversationId || !currentUserId) {
      Alert.alert("Error", "Cannot send - no conversation");
      return;
    }

    try {
      setUploadingVoice(true);

      const filename = uri.split('/').pop();
      const targetExt = "mp3";
      const mimeType = "audio/mpeg";
      const finalFilename = `voice_${Date.now()}.${targetExt}`;

      const formData = new FormData();
      formData.append("file", {
        uri,
        type: mimeType,
        name: finalFilename,
      });

      formData.append("conversation_id", String(conversationId));
      formData.append("sender_id", String(currentUserId));

      const endpoint = `${BASE_URL}/messages/upload_voice_note.php`;

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const resText = await response.text();
      let data;
      try {
        data = JSON.parse(resText);
      } catch {
        throw new Error("Server returned invalid response");
      }

      if (data.status !== "success") {
        throw new Error(data.message || "Upload failed");
      }

      let voiceNoteUrl = data.data?.media_url || data.media_url;
      
      if (voiceNoteUrl) {
        voiceNoteUrl = constructFullUrl(voiceNoteUrl);
      }

      const messageId = data.data?.message_id || `voice_${Date.now()}`;
      const voiceDuration = data.data?.duration || duration;

      const optimisticMessage = {
        id: messageId,
        text: '',
        sender_id: currentUserId,
        isCurrentUser: true,
        created_at: new Date().toISOString(),
        status: "sent",
        message_type: 'voice',
        media_url: voiceNoteUrl,
        voice_note_url: voiceNoteUrl,
        voice_note_duration: voiceDuration,
      };

      setMessages(prev => [...prev, optimisticMessage]);
      messageIdsRef.current.add(messageId);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      setUploadingVoice(false);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to send voice note");
      setUploadingVoice(false);
    }
  };

  const playVoiceNote = async (uri, id) => {
    try {
      if (audioPlayerRef.current) {
        const status = await audioPlayerRef.current.getStatusAsync();
        if (status.isLoaded && !status.isPlaying) {
          await audioPlayerRef.current.playAsync();
          setIsPlaying(true);
          setCurrentPlayingId(id);
        } else if (status.isPlaying) {
          await audioPlayerRef.current.pauseAsync();
          setIsPlaying(false);
          setCurrentPlayingId(null);
        }
        return;
      }

      const { sound } = await Audio.Sound.createAsync({ uri });
      audioPlayerRef.current = sound;
      setIsPlaying(true);
      setCurrentPlayingId(id);
      await sound.playAsync();
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
          audioPlayerRef.current = null;
          setIsPlaying(false);
          setCurrentPlayingId(null);
        }
      });
    } catch (error) {
      console.error("Play error:", error);
      Alert.alert("Error", `Cannot play voice note: ${error.message}`);
    }
  };

  // ADDED BACK: Message action functions
  const deleteMessage = async (messageId) => {
    if (!messageId || !currentUserId) {
      Alert.alert("Error", "Cannot delete message");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/messages/delete.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message_id: messageId,
          user_id: currentUserId,
        }),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        messageIdsRef.current.delete(messageId);
        Alert.alert("Success", "Message deleted");
      } else {
        Alert.alert('Error', data.message || 'Failed to delete message');
      }
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Network error while deleting message');
    }
  };

  const showMessageActionSheet = (message) => {
    setSelectedMessage(message);
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Delete'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 1,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            Alert.alert(
              "Delete Message",
              "Are you sure you want to delete this message?",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deleteMessage(message.id) },
              ]
            );
          }
        }
      );
    } else {
      setShowMessageActions(true);
    }
  };

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.isCurrentUser;
    const isImage = item.message_type === 'image';
    const isVoiceNote = item.message_type === 'voice';
    const isText = item.message_type === 'text';
    
    console.log("🎨 Rendering message:", {
      id: item.id,
      type: item.message_type,
      hasMedia: !!item.media_url,
      url: item.media_url?.substring(0, 50) + '...'
    });
    
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={() => showMessageActionSheet(item)}
        delayLongPress={500}
      >
        <View
          style={[
            styles.messageContainer,
            isCurrentUser ? styles.userMessageContainer : styles.otherMessageContainer,
          ]}
        >
          <View
            style={[
              styles.messageBubble,
              isCurrentUser ? styles.userMessageBubble : styles.otherMessageBubble,
              isImage && styles.imageMessageBubble,
              isVoiceNote && styles.voiceMessageBubble,
            ]}
          >
            {isImage && (
              <>
                {item.media_url ? (
                  <TouchableOpacity 
                    onPress={() => {
                      console.log("🖼️ Opening image:", item.media_url);
                      setSelectedImage(item.media_url);
                      setImageModalVisible(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.imageWrapper}>
                      <Image 
                        source={{ uri: item.media_url }} 
                        style={styles.messageImage}
                        resizeMode="cover"
                        onError={(e) => {
                          console.error("❌ Image load error:", e.nativeEvent.error);
                          console.error("❌ For URL:", item.media_url);
                        }}
                        onLoad={() => {
                          console.log("✅ Image loaded successfully:", item.media_url);
                        }}
                        onLoadStart={() => {
                          console.log("⏳ Image loading started:", item.media_url);
                        }}
                      />
                      {item.status === "sending" && (
                        <View style={styles.imageLoadingOverlay}>
                          <ActivityIndicator size="large" color="#fff" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="image-outline" size={40} color="#ccc" />
                    <Text style={styles.placeholderText}>Loading image...</Text>
                  </View>
                )}
                
                {(item.text && item.text.trim() !== "" && item.text !== "Image") && (
                  <Text style={[
                    isCurrentUser ? styles.userMessageText : styles.otherMessageText,
                    styles.imageCaptionText
                  ]}>
                    {item.text}
                  </Text>
                )}
              </>
            )}
            
            {isVoiceNote && (item.voice_note_url || item.media_url) && (
              <TouchableOpacity 
                onPress={() => playVoiceNote(item.voice_note_url || item.media_url, item.id)}
                style={styles.voiceNoteContainer}
                activeOpacity={0.7}
              >
                <View style={styles.voiceNoteContent}>
                  <Ionicons 
                    name={currentPlayingId === item.id && isPlaying ? "pause-circle" : "play-circle"} 
                    size={28} 
                    color={isCurrentUser ? "#fff" : PRIMARY_COLOR} 
                  />
                  <View style={styles.voiceNoteInfo}>
                    <Text style={[
                      styles.voiceNoteText,
                      isCurrentUser ? styles.userVoiceNoteText : styles.otherVoiceNoteText
                    ]}>
                      {currentPlayingId === item.id && isPlaying ? "Playing..." : "Voice note"}
                    </Text>
                    <Text style={[
                      styles.voiceNoteDurationText,
                      isCurrentUser ? styles.userVoiceNoteDuration : styles.otherVoiceNoteDuration
                    ]}>
                      {formatRecordingTime(item.voice_note_duration)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            
            {isText && item.text && (
              <Text style={isCurrentUser ? styles.userMessageText : styles.otherMessageText}>
                {item.text}
              </Text>
            )}
            
            <View style={styles.messageFooter}>
              <Text style={[
                styles.messageTime,
                isCurrentUser ? styles.userMessageTime : styles.otherMessageTime
              ]}>
                {formatMessageTime(item.created_at)}
              </Text>
              {isCurrentUser && (
                <Ionicons 
                  name={item.status === "sending" ? "time" : 
                         item.status === "sent" ? "checkmark" : 
                         "close-circle"} 
                  size={12} 
                  color={item.status === "sending" ? "#999" : 
                         item.status === "sent" ? "rgba(255,255,255,0.7)" : 
                         "#ff6b6b"} 
                  style={styles.messageStatusIcon}
                />
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMessageActionsModal = () => (
    <Modal
      visible={showMessageActions}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowMessageActions(false)}
    >
      <TouchableOpacity 
        style={styles.actionsModalOverlay}
        activeOpacity={1}
        onPress={() => setShowMessageActions(false)}
      >
        <View style={styles.actionsModalContent}>
          {selectedMessage && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => {
                setShowMessageActions(false);
                Alert.alert(
                  "Delete Message",
                  "Are you sure you want to delete this message?",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: () => deleteMessage(selectedMessage.id) },
                  ]
                );
              }}
            >
              <Ionicons name="trash" size={24} color="#ff6b6b" />
              <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  if (loading && !conversationId) {
    return (
      <View style={styles.loadingContainerFull}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  if (!conversationId) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={60} color="#ff6b6b" />
        <Text style={styles.errorText}>Cannot start chat</Text>
        <Text style={styles.errorSubtext}>Missing conversation information</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.containerFull} edges={['top']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        translucent={false}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonHeader}>
            <Ionicons name="arrow-back" size={24} color={PRIMARY_COLOR} />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            {otherUserImage ? (
              <Image source={{ uri: otherUserImage }} style={styles.headerAvatar} />
            ) : (
              <View style={styles.headerAvatar}>
                <Text style={styles.headerAvatarText}>
                  {otherUserName?.charAt(0)?.toUpperCase() || "C"}
                </Text>
              </View>
            )}
            <Text style={styles.headerTitle} numberOfLines={1}>
              {otherUserName || "Customer"}
            </Text>
          </View>
          
          <View style={styles.headerSpacer} />
        </View>

        {/* MESSAGES LIST */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMessage}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>
                Start the conversation with {otherUserName || "this customer"}
              </Text>
            </View>
          }
          onContentSizeChange={() => {
            if (messages.length > 0) {
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }
          }}
        />

        {/* RECORDING OVERLAY */}
        {isRecording && (
          <View style={styles.recordingOverlay}>
            <View style={styles.recordingContainer}>
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>Recording...</Text>
              </View>
              <Text style={styles.recordingTime}>{formatRecordingTime(recordingTime)}</Text>
              <TouchableOpacity 
                onPress={stopRecording}
                style={styles.stopRecordingButton}
              >
                <Ionicons name="stop" size={30} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* INPUT AREA */}
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            onPress={pickAndSendImage}
            style={styles.mediaButton}
            disabled={sending || uploadingImage || uploadingVoice || isRecording}
          >
            {uploadingImage ? (
              <ActivityIndicator size="small" color={PRIMARY_COLOR} />
            ) : (
              <Ionicons name="image-outline" size={24} color="#666" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={isRecording ? stopRecording : startRecording}
            style={[
              styles.mediaButton,
              isRecording && styles.recordingButtonActive,
            ]}
            disabled={sending || uploadingImage || uploadingVoice}
          >
            {uploadingVoice ? (
              <ActivityIndicator size="small" color={PRIMARY_COLOR} />
            ) : (
              <Ionicons 
                name={isRecording ? "mic" : "mic-outline"} 
                size={24} 
                color={isRecording ? "#ff4444" : "#666"} 
              />
            )}
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            multiline
            maxLength={1000}
            onSubmitEditing={sendTextMessage}
            editable={!sending && !uploadingImage && !uploadingVoice && !isRecording}
          />
          
          <TouchableOpacity
            onPress={sendTextMessage}
            style={[
              styles.sendButton,
              (!inputText.trim() || sending || uploadingImage || uploadingVoice || isRecording) && styles.sendButtonDisabled,
            ]}
            disabled={!inputText.trim() || sending || uploadingImage || uploadingVoice || isRecording}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* IMAGE MODAL */}
        <Modal
          visible={imageModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setImageModalVisible(false)}
        >
          <View style={styles.imageModal}>
            <TouchableOpacity 
              style={styles.imageModalClose}
              onPress={() => setImageModalVisible(false)}
            >
              <Ionicons name="close" size={30} color="#fff" />
            </TouchableOpacity>
            {selectedImage && (
              <Image 
                source={{ uri: selectedImage }} 
                style={styles.fullScreenImage}
                resizeMode="contain"
                onError={(e) => console.log('Modal image error:', e.nativeEvent.error)}
              />
            )}
          </View>
        </Modal>

        {renderMessageActionsModal()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// STYLES - Add these new styles to your existing styles
const styles = StyleSheet.create({
  containerFull: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainerFull: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ff6b6b",
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  backButtonHeader: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerAvatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  headerSpacer: {
    width: 40,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: "80%",
  },
  userMessageContainer: {
    alignSelf: "flex-end",
  },
  otherMessageContainer: {
    alignSelf: "flex-start",
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    paddingBottom: 8,
  },
  userMessageBubble: {
    backgroundColor: PRIMARY_COLOR,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: "#f0f0f0",
    borderBottomLeftRadius: 4,
  },
  imageMessageBubble: {
    padding: 0,
    overflow: "hidden",
  },
  voiceMessageBubble: {
    minWidth: 150,
  },
  userMessageText: {
    color: "#fff",
    fontSize: 16,
  },
  otherMessageText: {
    color: "#333",
    fontSize: 16,
  },
  imageWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  messageImage: {
    width: 200,
    height: 200,
  },
  imageCaptionText: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  voiceNoteContainer: {
    padding: 8,
  },
  voiceNoteContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  voiceNoteInfo: {
    marginLeft: 12,
    flex: 1,
  },
  voiceNoteText: {
    fontSize: 14,
    fontWeight: "500",
  },
  userVoiceNoteText: {
    color: "#fff",
  },
  otherVoiceNoteText: {
    color: "#333",
  },
  voiceNoteDurationText: {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
  },
  userVoiceNoteDuration: {
    color: "rgba(255,255,255,0.8)",
  },
  otherVoiceNoteDuration: {
    color: "#666",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    justifyContent: "flex-end",
  },
  messageTime: {
    fontSize: 11,
    opacity: 0.7,
  },
  userMessageTime: {
    color: "rgba(255,255,255,0.7)",
  },
  otherMessageTime: {
    color: "#666",
  },
  messageStatusIcon: {
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#ccc",
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
    borderTopWidth: 1,
    marginBottom:90,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  mediaButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  recordingButtonActive: {
    backgroundColor: "rgba(255,68,68,0.1)",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  recordingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  recordingContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    minWidth: 200,
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ff4444",
    marginRight: 8,
  },
  recordingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  recordingTime: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  stopRecordingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ff4444",
    justifyContent: "center",
    alignItems: "center",
  },
  imageModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageModalClose: {
    position: "absolute",
    top: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight + 10,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  fullScreenImage: {
    width: width - 40,
    height: width - 40,
  },
  actionsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionsModalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    minWidth: 200,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  deleteButton: {
    marginTop: 4,
  },
  actionText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },
  deleteText: {
    color: "#ff6b6b",
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    color: '#999',
    fontSize: 14,
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
});

export default FarmerChat;
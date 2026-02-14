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

const { width, height } = Dimensions.get("window");
const BASE_URL = "https://jekfarms.com.ng/chatinterface";
const PRIMARY_COLOR = "#10b981";

const ChatScreen = ({ navigation, route }) => {
  const {
    conversationId: initialConversationId,
    otherUserId,
    otherUserName,
    otherUserImage,
    isGroup,
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
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  
  const flatListRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const playbackIntervalRef = useRef(null);
  const messageIdsRef = useRef(new Set());
  const voiceNoteDurationsRef = useRef(new Map());
  const messageDurationsCacheRef = useRef(new Map());
  const shouldAutoScroll = useRef(true);
  const lastMessageCount = useRef(0);
  const hasInitialScrollDone = useRef(false);
  const isUserScrolling = useRef(false);

  useEffect(() => {
    if (!initialConversationId) {
      console.error("No conversationId provided!");
      Alert.alert(
        "Error",
        "No chat selected. Please go back and try again.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } else {
      setConversationId(initialConversationId);
    }
  }, [initialConversationId, navigation]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log("Loading timeout reached");
        setLoading(false);
      }
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, [loading]);

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
        Alert.alert("Error", "Could not load user data");
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    if (conversationId && currentUserId) {
      console.log("Fetching messages for conversation:", conversationId);
      fetchMessages();
    }
  }, [conversationId, currentUserId]);

  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [conversationId, currentUserId]);

  useEffect(() => {
    if (messages.length > 0 && !hasInitialScrollDone.current && !isUserScrolling.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
        hasInitialScrollDone.current = true;
      }, 300);
    }
  }, [messages]);

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
      
      if (data.status === "success") {
        const formattedMessages = [];
        const seenIds = new Set();
        
        (data.data || []).forEach((msg) => {
          const messageId = msg.message_id?.toString();
          
          if (!messageId || seenIds.has(messageId)) {
            return;
          }
          
          seenIds.add(messageId);
          
          const isVoiceNote = msg.message_type === 'voice' || 
                             (msg.media_url && msg.media_url.match(/\.(m4a|mp3|wav|aac|caf|ogg|webm)$/i));
          
          const isImage = msg.message_type === 'image' || 
                         (msg.media_url && msg.media_url.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i));
          
          let voiceDuration = 0;
          if (isVoiceNote) {
            if (messageDurationsCacheRef.current.has(messageId)) {
              voiceDuration = messageDurationsCacheRef.current.get(messageId);
            } else if (voiceNoteDurationsRef.current.has(messageId)) {
              voiceDuration = voiceNoteDurationsRef.current.get(messageId);
              messageDurationsCacheRef.current.set(messageId, voiceDuration);
            } else {
              const durationFields = [
                'duration',
                'voice_note_duration', 
                'voice_duration',
                'voice_duration_seconds',
                'audio_duration',
                'length'
              ];
              
              for (const field of durationFields) {
                if (msg[field] !== undefined && msg[field] !== null) {
                  const val = parseInt(msg[field]);
                  if (!isNaN(val) && val > 0) {
                    voiceDuration = val;
                    messageDurationsCacheRef.current.set(messageId, voiceDuration);
                    voiceNoteDurationsRef.current.set(messageId, voiceDuration);
                    break;
                  }
                }
              }
              
              if (voiceDuration > 1000) {
                voiceDuration = Math.floor(voiceDuration / 1000);
                messageDurationsCacheRef.current.set(messageId, voiceDuration);
                voiceNoteDurationsRef.current.set(messageId, voiceDuration);
              }
            }
          }
          
          formattedMessages.push({
            id: messageId,
            text: isVoiceNote ? "" : (msg.message_text || ""),
            sender_id: msg.sender_id,
            isCurrentUser: msg.sender_id == currentUserId,
            created_at: msg.created_at || new Date().toISOString(),
            status: "sent",
            message_type: isVoiceNote ? 'voice' : (isImage ? 'image' : 'text'),
            media_url: msg.media_url || null,
            voice_note_url: isVoiceNote ? (msg.media_url || null) : null,
            voice_note_duration: voiceDuration,
          });
        });
        
        formattedMessages.forEach(msg => messageIdsRef.current.add(msg.id));
        
        const hasNewMessages = formattedMessages.length > lastMessageCount.current;
        lastMessageCount.current = formattedMessages.length;
        
        setMessages(formattedMessages);
        setLoading(false);
        
        if (shouldAutoScroll.current && hasNewMessages && formattedMessages.length > 0 && !isUserScrolling.current) {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setLoading(false);
    }
  }, [conversationId, currentUserId]);

  const sendTextMessage = async (textToSend = null, replyTo = null) => {
    const messageText = textToSend || inputText.trim();
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
      reply_to_message_id: replyTo?.id || null,
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setInputText("");
    if (replyTo) setReplyToMessage(null);

    if (!isUserScrolling.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }

    try {
      const payload = {
        conversation_id: conversationId,
        sender_id: currentUserId,
        message_text: messageText,
      };

      if (replyTo?.id) {
        payload.reply_to_message_id = replyTo.id;
      }

      const response = await fetch(`${BASE_URL}/messages/send.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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

  const uploadImage = async (uri) => {
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
      const finalFilename = `image_${timestamp}.${fileExt}`;
      
      formData.append('file', {
        uri: uri,
        type: mimeType,
        name: finalFilename,
      });
      
      formData.append('conversation_id', String(conversationId));
      formData.append('sender_id', String(currentUserId));
      formData.append('message_text', inputText.trim());

      const endpoint = `${BASE_URL}/messages/media.php`;
      console.log('Uploading image to:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
      
      const responseText = await response.text();
      console.log('Image upload response:', responseText);
      
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Parse error:", parseError);
        throw new Error("Invalid server response");
      }
      
      if (data.status === 'success' || data.success === true) {
        const imageUrl = data.file || data.url || data.image_url || data.media_url || data.path;
        const messageId = data.message_id || data.id || `image_${timestamp}`;
        
        if (imageUrl) {
          const newMessage = {
            id: messageId,
            text: inputText.trim(),
            sender_id: currentUserId,
            isCurrentUser: true,
            created_at: new Date().toISOString(),
            status: "sent",
            message_type: 'image',
            media_url: imageUrl,
          };
          
          setMessages(prev => [...prev, newMessage]);
          messageIdsRef.current.add(messageId);
          setInputText("");
          
          if (!isUserScrolling.current) {
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }
        }
      } else {
        throw new Error(data.error || data.message || 'Upload failed');
      }
    } catch (error) {
      Alert.alert("Upload Error", error.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const updateMessageDuration = useCallback((messageId, duration) => {
    if (!messageId || !duration) return;
    
    messageDurationsCacheRef.current.set(messageId, duration);
    voiceNoteDurationsRef.current.set(messageId, duration);
    
    setMessages(prev => prev.map(msg => 
      msg.id === messageId && msg.message_type === 'voice'
        ? { ...msg, voice_note_duration: duration }
        : msg
    ));
  }, []);

  const uploadVoiceNote = async (uri, duration) => {
    try {
      if (!duration || duration < 1) {
        Alert.alert("Too Short", "Recording must be at least 1 second.");
        throw new Error("Recording too short");
      }

      const tempMessageId = `voice_temp_${Date.now()}`;
      messageDurationsCacheRef.current.set(tempMessageId, duration);
      voiceNoteDurationsRef.current.set(tempMessageId, duration);

      const filename = uri.split('/').pop();
      const extMatch = filename?.match(/\.([a-zA-Z0-9]+)$/);
      const originalExt = extMatch ? extMatch[1].toLowerCase() : "m4a";

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
      console.log("Uploading to:", endpoint);

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      const resText = await response.text();
      console.log("Response:", resText);

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
      
      console.log("Raw media_url from server:", voiceNoteUrl);
      
      if (voiceNoteUrl) {
        voiceNoteUrl = voiceNoteUrl.replace(/\\/g, '/');
      }
      
      if (voiceNoteUrl) {
        let filename = voiceNoteUrl;
        if (voiceNoteUrl.includes('/')) {
          filename = voiceNoteUrl.split('/').pop();
        }
        
        voiceNoteUrl = `https://jekfarms.com.ng/chatinterface/uploads/voice_notes/${filename}`;
      }

      console.log("Final voice note URL:", voiceNoteUrl);

      const realMessageId = data.data?.message_id || tempMessageId;

      return {
        url: voiceNoteUrl,
        duration: data.data?.duration || duration,
        messageId: realMessageId,
        tempId: tempMessageId,
      };

    } catch (err) {
      console.error("Upload voice error:", err);
      throw new Error(err.message || "Voice upload failed");
    }
  };

  const sendVoiceNoteMessage = async ({ url, duration, messageId, tempId }) => {
    if (!url) {
      Alert.alert("Error", "Voice note URL missing");
      return;
    }

    const finalMessageId = messageId || `voice_${Date.now()}`;

    if (messageIdsRef.current.has(finalMessageId)) return;

    messageDurationsCacheRef.current.set(finalMessageId, duration);
    voiceNoteDurationsRef.current.set(finalMessageId, duration);

    const newMessage = {
      id: finalMessageId,
      media_url: url,
      message_type: "voice",
      sender_id: currentUserId,
      created_at: new Date().toISOString(),
      isCurrentUser: true,
      voice_note_duration: duration,
      voice_note_url: url,
    };

    setMessages(prev => [...prev.filter(m => m.id !== tempId), newMessage]);
    messageIdsRef.current.add(finalMessageId);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    setUploadingVoice(false);
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") return Alert.alert("Mic Blocked");

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
        setRecordingTime(t => {
          if (t >= 120) {
            stopRecording();
            return 120;
          }
          return t + 1;
        });
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

      if (!rec) return Alert.alert("Error", "Nothing recorded");

      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      const duration = recordingTime;

      if (!uri || duration < 1) {
        return Alert.alert("Recording too short");
      }

      setUploadingVoice(true);
      const uploadResult = await uploadVoiceNote(uri, duration);
      await sendVoiceNoteMessage(uploadResult);

      setRecordingTime(0);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.message);
    } finally {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    }
  };

  const playVoiceNote = async (uri, id, duration) => {
    try {
      if (audioPlayerRef.current) {
        await audioPlayerRef.current.stopAsync();
        await audioPlayerRef.current.unloadAsync();
        audioPlayerRef.current = null;
      }

      if (currentPlayingId === id && isPlaying) {
        setIsPlaying(false);
        setCurrentPlayingId(null);
        setPlaybackPosition(0);
        return;
      }

      console.log("Playing voice note:", { id, duration });

      let playUri = uri;
      
      if (playUri) {
        playUri = playUri.replace(/\\/g, '/');
      }
      
      if (playUri) {
        let filename = playUri;
        if (playUri.includes('/')) {
          filename = playUri.split('/').pop();
        }
        
        playUri = `https://jekfarms.com.ng/chatinterface/uploads/voice_notes/${filename}`;
      }

      console.log("Playing from URL:", playUri);
      
      try {
        const testRes = await fetch(playUri, { method: 'HEAD' });
        if (!testRes.ok) {
          throw new Error(`File not found (${testRes.status})`);
        }
      } catch (testErr) {
        console.error("URL test failed:", testErr);
        Alert.alert("File Not Found", "Cannot find the voice note file.");
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: playUri },
        { 
          shouldPlay: true,
          isLooping: false,
          volume: 1.0,
        }
      );

      audioPlayerRef.current = sound;
      setCurrentPlayingId(id);
      setPlaybackDuration(duration || 0);
      setPlaybackPosition(0);
      setIsPlaying(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        
        const pos = Math.floor(status.positionMillis / 1000);
        setPlaybackPosition(pos);
        
        if (status.didJustFinish) {
          setIsPlaying(false);
          setCurrentPlayingId(null);
          setPlaybackPosition(0);
          
          if (audioPlayerRef.current) {
            audioPlayerRef.current.unloadAsync();
            audioPlayerRef.current = null;
          }
        }
      });

    } catch (err) {
      console.error("Play error:", err);
      
      let errorMessage = "Cannot play audio";
      if (err.message.includes('404') || err.message.includes('not found')) {
        errorMessage = "Voice note file not found";
      } else if (err.message.includes('network')) {
        errorMessage = "Network error";
      }
      
      Alert.alert("Playback Error", errorMessage);
      
      setIsPlaying(false);
      setCurrentPlayingId(null);
      setPlaybackPosition(0);
      
      if (audioPlayerRef.current) {
        await audioPlayerRef.current.unloadAsync();
        audioPlayerRef.current = null;
      }
    }
  };

  const showImageSelectionOptions = async () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Gallery'],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            await pickImage('camera');
          } else if (buttonIndex === 2) {
            await pickImage('gallery');
          }
        }
      );
    } else {
      Alert.alert(
        'Send Image',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: () => pickImage('camera') },
          { text: 'Choose from Gallery', onPress: () => pickImage('gallery') },
        ]
      );
    }
  };

  const pickImage = async (sourceType) => {
    try {
      let result;
      
      if (sourceType === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Camera access is required to take photos.');
          return;
        }
        
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: false,
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Gallery access is required to select photos.');
          return;
        }

        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: false,
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const showMessageActionSheet = (message) => {
    setSelectedMessage(message);
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Reply', 'Delete'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 2,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            setReplyToMessage(message);
          } else if (buttonIndex === 2) {
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

  const deleteMessage = async (messageId) => {
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
      } else {
        Alert.alert('Error', data.message || 'Failed to delete message');
      }
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Network error while deleting message');
    }
  };

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

  const renderReplyPreview = () => {
    if (!replyToMessage) return null;
    
    return (
      <View style={styles.replyPreviewContainer}>
        <View style={styles.replyPreviewContent}>
          <View style={styles.replyPreviewHeader}>
            <Ionicons name="arrow-undo" size={16} color={PRIMARY_COLOR} />
            <Text style={styles.replyPreviewTitle}>
              Replying to {replyToMessage.isCurrentUser ? "yourself" : otherUserName}
            </Text>
          </View>
          {replyToMessage.message_type === 'text' && (
            <Text style={styles.replyPreviewText} numberOfLines={1}>
              {replyToMessage.text}
            </Text>
          )}
          {replyToMessage.message_type === 'image' && (
            <Text style={styles.replyPreviewText} numberOfLines={1}>
              📷 Image
            </Text>
          )}
          {replyToMessage.message_type === 'voice' && (
            <Text style={styles.replyPreviewText} numberOfLines={1}>
              🎤 Voice note ({formatRecordingTime(replyToMessage.voice_note_duration || 0)})
            </Text>
          )}
        </View>
        <TouchableOpacity 
          style={styles.replyPreviewCancel}
          onPress={() => setReplyToMessage(null)}
        >
          <Ionicons name="close" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.isCurrentUser;
    const isImage = item.message_type === 'image' && item.media_url;
    const isVoiceNote = item.message_type === 'voice' && (item.voice_note_url || item.media_url);
    const isText = item.message_type === 'text';
    
    const voiceNoteUrl = item.voice_note_url || item.media_url;
    const voiceNoteDuration = item.voice_note_duration || 0;
    const isPlayingThis = currentPlayingId === item.id;
    const currentPosition = isPlayingThis ? playbackPosition : 0;
    
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
            {isImage && item.media_url && (
              <TouchableOpacity 
                onPress={() => {
                  setSelectedImage(item.media_url);
                  setImageModalVisible(true);
                }}
                activeOpacity={0.8}
              >
                <Image 
                  source={{ uri: item.media_url }} 
                  style={styles.messageImage}
                  resizeMode="cover"
                />
                {item.text && item.text.trim() !== "" && (
                  <Text style={isCurrentUser ? styles.userMessageText : styles.otherMessageText}>
                    {item.text}
                  </Text>
                )}
              </TouchableOpacity>
            )}
            
            {isVoiceNote && voiceNoteUrl && (
              <TouchableOpacity 
                onPress={() => playVoiceNote(voiceNoteUrl, item.id, voiceNoteDuration)}
                style={styles.voiceNoteContainer}
                activeOpacity={0.7}
              >
                <View style={styles.voiceNoteContent}>
                  <Ionicons 
                    name={isPlayingThis && isPlaying ? "pause-circle" : "play-circle"} 
                    size={28} 
                    color={isCurrentUser ? "#fff" : PRIMARY_COLOR} 
                  />
                  <View style={styles.voiceNoteInfo}>
                    <Text style={[
                      styles.voiceNoteText,
                      isCurrentUser ? styles.userVoiceNoteText : styles.otherVoiceNoteText
                    ]}>
                      {isPlayingThis && isPlaying ? "Playing..." : "Voice note"}
                    </Text>
                    <View style={styles.voiceNoteDurationContainer}>
                      {isPlayingThis && (
                        <Text style={[
                          styles.voiceNoteDurationText,
                          isCurrentUser ? styles.userVoiceNoteDuration : styles.otherVoiceNoteDuration
                        ]}>
                          {formatRecordingTime(currentPosition)} /
                        </Text>
                      )}
                      <Text style={[
                        styles.voiceNoteDurationText,
                        isCurrentUser ? styles.userVoiceNoteDuration : styles.otherVoiceNoteDuration,
                        { marginLeft: isPlayingThis ? 4 : 0 }
                      ]}>
                        {formatRecordingTime(voiceNoteDuration)}
                      </Text>
                    </View>
                    {isPlayingThis && (
                      <View style={styles.progressBarContainer}>
                        <View style={[
                          styles.progressBar,
                          { 
                            width: voiceNoteDuration > 0 ? `${(currentPosition / voiceNoteDuration) * 100}%` : '0%',
                            backgroundColor: isCurrentUser ? '#fff' : PRIMARY_COLOR
                          }
                        ]} />
                      </View>
                    )}
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
            <>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  setReplyToMessage(selectedMessage);
                  setShowMessageActions(false);
                }}
              >
                <Ionicons name="arrow-undo" size={24} color="#333" />
                <Text style={styles.actionText}>Reply</Text>
              </TouchableOpacity>
              
              <View style={styles.separator} />
              
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
            </>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainerFull}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <View style={styles.containerFull}>
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={PRIMARY_COLOR} />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            {otherUserImage ? (
              <Image source={{ uri: otherUserImage }} style={styles.headerAvatar} />
            ) : (
              <View style={styles.headerAvatar}>
                <Text style={styles.headerAvatarText}>
                  {otherUserName?.charAt(0)?.toUpperCase() || "U"}
                </Text>
              </View>
            )}
            <View>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {otherUserName || "Unknown User"}
              </Text>
              <Text style={styles.headerStatus}>
                {conversationId ? "Connected" : "Connecting..."}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMessage}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          onScrollBeginDrag={() => {
            isUserScrolling.current = true;
          }}
          onScrollEndDrag={() => {
            setTimeout(() => {
              isUserScrolling.current = false;
            }, 1000);
          }}
          onMomentumScrollEnd={() => {
            setTimeout(() => {
              isUserScrolling.current = false;
            }, 1000);
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>
                Send a message to start the conversation
              </Text>
            </View>
          }
        />

        {renderReplyPreview()}

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

        <View style={styles.inputContainer}>
          <TouchableOpacity 
            onPress={showImageSelectionOptions}
            style={styles.mediaButton}
            disabled={sending || uploadingImage || uploadingVoice || isRecording}
          >
            {uploadingImage ? (
              <ActivityIndicator size="small" color={PRIMARY_COLOR} />
            ) : (
              <Ionicons name="image-outline" size={28} color="#666" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={isRecording ? stopRecording : startRecording}
            style={[
              styles.mediaButton,
              isRecording && styles.recordingButtonActive,
              uploadingVoice && styles.uploadingButton
            ]}
            disabled={sending || uploadingImage || uploadingVoice}
          >
            {uploadingVoice ? (
              <ActivityIndicator size="small" color={PRIMARY_COLOR} />
            ) : (
              <Ionicons 
                name={isRecording ? "mic" : "mic-outline"} 
                size={28} 
                color={isRecording ? "#ff6b6b" : "#666"} 
              />
            )}
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={replyToMessage ? "Type a reply..." : "Type a message..."}
            placeholderTextColor="#999"
            multiline
            maxLength={1000}
            onSubmitEditing={() => sendTextMessage(null, replyToMessage)}
            editable={!sending && !uploadingImage && !uploadingVoice && !isRecording}
          />
          
          <TouchableOpacity
            onPress={() => sendTextMessage(null, replyToMessage)}
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
              />
            )}
          </View>
        </Modal>

        {renderMessageActionsModal()}
      </KeyboardAvoidingView>
    </View>
  );
};

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
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight + 20,
  },
  container: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
    height: 60,
  },
  backButton: {
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
  headerStatus: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  headerButton: {
    padding: 8,
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
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
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
  voiceNoteDurationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  voiceNoteDurationText: {
    fontSize: 12,
    opacity: 0.8,
  },
  userVoiceNoteDuration: {
    color: "rgba(255,255,255,0.8)",
  },
  otherVoiceNoteDuration: {
    color: "#666",
  },
  progressBarContainer: {
    height: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 1,
    marginTop: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 1,
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
    alignItems: "flex-end",
    padding: 12,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
    borderTopWidth: 1,
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
    backgroundColor: "rgba(255,107,107,0.1)",
  },
  uploadingButton: {
    opacity: 0.5,
  },
  textInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10,
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
  replyPreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f8f9fa",
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  replyPreviewContent: {
    flex: 1,
    marginRight: 8,
  },
  replyPreviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  replyPreviewTitle: {
    fontSize: 12,
    color: PRIMARY_COLOR,
    marginLeft: 4,
    fontWeight: "500",
  },
  replyPreviewText: {
    fontSize: 14,
    color: "#666",
  },
  replyPreviewCancel: {
    padding: 4,
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
    backgroundColor: "#ff6b6b",
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
    backgroundColor: "#ff6b6b",
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
  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 4,
  },
});

export default ChatScreen;
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
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';

const { width } = Dimensions.get("window");
const BASE_URL = "https://jekfarms.com.ng/chatinterface";
const PRIMARY_COLOR = "#10b981";

const GroupChatScreen = ({ navigation, route }) => {
  const { groupId, groupName, groupImage } = route.params;
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
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
  
  const [groupMembers, setGroupMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [showMembers, setShowMembers] = useState(true);
  
  // User removal state
  const [showRemoveUserModal, setShowRemoveUserModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [removingMember, setRemovingMember] = useState(false);
  
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
    if (!groupId) return;

    const fetchGroupMembers = async () => {
      setLoadingMembers(true);
      try {
        const response = await fetch(
          `${BASE_URL}/groups/members.php?group_id=${groupId}`
        );
        
        const responseText = await response.text();
        
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          Alert.alert("Error", "Invalid response from server");
          return;
        }

        if (data.status === "success") {
          let members = [];
          
          if (Array.isArray(data.data)) {
            members = data.data;
          } else if (data.data && Array.isArray(data.data.members)) {
            members = data.data.members;
          } else if (data.data && Array.isArray(data.data.users)) {
            members = data.data.users;
          } else if (data.members && Array.isArray(data.members)) {
            members = data.members;
          }
          
          setGroupMembers(members || []);
        } else {
          setGroupMembers([]);
        }
      } catch (error) {
        setGroupMembers([]);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchGroupMembers();
  }, [groupId]);

  useEffect(() => {
    if (groupId && currentUserId) {
      fetchMessages();
    }
  }, [groupId, currentUserId]);

  useEffect(() => {
    if (!groupId || !currentUserId) return;

    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [groupId, currentUserId]);

  useEffect(() => {
    if (messages.length > 0 && !hasInitialScrollDone.current && !isUserScrolling.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
        hasInitialScrollDone.current = true;
      }, 300);
    }
  }, [messages]);

  const fetchMessages = useCallback(async () => {
    if (!groupId || !currentUserId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/messages/get.php?group_id=${groupId}&user_id=${currentUserId}&limit=100&offset=0`
      );
      
      if (!response.ok) {
        setLoading(false);
        return;
      }
      
      const responseText = await response.text();
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        setLoading(false);
        return;
      }

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
            sender_name: msg.sender_name || "Unknown",
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
      setLoading(false);
    }
  }, [groupId, currentUserId]);

  // Remove user function
  const removeUserFromGroup = async () => {
    if (!selectedMember || !currentUserId || !groupId) {
      Alert.alert("Error", "Missing information to remove user");
      return;
    }

    const memberId = selectedMember.user_id || selectedMember.id;
    if (!memberId) {
      Alert.alert("Error", "Could not identify user");
      return;
    }

    // Don't allow removing yourself
    if (memberId.toString() === currentUserId.toString()) {
      Alert.alert("Cannot Remove", "You cannot remove yourself from the group");
      setShowRemoveUserModal(false);
      setSelectedMember(null);
      return;
    }

    setRemovingMember(true);
    try {
      const payload = {
        group_id: groupId,
        user_id: memberId,
        removed_by: currentUserId,
      };

      const response = await fetch(`${BASE_URL}/groups/remove-member.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (data.status === "success") {
        // Remove the user from the local state
        setGroupMembers(prev => prev.filter(member => 
          (member.user_id || member.id)?.toString() !== memberId.toString()
        ));
        Alert.alert("Success", data.message || "User removed from group");
      } else {
        Alert.alert("Error", data.message || "Failed to remove user");
      }
    } catch (error) {
      Alert.alert("Error", "Network error while removing user");
    } finally {
      setRemovingMember(false);
      setShowRemoveUserModal(false);
      setSelectedMember(null);
    }
  };

  // Show remove user confirmation on long press
  const handleMemberLongPress = (member) => {
    const memberId = member.user_id || member.id;
    
    // Don't show remove option for yourself
    if (memberId?.toString() === currentUserId?.toString()) {
      Alert.alert("Cannot Remove", "You cannot remove yourself from the group");
      return;
    }

    setSelectedMember(member);
    
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Remove User'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 1,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            setShowRemoveUserModal(true);
          }
        }
      );
    } else {
      setShowRemoveUserModal(true);
    }
  };

  const sendTextMessage = async (textToSend = null, replyTo = null) => {
    const messageText = textToSend || inputText.trim();
    if (!messageText || !groupId || !currentUserId || sending) {
      return;
    }

    setSending(true);

    const tempId = `temp_${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      text: messageText,
      sender_id: currentUserId,
      sender_name: "You",
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
        group_id: groupId,
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

      const responseText = await response.text();
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error("Invalid server response");
      }
      
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
      setMessages(prev =>
        prev.map(msg =>
          msg.id === tempId ? { ...msg, status: "failed" } : msg
        )
      );
      Alert.alert("Error", error.message || "Network error while sending");
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
      
      formData.append('group_id', String(groupId));
      formData.append('sender_id', String(currentUserId));
      
      if (inputText.trim()) {
        formData.append('message_text', inputText.trim());
      }
      
      const endpoint = `${BASE_URL}/messages/media.php`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
      
      const responseText = await response.text();
      
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        const urlMatch = responseText.match(/(https?:\/\/[^\s<>"']+\.(jpg|jpeg|png|gif|bmp|webp))/i);
        if (urlMatch) {
          data = {
            status: 'success',
            file: urlMatch[0],
            message_id: `image_${timestamp}`,
          };
        } else {
          throw new Error("Invalid server response");
        }
      }
      
      if (data.status === 'success' || data.success === true) {
        const imageUrl = data.file || data.url || data.image_url || data.media_url || data.path;
        const messageId = data.message_id || data.id || `image_${timestamp}`;
        
        if (imageUrl) {
          const newMessage = {
            id: messageId,
            text: inputText.trim(),
            sender_id: currentUserId,
            sender_name: "You",
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

      formData.append("group_id", String(groupId));
      formData.append("sender_id", String(currentUserId));

      const endpoint = `${BASE_URL}/messages/upload_voice_note.php`;

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
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
        voiceNoteUrl = voiceNoteUrl.replace(/\\/g, '/');
      }
      
      if (voiceNoteUrl) {
        let filename = voiceNoteUrl;
        if (voiceNoteUrl.includes('/')) {
          filename = voiceNoteUrl.split('/').pop();
        }
        
        voiceNoteUrl = `https://jekfarms.com.ng/chatinterface/uploads/voice_notes/${filename}`;
      }

      const realMessageId = data.data?.message_id || tempMessageId;

      return {
        url: voiceNoteUrl,
        duration: data.data?.duration || duration,
        messageId: realMessageId,
        tempId: tempMessageId,
      };

    } catch (err) {
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
      sender_name: "You",
      isCurrentUser: true,
      voice_note_duration: duration,
      voice_note_url: url,
      created_at: new Date().toISOString(),
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

      try {
        const testRes = await fetch(playUri, { method: 'HEAD' });
        if (!testRes.ok) {
          throw new Error(`File not found (${testRes.status})`);
        }
      } catch (testErr) {
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
              Replying to {replyToMessage.sender_name || "user"}
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

  const renderMemberItem = (member) => {
    let displayName = "Unknown";
    if (member.full_name) displayName = member.full_name;
    else if (member.name) displayName = member.name;
    else if (member.username) displayName = member.username;
    else if (member.email) displayName = member.email;
    
    const memberId = member.user_id || member.id;
    const isCurrentUser = memberId?.toString() === currentUserId?.toString();
    const isOnline = member.is_online === 1 || 
                    member.online_status === 1 || 
                    member.status === "online";

    return (
      <TouchableOpacity
        key={memberId || Math.random().toString()}
        style={styles.memberItem}
        onLongPress={() => handleMemberLongPress(member)}
        delayLongPress={500}
        activeOpacity={0.7}
      >
        <View style={styles.memberAvatarContainer}>
          <View style={[
            styles.memberAvatar,
            isCurrentUser && styles.currentUserAvatar
          ]}>
            <Text style={styles.memberAvatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          {isOnline && <View style={styles.onlineIndicator} />}
        </View>
        <Text style={styles.memberName} numberOfLines={1}>
          {isCurrentUser ? "You" : displayName.split(" ")[0]}
        </Text>
      </TouchableOpacity>
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
          {!isCurrentUser && (
            <Text style={styles.senderName}>{item.sender_name}</Text>
          )}
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

  const renderRemoveUserModal = () => (
    <Modal
      visible={showRemoveUserModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        if (!removingMember) {
          setShowRemoveUserModal(false);
          setSelectedMember(null);
        }
      }}
    >
      <View style={styles.removeModalOverlay}>
        <View style={styles.removeModalContent}>
          <Text style={styles.removeModalTitle}>Remove User</Text>
          
          {selectedMember && (
            <>
              <View style={styles.selectedMemberInfo}>
                <View style={styles.selectedMemberAvatar}>
                  <Text style={styles.selectedMemberAvatarText}>
                    {selectedMember.full_name?.charAt(0)?.toUpperCase() || 
                     selectedMember.name?.charAt(0)?.toUpperCase() || 
                     selectedMember.username?.charAt(0)?.toUpperCase() || 
                     selectedMember.email?.charAt(0)?.toUpperCase() || "U"}
                  </Text>
                </View>
                <Text style={styles.selectedMemberName}>
                  {selectedMember.full_name || selectedMember.name || selectedMember.username || selectedMember.email || "Unknown User"}
                </Text>
              </View>
              
              <Text style={styles.removeModalText}>
                Are you sure you want to remove this user from the group?
              </Text>
            </>
          )}
          
          <View style={styles.removeModalButtons}>
            <TouchableOpacity
              style={[styles.removeModalButton, styles.cancelButton]}
              onPress={() => {
                setShowRemoveUserModal(false);
                setSelectedMember(null);
              }}
              disabled={removingMember}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.removeModalButton, styles.removeButton]}
              onPress={removeUserFromGroup}
              disabled={removingMember}
            >
              {removingMember ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.removeButtonText}>Remove</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const toggleMembersView = () => {
    setShowMembers(!showMembers);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainerFull}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <View style={styles.containerFull}>
      <StatusBar
        backgroundColor="#fff"
        barStyle="dark-content"
        translucent={false}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerInfo}
            onPress={toggleMembersView}
            activeOpacity={0.7}
          >
            <View style={styles.groupAvatar}>
              <Text style={styles.groupAvatarText}>
                {groupName?.charAt(0)?.toUpperCase() || "G"}
              </Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {groupName || "Group Chat"}
              </Text>
              <Text style={styles.headerSubtitle}>
                {loadingMembers ? "Loading..." : `${groupMembers.length} members`}
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={toggleMembersView} style={styles.membersToggle}>
            <Ionicons 
              name={showMembers ? "chevron-up" : "chevron-down"} 
              size={24} 
              color={PRIMARY_COLOR} 
            />
          </TouchableOpacity>
        </View>

        {showMembers && (
          <View style={styles.membersSection}>
            {loadingMembers ? (
              <View style={styles.membersLoading}>
                <ActivityIndicator size="small" color={PRIMARY_COLOR} />
                <Text style={styles.loadingText}>Loading members...</Text>
              </View>
            ) : groupMembers.length > 0 ? (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.membersScrollView}
                contentContainerStyle={styles.membersScrollContent}
              >
                {groupMembers.map(member => renderMemberItem(member))}
              </ScrollView>
            ) : (
              <View style={styles.noMembers}>
                <Text style={styles.noMembersText}>No members found</Text>
              </View>
            )}
          </View>
        )}

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
                Send the first message to start the conversation
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
        {renderRemoveUserModal()}
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
  },
  container: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
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
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  groupAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  groupAvatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerText: {
    flex: 1,
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  headerSubtitle: { 
    fontSize: 12, 
    color: "#666",
  },
  membersToggle: {
    padding: 5,
    marginLeft: 10,
  },
  membersSection: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingVertical: 12,
  },
  membersLoading: {
    padding: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  membersScrollView: {
    flexGrow: 0,
  },
  membersScrollContent: {
    paddingHorizontal: 15,
    alignItems: "center",
  },
  memberItem: {
    alignItems: "center",
    marginRight: 16,
    width: 65,
  },
  memberAvatarContainer: {
    position: "relative",
    marginBottom: 6,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  currentUserAvatar: {
    backgroundColor: "#666",
  },
  memberAvatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#fff",
  },
  memberName: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
    fontWeight: "500",
  },
  noMembers: {
    padding: 15,
    alignItems: "center",
  },
  noMembersText: {
    color: "#999",
    fontSize: 14,
  },
  messagesList: { 
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  messagesContainer: { 
    padding: 15,
    paddingBottom: 20,
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
  senderName: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    marginLeft: 12,
    fontWeight: "600",
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
  // Remove User Modal Styles
  removeModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  removeModalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  removeModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  selectedMemberInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
    justifyContent: "center",
  },
  selectedMemberAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  selectedMemberAvatarText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  selectedMemberName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  removeModalText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  removeModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  removeModalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  removeButton: {
    backgroundColor: "#ff6b6b",
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

export default GroupChatScreen;
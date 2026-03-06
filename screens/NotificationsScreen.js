import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    RefreshControl,
    Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/axios";
import { useNavigation } from "@react-navigation/native";

const NotificationsScreen = () => {
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const storedUser = await AsyncStorage.getItem("user");
            if (storedUser) {
                const user = JSON.parse(storedUser);
                setUserId(user.id);
                fetchNotifications(user.id);
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error("Error loading user:", error);
            setLoading(false);
        }
    };

    const fetchNotifications = async (id) => {
        try {
            const response = await api.post("api/notifications/get_notifications.php?action=list", {
                user_id: id,
            });
            if (response.data.status === "success") {
                setNotifications(response.data.notifications);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        if (userId) {
            fetchNotifications(userId);
        } else {
            setRefreshing(false);
        }
    }, [userId]);

    const handleMarkAsRead = async (notification) => {
        if (notification.is_read == 1) return;

        try {
            // Optimistic update
            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, is_read: 1 } : n)
            );

            await api.post("api/notifications/get_notifications.php?action=mark-read", {
                id: notification.id,
                user_id: userId
            });
        } catch (error) {
            console.error("Error marking read:", error);
        }

        if (notification.action_url) {
            navigation.navigate(notification.action_url);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
            await api.post("api/notifications/get_notifications.php?action=mark-all-read", {
                user_id: userId
            });
        } catch (error) {
            console.error("Error marking all read:", error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case "kyc": return "person-circle-outline";
            case "success": return "checkmark-circle-outline";
            case "warning": return "warning-outline";
            case "error": return "alert-circle-outline";
            default: return "notifications-outline";
        }
    };

    const getColor = (type) => {
        switch (type) {
            case "kyc": return "#f59e0b";
            case "success": return "#10b981";
            case "warning": return "#f59e0b";
            case "error": return "#ef4444";
            default: return "#3b82f6";
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.card, item.is_read == 0 && styles.unreadCard]}
            onPress={() => handleMarkAsRead(item)}
        >
            <View style={[styles.iconContainer, { backgroundColor: getColor(item.type) + "20" }]}>
                <Ionicons name={getIcon(item.type)} size={24} color={getColor(item.type)} />
            </View>
            <View style={styles.textContainer}>
                <View style={styles.headerRow}>
                    <Text style={[styles.title, item.is_read == 0 && styles.unreadTitle]}>
                        {item.title}
                    </Text>
                    <Text style={styles.time}>
                        {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                </View>
                <Text style={styles.message} numberOfLines={2}>
                    {item.message}
                </Text>
            </View>
            {item.is_read == 0 && <View style={styles.dot} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity onPress={handleMarkAllRead}>
                    <Text style={styles.readAllText}>Read All</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#10b981" />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#10b981"]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconCircle}>
                                <Ionicons name="notifications-off-outline" size={40} color="#9ca3af" />
                            </View>
                            <Text style={styles.emptyTitle}>No Notifications</Text>
                            <Text style={styles.emptyText}>You're all caught up! Check back later.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f9fafb" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
    },
    headerTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
    readAllText: { fontSize: 14, color: "#10b981", fontWeight: "600" },
    listContainer: { padding: 16 },
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    unreadCard: { backgroundColor: "#fff", borderLeftWidth: 4, borderLeftColor: "#10b981" },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    textContainer: { flex: 1 },
    headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
    title: { fontSize: 16, fontWeight: "600", color: "#374151" },
    unreadTitle: { color: "#111827", fontWeight: "700" },
    time: { fontSize: 12, color: "#9ca3af" },
    message: { fontSize: 14, color: "#6b7280", lineHeight: 20 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#ef4444", marginLeft: 8 },
    centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 100 },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#f3f4f6",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    emptyTitle: { fontSize: 18, fontWeight: "700", color: "#374151", marginBottom: 8 },
    emptyText: { fontSize: 14, color: "#9ca3af", textAlign: "center", width: "70%" },
});

export default NotificationsScreen;

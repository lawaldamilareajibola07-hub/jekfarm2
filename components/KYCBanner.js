import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KYCBanner = () => {
    const navigation = useNavigation();
    const [user, setUser] = useState(null);

    useFocusEffect(
        React.useCallback(() => {
            loadUserData();
        }, [])
    );

    const loadUserData = async () => {
        try {
            const storedUser = await AsyncStorage.getItem("user");
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Banner: Error loading user data:", error);
        }
    };

    const isVerified = user?.has_bvn && user?.has_nin;

    if (isVerified || !user) {
        return null;
    }

    return (
        <TouchableOpacity
            style={styles.banner}
            onPress={() => navigation.navigate("CreateVirtualAccount")}
            activeOpacity={0.8}
        >
            <View style={styles.iconContainer}>
                <Ionicons name="alert-circle" size={24} color="#f59e0b" />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.title}>Complete Your Verification</Text>
                <Text style={styles.subtitle}>
                    Add your BVN & NIN to unlock full access
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#f59e0b" />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    banner: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fffbeb",
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#fcd34d",
        shadowColor: "#f59e0b",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        marginHorizontal: 20, // Add margin if not inside padded container
    },
    iconContainer: {
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: "700",
        color: "#92400e",
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 12,
        color: "#b45309",
        fontWeight: "500",
    },
});

export default KYCBanner;

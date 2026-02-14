import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const EmailUpdatedScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <View style={styles.circle}>
                        <Ionicons name="checkmark" size={60} color="#FFFFFF" />
                    </View>
                </View>

                <Text style={styles.title}>Email Updated!</Text>
                <Text style={styles.subtitle}>
                    Your email has been updated successfully!
                </Text>

                <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => navigation.navigate("PersonalInfo")}
                >
                    <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    iconContainer: {
        marginBottom: 30,
    },
    circle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#10B981",
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
        color: "#1F2937",
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: "#6B7280",
        textAlign: "center",
        marginBottom: 40,
    },
    doneButton: {
        backgroundColor: "#10B981",
        width: "100%",
        height: 54,
        borderRadius: 27,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    doneText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
});

export default EmailUpdatedScreen;

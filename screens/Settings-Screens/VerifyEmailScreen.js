import React, { useState, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Linking,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import OTPTextInput from "react-native-otp-textinput";

const VerifyEmailScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const otpRef = useRef(null);

    const handleVerify = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            navigation.navigate("EmailUpdated");
        }, 1500);
    };

    const openEmailApp = () => {
        if (Platform.OS === "ios") {
            Linking.openURL("message://");
        } else {
            Linking.openURL("mailto:");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={22} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Verify OTP</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>Verify OTP</Text>
                <Text style={styles.subtitle}>
                    Please enter the code sent to{"\n"}
                    <Text style={styles.emailText}>emmanuel@gmail.com</Text>
                </Text>

                <View style={styles.otpContainer}>
                    <OTPTextInput
                        ref={otpRef}
                        inputCount={6}
                        tintColor="#10B981"
                        offTintColor="#F3F4F6"
                        textInputStyle={styles.otpInput}
                        containerStyle={styles.otpWrapper}
                    />
                </View>

                <TouchableOpacity
                    style={styles.verifyButton}
                    onPress={handleVerify}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.verifyText}>Verify Email</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.openEmailButton} onPress={openEmailApp}>
                    <Text style={styles.openEmailText}>Open Email App</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.resendButton}>
                    <Text style={styles.resendText}>Resend Link</Text>
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
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1F2937",
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        alignItems: "center",
        paddingTop: 40,
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
        lineHeight: 24,
        marginBottom: 40,
    },
    emailText: {
        fontWeight: "700",
        color: "#1F2937",
    },
    otpContainer: {
        width: "100%",
        marginBottom: 40,
    },
    otpWrapper: {
        width: "100%",
    },
    otpInput: {
        borderWidth: 1,
        borderRadius: 12,
        width: 45,
        height: 55,
        fontSize: 20,
        fontWeight: "700",
        color: "#1F2937",
        backgroundColor: "#F9FAFB",
        borderBottomWidth: 1,
    },
    verifyButton: {
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
    verifyText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
    openEmailButton: {
        marginTop: 20,
        width: "100%",
        height: 54,
        borderRadius: 27,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#10B981",
    },
    openEmailText: {
        color: "#10B981",
        fontSize: 16,
        fontWeight: "700",
    },
    resendButton: {
        marginTop: 20,
        padding: 10,
    },
    resendText: {
        color: "#10B981",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default VerifyEmailScreen;

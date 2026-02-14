"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native"

const SelfieWithID = ({ navigation }) => {
  const [selfieImage, setSelfieImage] = useState(null)

  const handleTakeSelfie = () => {
    // Simulate taking a selfie
    setSelfieImage("captured")
  }

  const handleRetakeSelfie = () => {
    setSelfieImage(null)
  }

  const handleSubmitApplication = () => {
    navigation.navigate("LoanUnderReview")
  }

  const handleBack = () => {
    navigation.goBack()
  }

  if (selfieImage) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "100%" }]} />
            </View>
            <Text style={styles.progressText}>5 / 5</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Selfie with ID Card</Text>
          <Text style={styles.subtitle}>
            Take a selfie holding your ID card next to your face. Ensure your face and ID card are clearly visible.
          </Text>

          {/* Captured Selfie Preview */}
          <View style={styles.capturedContainer}>
            <View style={styles.selfiePreview}>
              <View style={styles.facePlaceholder}>
                <Text style={styles.faceText}>👤</Text>
              </View>
              <View style={styles.idCardInHand}>
                <View style={styles.miniIdCard}>
                  <Text style={styles.miniIdText}>ID CARD</Text>
                  <View style={styles.miniIdPhoto} />
                </View>
              </View>
            </View>
          </View>

          {/* Retake Button */}
          <TouchableOpacity style={styles.retakeButton} onPress={handleRetakeSelfie}>
            <Text style={styles.retakeIcon}>📷</Text>
            <Text style={styles.retakeButtonText}>Retake Selfie</Text>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Submit Application Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmitApplication}>
            <Text style={styles.submitButtonText}>Submit Application</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "100%" }]} />
          </View>
          <Text style={styles.progressText}>5 / 5</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Selfie with ID Card</Text>
        <Text style={styles.subtitle}>
          Take a selfie holding your ID card next to your face. Ensure your face and ID card are clearly visible.
        </Text>

        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.illustration}>
            <View style={styles.personIllustration}>
              <View style={styles.head} />
              <View style={styles.body}>
                <View style={styles.arm} />
                <View style={styles.idCardHeld}>
                  <Text style={styles.idCardText}>ID</Text>
                </View>
              </View>
            </View>
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
            <View style={styles.decorativeDot1} />
            <View style={styles.decorativeDot2} />
            <View style={styles.decorativeDot3} />
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Take Selfie Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.takeSelfieButton} onPress={handleTakeSelfie}>
          <Text style={styles.cameraIcon}>📷</Text>
          <Text style={styles.takeSelfieButtonText}>Take Selfie</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: "#000",
  },
  progressContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    marginRight: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#00A651",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 32,
  },
  illustrationContainer: {
    alignItems: "center",
    marginVertical: 40,
  },
  illustration: {
    width: 200,
    height: 250,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  personIllustration: {
    alignItems: "center",
  },
  head: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#333",
    marginBottom: 8,
  },
  body: {
    width: 80,
    height: 100,
    backgroundColor: "#333",
    borderRadius: 40,
    position: "relative",
  },
  arm: {
    position: "absolute",
    left: -30,
    top: 20,
    width: 60,
    height: 20,
    backgroundColor: "#00A651",
    borderRadius: 10,
    transform: [{ rotate: "-45deg" }],
  },
  idCardHeld: {
    position: "absolute",
    left: -40,
    top: 30,
    width: 40,
    height: 30,
    backgroundColor: "#5A7A8A",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  idCardText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  decorativeCircle1: {
    position: "absolute",
    top: 20,
    left: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  decorativeCircle2: {
    position: "absolute",
    top: 30,
    right: 30,
    width: 25,
    height: 25,
    borderRadius: 12.5,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  decorativeDot1: {
    position: "absolute",
    bottom: 40,
    left: 30,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6B6B",
  },
  decorativeDot2: {
    position: "absolute",
    bottom: 60,
    left: 50,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4ECDC4",
  },
  decorativeDot3: {
    position: "absolute",
    bottom: 50,
    right: 40,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFD93D",
  },
  capturedContainer: {
    marginBottom: 24,
  },
  selfiePreview: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },
  facePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  faceText: {
    fontSize: 60,
  },
  idCardInHand: {
    marginTop: 20,
  },
  miniIdCard: {
    width: 100,
    height: 70,
    backgroundColor: "#5A7A8A",
    borderRadius: 8,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  miniIdText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 4,
  },
  miniIdPhoto: {
    width: 30,
    height: 40,
    backgroundColor: "#CCC",
    borderRadius: 4,
  },
  retakeButton: {
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  retakeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  retakeButtonText: {
    color: "#00A651",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  takeSelfieButton: {
    backgroundColor: "#00A651",
    borderRadius: 25,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  takeSelfieButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#00A651",
    borderRadius: 25,
    padding: 18,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default SelfieWithID

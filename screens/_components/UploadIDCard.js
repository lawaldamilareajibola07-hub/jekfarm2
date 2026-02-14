"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native"

const UploadIDCard = ({ navigation }) => {
  const [idCardImage, setIdCardImage] = useState(null)

  const handleTakePhoto = () => {
    // Simulate taking a photo
    setIdCardImage("captured")
  }

  const handleRetakePhoto = () => {
    setIdCardImage(null)
  }

  const handleContinue = () => {
    navigation.navigate("SelfieWithID")
  }

  const handleBack = () => {
    navigation.goBack()
  }

  if (idCardImage) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "80%" }]} />
            </View>
            <Text style={styles.progressText}>4 / 5</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Upload ID Card Photo</Text>
          <Text style={styles.subtitle}>
            Please upload clear photos of your ID card. This step is crucial for verifying your identity and securing
            your account.
          </Text>

          {/* Captured ID Card Preview */}
          <View style={styles.capturedContainer}>
            <View style={styles.idCardPreview}>
              <View style={styles.idCardHeader}>
                <Text style={styles.idCardTitle}>IDENTIFICATION CARD</Text>
              </View>
              <View style={styles.idCardContent}>
                <View style={styles.idCardPhoto}>
                  <View style={styles.photoPlaceholder} />
                </View>
                <View style={styles.idCardDetails}>
                  <Text style={styles.idCardLabel}>Name</Text>
                  <Text style={styles.idCardValue}>Andrew Ainsley</Text>
                  <Text style={styles.idCardLabel}>ID No.</Text>
                  <Text style={styles.idCardValue}>646-25-7589</Text>
                  <Text style={styles.idCardLabel}>Country</Text>
                  <Text style={styles.idCardValue}>United States</Text>
                  <Text style={styles.idCardLabel}>Issued</Text>
                  <Text style={styles.idCardValue}>Dec 2023</Text>
                  <Text style={styles.idCardLabel}>Expires</Text>
                  <Text style={styles.idCardValue}>Nov 2026</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Retake Button */}
          <TouchableOpacity style={styles.retakeButton} onPress={handleRetakePhoto}>
            <Text style={styles.retakeIcon}>📷</Text>
            <Text style={styles.retakeButtonText}>Retake Photo</Text>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
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
            <View style={[styles.progressFill, { width: "80%" }]} />
          </View>
          <Text style={styles.progressText}>4 / 5</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Upload ID Card Photo</Text>
        <Text style={styles.subtitle}>
          Please upload clear photos of your ID card. This step is crucial for verifying your identity and securing your
          account.
        </Text>

        {/* Correct Example */}
        <View style={styles.exampleContainer}>
          <View style={styles.idCardExample}>
            <View style={styles.idCardHeader}>
              <Text style={styles.idCardTitle}>IDENTIFICATION CARD</Text>
            </View>
            <View style={styles.idCardContent}>
              <View style={styles.idCardPhoto}>
                <View style={styles.photoPlaceholder} />
              </View>
              <View style={styles.idCardDetails}>
                <Text style={styles.idCardLabel}>Name</Text>
                <Text style={styles.idCardValue}>James Johnson</Text>
                <Text style={styles.idCardLabel}>ID No.</Text>
                <Text style={styles.idCardValue}>646-25-4060</Text>
                <Text style={styles.idCardLabel}>Country</Text>
                <Text style={styles.idCardValue}>United States</Text>
                <Text style={styles.idCardLabel}>Issued</Text>
                <Text style={styles.idCardValue}>Dec 2023</Text>
                <Text style={styles.idCardLabel}>Expires</Text>
                <Text style={styles.idCardValue}>Nov 2026</Text>
              </View>
            </View>
          </View>
          <View style={styles.correctBadge}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={styles.correctText}>Correct</Text>
          </View>
        </View>

        {/* Wrong Examples */}
        <Text style={styles.wrongExampleTitle}>Wrong Example</Text>
        <View style={styles.wrongExamplesGrid}>
          <View style={styles.wrongExample}>
            <View style={[styles.idCardSmall, { opacity: 0.3 }]}>
              <View style={styles.idCardHeaderSmall}>
                <Text style={styles.idCardTitleSmall}>ID CARD</Text>
              </View>
              <View style={styles.idCardContentSmall}>
                <View style={styles.photoPlaceholderSmall} />
              </View>
            </View>
            <View style={styles.wrongBadge}>
              <Text style={styles.crossmark}>✕</Text>
              <Text style={styles.wrongText}>Dark</Text>
            </View>
          </View>

          <View style={styles.wrongExample}>
            <View style={[styles.idCardSmall, { opacity: 0.5 }]}>
              <View style={styles.idCardHeaderSmall}>
                <Text style={styles.idCardTitleSmall}>ID CARD</Text>
              </View>
              <View style={styles.idCardContentSmall}>
                <View style={styles.photoPlaceholderSmall} />
              </View>
            </View>
            <View style={styles.wrongBadge}>
              <Text style={styles.crossmark}>✕</Text>
              <Text style={styles.wrongText}>Blur</Text>
            </View>
          </View>

          <View style={styles.wrongExample}>
            <View style={[styles.idCardSmall, { opacity: 0.8 }]}>
              <View style={styles.idCardHeaderSmall}>
                <Text style={styles.idCardTitleSmall}>ID CARD</Text>
              </View>
              <View style={styles.idCardContentSmall}>
                <View style={styles.photoPlaceholderSmall} />
              </View>
            </View>
            <View style={styles.wrongBadge}>
              <Text style={styles.crossmark}>✕</Text>
              <Text style={styles.wrongText}>Reflected light</Text>
            </View>
          </View>

          <View style={styles.wrongExample}>
            <View style={[styles.idCardSmall, { transform: [{ rotate: "-5deg" }] }]}>
              <View style={styles.idCardHeaderSmall}>
                <Text style={styles.idCardTitleSmall}>ID CARD</Text>
              </View>
              <View style={styles.idCardContentSmall}>
                <View style={styles.photoPlaceholderSmall} />
              </View>
            </View>
            <View style={styles.wrongBadge}>
              <Text style={styles.crossmark}>✕</Text>
              <Text style={styles.wrongText}>Crooked</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Take Photo Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.takePhotoButton} onPress={handleTakePhoto}>
          <Text style={styles.cameraIcon}>📷</Text>
          <Text style={styles.takePhotoButtonText}>Take Photo</Text>
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
    marginBottom: 24,
  },
  exampleContainer: {
    marginBottom: 24,
  },
  idCardExample: {
    backgroundColor: "#5A7A8A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  idCardHeader: {
    borderBottomWidth: 2,
    borderBottomColor: "#FFF",
    paddingBottom: 8,
    marginBottom: 12,
  },
  idCardTitle: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  idCardContent: {
    flexDirection: "row",
  },
  idCardPhoto: {
    width: 80,
    height: 100,
    backgroundColor: "#FFF",
    borderRadius: 8,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  photoPlaceholder: {
    width: 60,
    height: 80,
    backgroundColor: "#CCC",
    borderRadius: 4,
  },
  idCardDetails: {
    flex: 1,
  },
  idCardLabel: {
    color: "#CCC",
    fontSize: 10,
    marginTop: 4,
  },
  idCardValue: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  correctBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F5E9",
    padding: 8,
    borderRadius: 8,
  },
  checkmark: {
    color: "#00A651",
    fontSize: 16,
    marginRight: 4,
  },
  correctText: {
    color: "#00A651",
    fontSize: 14,
    fontWeight: "600",
  },
  wrongExampleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 16,
  },
  wrongExamplesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  wrongExample: {
    width: "48%",
    marginBottom: 16,
  },
  idCardSmall: {
    backgroundColor: "#5A7A8A",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    height: 100,
  },
  idCardHeaderSmall: {
    borderBottomWidth: 1,
    borderBottomColor: "#FFF",
    paddingBottom: 4,
    marginBottom: 6,
  },
  idCardTitleSmall: {
    color: "#FFF",
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
  },
  idCardContentSmall: {
    flexDirection: "row",
  },
  photoPlaceholderSmall: {
    width: 30,
    height: 40,
    backgroundColor: "#CCC",
    borderRadius: 2,
  },
  wrongBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFEBEE",
    padding: 6,
    borderRadius: 6,
  },
  crossmark: {
    color: "#F44336",
    fontSize: 14,
    marginRight: 4,
  },
  wrongText: {
    color: "#F44336",
    fontSize: 12,
    fontWeight: "600",
  },
  capturedContainer: {
    marginBottom: 24,
  },
  idCardPreview: {
    backgroundColor: "#5A7A8A",
    borderRadius: 12,
    padding: 16,
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
  takePhotoButton: {
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
  takePhotoButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  continueButton: {
    backgroundColor: "#00A651",
    borderRadius: 25,
    padding: 18,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default UploadIDCard

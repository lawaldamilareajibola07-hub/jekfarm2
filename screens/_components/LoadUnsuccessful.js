import { View, Text, TouchableOpacity, StyleSheet } from "react-native"

const LoanUnsuccessful = ({ navigation }) => {
  const handleReviewAndReapply = () => {
    // Navigate back to start of loan application
    navigation.navigate("PersonnalInformation")
  }

  const handleClose = () => {
    navigation.navigate("Loans")
  }

  return (
    <View style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        {/* Document Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.documentContainer}>
            <View style={styles.document}>
              <View style={styles.documentLine1} />
              <View style={styles.documentLine2} />
              <View style={styles.documentLine3} />
              <View style={styles.documentLine4} />
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Your Loan Application Was Unsuccessful</Text>

        {/* Description */}
        <Text style={styles.description}>
          We regret to inform you that your recent loan application was not approved. Please review your application
          details and try again. You might want to apply to ensure all information provided is accurate and up-to-date.
        </Text>
      </View>

      {/* Review and Reapply Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.reapplyButton} onPress={handleReviewAndReapply}>
          <Text style={styles.reapplyButtonText}>Review and Reapply</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 60,
  },
  closeButton: {
    position: "absolute",
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 24,
    color: "#000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 40,
  },
  documentContainer: {
    width: 100,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  document: {
    width: 70,
    height: 90,
    backgroundColor: "#2C3E50",
    borderRadius: 8,
    padding: 12,
    justifyContent: "space-evenly",
    transform: [{ rotate: "-5deg" }],
  },
  documentLine1: {
    width: "80%",
    height: 4,
    backgroundColor: "#F39C12",
    borderRadius: 2,
  },
  documentLine2: {
    width: "60%",
    height: 4,
    backgroundColor: "#F39C12",
    borderRadius: 2,
  },
  documentLine3: {
    width: "70%",
    height: 4,
    backgroundColor: "#F39C12",
    borderRadius: 2,
  },
  documentLine4: {
    width: "50%",
    height: 4,
    backgroundColor: "#F39C12",
    borderRadius: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  buttonContainer: {
    padding: 20,
  },
  reapplyButton: {
    backgroundColor: "#00A651",
    borderRadius: 25,
    padding: 18,
    alignItems: "center",
  },
  reapplyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default LoanUnsuccessful

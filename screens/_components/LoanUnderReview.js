import { View, Text, TouchableOpacity, StyleSheet } from "react-native"

const LoanUnderReview = ({ navigation }) => {
  const handleOk = () => {
    // Navigate back to home or loans screen
    navigation.navigate("Loans")
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
        {/* Clock Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.clockCircle}>
            <View style={styles.clockFace}>
              <View style={styles.clockHourHand} />
              <View style={styles.clockMinuteHand} />
              <View style={styles.clockCenter} />
            </View>
            <View style={styles.clockRing} />
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Your Loan Application is Under Review</Text>

        {/* Description */}
        <Text style={styles.description}>
          Thank you for applying for a loan limit with Caribu! Our team is currently reviewing your application and will
          update you within the next 24 hours. Please keep an eye on your notifications for the latest updates.
        </Text>
      </View>

      {/* OK Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.okButton} onPress={handleOk}>
          <Text style={styles.okButtonText}>OK</Text>
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
  clockCircle: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  clockFace: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2C3E50",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  clockHourHand: {
    position: "absolute",
    width: 4,
    height: 25,
    backgroundColor: "#F39C12",
    borderRadius: 2,
    top: 15,
  },
  clockMinuteHand: {
    position: "absolute",
    width: 3,
    height: 30,
    backgroundColor: "#F39C12",
    borderRadius: 1.5,
    top: 10,
    transform: [{ rotate: "90deg" }],
  },
  clockCenter: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F39C12",
    position: "absolute",
  },
  clockRing: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#F39C12",
    top: 10,
  },
  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    marginBottom: 32,
  },
  progressFill: {
    width: "70%",
    height: "100%",
    backgroundColor: "#00A651",
    borderRadius: 3,
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
  okButton: {
    backgroundColor: "#00A651",
    borderRadius: 25,
    padding: 18,
    alignItems: "center",
  },
  okButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default LoanUnderReview

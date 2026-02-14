import { View, Text, TouchableOpacity, StyleSheet } from "react-native"

const LoanApproved = ({ navigation }) => {
  const handleViewLoanLimit = () => {
    // Navigate to loan details or dashboard
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

      {/* Confetti Decorations */}
      <View style={styles.confettiContainer}>
        <View style={[styles.confetti, styles.confetti1]} />
        <View style={[styles.confetti, styles.confetti2]} />
        <View style={[styles.confetti, styles.confetti3]} />
        <View style={[styles.confetti, styles.confetti4]} />
        <View style={[styles.confetti, styles.confetti5]} />
        <View style={[styles.confetti, styles.confetti6]} />
        <View style={[styles.confetti, styles.confetti7]} />
        <View style={[styles.confetti, styles.confetti8]} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Rocket Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.rocketContainer}>
            <View style={styles.rocketBody}>
              <View style={styles.rocketWindow} />
              <View style={styles.rocketWingLeft} />
              <View style={styles.rocketWingRight} />
            </View>
            <View style={styles.rocketFlame} />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Congratulations! Your Loan Application is Approved</Text>

        {/* Description */}
        <Text style={styles.description}>
          We're pleased to inform you that your loan application has been approved! You now have access to a loan limit
          of $50,000. Start utilizing your funds for your financial needs immediately.
        </Text>
      </View>

      {/* View Loan Limit Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.viewButton} onPress={handleViewLoanLimit}>
          <Text style={styles.viewButtonText}>View My Loan Limit</Text>
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
  confettiContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  confetti: {
    position: "absolute",
    width: 8,
    height: 16,
    borderRadius: 2,
  },
  confetti1: {
    backgroundColor: "#FF6B6B",
    top: 100,
    right: 50,
    transform: [{ rotate: "15deg" }],
  },
  confetti2: {
    backgroundColor: "#4ECDC4",
    top: 120,
    right: 80,
    transform: [{ rotate: "-20deg" }],
  },
  confetti3: {
    backgroundColor: "#FFD93D",
    top: 140,
    right: 110,
    transform: [{ rotate: "45deg" }],
  },
  confetti4: {
    backgroundColor: "#6BCF7F",
    top: 100,
    right: 140,
    transform: [{ rotate: "-30deg" }],
  },
  confetti5: {
    backgroundColor: "#FF6B6B",
    top: 160,
    right: 60,
    transform: [{ rotate: "60deg" }],
  },
  confetti6: {
    backgroundColor: "#95E1D3",
    top: 180,
    right: 100,
    transform: [{ rotate: "-45deg" }],
  },
  confetti7: {
    backgroundColor: "#F38181",
    top: 200,
    right: 130,
    transform: [{ rotate: "30deg" }],
  },
  confetti8: {
    backgroundColor: "#AA96DA",
    top: 220,
    right: 70,
    transform: [{ rotate: "-15deg" }],
  },
  content: {
    flex: 1,
    paddingHorizontal: 40,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  iconContainer: {
    marginBottom: 40,
  },
  rocketContainer: {
    width: 100,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  rocketBody: {
    width: 50,
    height: 70,
    backgroundColor: "#2C3E50",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  rocketWindow: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#3498DB",
    marginTop: 10,
  },
  rocketWingLeft: {
    position: "absolute",
    left: -15,
    bottom: 0,
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 15,
    borderRightWidth: 0,
    borderBottomWidth: 30,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#F39C12",
  },
  rocketWingRight: {
    position: "absolute",
    right: -15,
    bottom: 0,
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 0,
    borderRightWidth: 15,
    borderBottomWidth: 30,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#F39C12",
  },
  rocketFlame: {
    width: 30,
    height: 20,
    backgroundColor: "#E74C3C",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    marginTop: -5,
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
    zIndex: 2,
  },
  viewButton: {
    backgroundColor: "#00A651",
    borderRadius: 25,
    padding: 18,
    alignItems: "center",
  },
  viewButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default LoanApproved

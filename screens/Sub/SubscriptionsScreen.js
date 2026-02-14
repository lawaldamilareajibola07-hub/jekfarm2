import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

const SubscriptionsScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscriptions</Text>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Your Subscriptions</Text>
          <View style={styles.titleUnderline} />
        </View>

        <View style={styles.card}>
          <Image
            source={require("../../assets/sleepy-cloud.png")}
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={styles.emptyTitle}>You have no subscription</Text>
          <Text style={styles.emptySubtitle}>
            Subscribe to a farmer page and we will display it here
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#22C55E",
    padding: 16,
    paddingTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  backArrow: {
    color: "#22C55E",
    fontSize: 22,
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
    color: "#fff",
  },
  body: {
    padding: 16,
  },
  sectionTitleContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  titleUnderline: {
    width: 40,
    height: 3,
    backgroundColor: "#22C55E",
    marginTop: 4,
    borderRadius: 2,
  },
  card: {
    backgroundColor: "#fff",
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#22C55E",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: 100,
    height: 100, 
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
    color: "#374151",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
  },
});

export default SubscriptionsScreen;

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,

} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons as Icon } from "@expo/vector-icons";
import Modal from "react-native-modal";

const AddMoneyScreen = ({ navigation }) => {
  const [value, setValue] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const fundingMethods = [

    { label: "Foreign Transfer", value: "foreign", icon: "globe-outline" },
    { label: "Crypto Currency", value: "crypto", icon: "logo-bitcoin" },
    { label: "Local Transfer", value: "local", icon: "swap-horizontal" },
  ];

  const handleSelect = (item) => {
    setValue(item.value);
  };

  const handleDone = () => {
    if (!value) {
      Alert.alert("Selection Required", "Please select a funding method");
      return;
    }

    if (value === "crypto") {
      navigation.navigate("CryptoFundingScreen", { fundingType: "crypto" });
    } else if (value === "local") {
      navigation.navigate("DepositScreen", {
        fundingType: "local",
        transferType: "local"
      });
    } else if (value === "foreign") {
      navigation.navigate("DepositScreen", {
        fundingType: "foreign",
        transferType: "foreign"
      });
    }
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Money</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Choose Funding Method</Text>

        {/* Dropdown */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setModalVisible(true)}
        >
          <Icon style={styles.icon} color="#6b7280" name="business" size={20} />
          <Text
            style={
              value ? styles.selectedTextStyle : styles.placeholderStyle
            }
          >
            {value
              ? fundingMethods.find((m) => m.value === value)?.label
              : "Select one"}
          </Text>
          <Icon
            name="chevron-down"
            size={20}
            color="#6b7280"
            style={{ marginLeft: "auto" }}
          />
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal
        isVisible={isModalVisible}
        onSwipeComplete={() => setModalVisible(false)}
        swipeDirection="down"
        style={styles.modal}
        onBackdropPress={() => setModalVisible(false)}
      >
        <View style={styles.modalContent}>
          {/* Drag indicator */}
          <View style={styles.dragHandle} />

          <Text style={styles.modalTitle}>Choose Funding Method</Text>

          {fundingMethods.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={styles.optionRow}
              onPress={() => handleSelect(item)}
            >
              <Icon
                name={item.icon}
                size={22}
                color="#41B63E"
                style={{ marginRight: 12 }}
              />
              <Text style={styles.optionText}>{item.label}</Text>
              <Icon
                name={
                  value === item.value ? "checkmark-circle" : "ellipse-outline"
                }
                size={22}
                color={value === item.value ? "#41B63E" : "#9ca3af"}
              />
            </TouchableOpacity>
          ))}

          {/* Done */}
          <TouchableOpacity
            style={[styles.doneButton, !value && styles.doneButtonDisabled]}
            onPress={handleDone}
            disabled={!value}
          >
            <Text style={styles.doneButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AddMoneyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: "#f8f8f8",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 15

  },
  backButton: {
    backgroundColor: "#41B63E",
    borderRadius: 50,
    padding: 10,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_400Regular",
    width: 250,
    color: "#000",
    textAlign: "center",
    backgroundColor: "#e1f5e5ff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 19,
    marginHorizontal: 10
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,

  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Inter_400Regular",
    marginBottom: 10,
    color: "#333",
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderWidth: 0,
    backgroundColor: "#e0dedeff",
    borderRadius: 22,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  placeholderStyle: {
    fontSize: 14,
    color: "#9ca3af",
    marginLeft: 8,
  },
  selectedTextStyle: {
    fontSize: 14,
    color: "#111827",
    marginLeft: 8,
  },
  icon: {
    marginRight: 6,
  },
  doneButton: {
    backgroundColor: "#41B63E",
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  doneButtonDisabled: {
    backgroundColor: "#cccccc",
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  dragHandle: {
    width: 50,
    height: 5,
    backgroundColor: "#d1d5db",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
    color: "#3a3a3a",
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  optionText: {
    fontSize: 15,
    color: "#111827",
    flex: 1,
    marginLeft: 12,
  },
});
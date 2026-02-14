"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Modal, FlatList } from "react-native"

const PersonnalInformation = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    email: "",
    phoneNumber: "",
    homeAddress: "",
    reasonForLoan: "",
    educationLevel: "",
    ssn: "",
    citizenshipStatus: "",
    maritalStatus: "",
    numberOfDependents: "",
    livingSituation: "",
  })

  const [showDropdown, setShowDropdown] = useState({
    reasonForLoan: false,
    educationLevel: false,
    citizenshipStatus: false,
    maritalStatus: false,
    livingSituation: false,
  })

  const reasonsForLoan = [
    "Business capital loans",
    "Personal loans",
    "Home loans",
    "Education loans",
    "Medical loans",
    "Other",
  ]
  const educationLevels = ["High School", "Bachelor's", "Master's", "Doctorate", "Other"]
  const citizenshipStatuses = ["Citizen", "Permanent Resident", "Work Visa", "Student Visa", "Other"]
  const maritalStatuses = ["Single", "Married", "Divorced", "Widowed"]
  const livingSituations = ["Own", "Rent", "Living with Family", "Other"]

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const toggleDropdown = (field) => {
    setShowDropdown({ ...showDropdown, [field]: !showDropdown[field] })
  }

  const selectDropdownValue = (field, value) => {
    handleInputChange(field, value)
    setShowDropdown({ ...showDropdown, [field]: false })
  }

  const handleContinue = () => {
    // Navigate to Job Information page
    navigation.navigate("JobInformation")
  }

  const renderDropdown = (field, options, placeholder) => (
    <View style={styles.inputContainer}>
      <TouchableOpacity style={styles.dropdown} onPress={() => toggleDropdown(field)}>
        <Text style={formData[field] ? styles.dropdownTextSelected : styles.dropdownTextPlaceholder}>
          {formData[field] || placeholder}
        </Text>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={showDropdown[field]}
        transparent={true}
        animationType="fade"
        onRequestClose={() => toggleDropdown(field)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => toggleDropdown(field)}>
          <View style={styles.dropdownList}>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.dropdownItem} onPress={() => selectDropdownValue(field, item)}>
                  <Text style={styles.dropdownItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progressFilled} />
          </View>
        </View>
        <Text style={styles.stepText}>1 / 5</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Personal Information</Text>
        <Text style={styles.subtitle}>
          We need some basic information to determine your loan eligibility. Your data is safe with us.
        </Text>

        {/* Full Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#999"
            value={formData.fullName}
            onChangeText={(value) => handleInputChange("fullName", value)}
          />
        </View>

        {/* Date of Birth */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Date of Birth</Text>
          <View style={styles.dateInputContainer}>
            <TextInput
              style={styles.dateInput}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#999"
              value={formData.dateOfBirth}
              onChangeText={(value) => handleInputChange("dateOfBirth", value)}
            />
            <Text style={styles.calendarIcon}>📅</Text>
          </View>
        </View>

        {/* Email Address */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email address"
            placeholderTextColor="#999"
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(value) => handleInputChange("email", value)}
          />
        </View>

        {/* Phone Number */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.phoneInputContainer}>
            <View style={styles.countryCodeContainer}>
              <Text style={styles.flagIcon}>🇺🇸</Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="+1 (123) 456-7890"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={formData.phoneNumber}
              onChangeText={(value) => handleInputChange("phoneNumber", value)}
            />
          </View>
        </View>

        {/* Home Address */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Home Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full address"
            placeholderTextColor="#999"
            value={formData.homeAddress}
            onChangeText={(value) => handleInputChange("homeAddress", value)}
          />
        </View>

        {/* Reasons for Loan */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Reasons for Loan</Text>
          {renderDropdown("reasonForLoan", reasonsForLoan, "Select your reasons for Loan")}
        </View>

        {/* Education Level */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Education Level</Text>
          {renderDropdown("educationLevel", educationLevels, "Select your highest education level")}
        </View>

        {/* Social Security Number */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Social Security Number (SSN) / National ID Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your SSN/National ID"
            placeholderTextColor="#999"
            value={formData.ssn}
            onChangeText={(value) => handleInputChange("ssn", value)}
          />
        </View>

        {/* Citizenship Status */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Citizenship Status</Text>
          {renderDropdown("citizenshipStatus", citizenshipStatuses, "Select your citizenship status")}
        </View>

        {/* Marital Status */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Marital Status</Text>
          {renderDropdown("maritalStatus", maritalStatuses, "Select your marital status")}
        </View>

        {/* Number of Dependents */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Number of Dependents</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter number of dependents"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={formData.numberOfDependents}
            onChangeText={(value) => handleInputChange("numberOfDependents", value)}
          />
        </View>

        {/* Current Living Situation */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Current Living Situation</Text>
          {renderDropdown("livingSituation", livingSituations, "Select your living situation")}
        </View>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 24,
    color: "#000",
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E5E5",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFilled: {
    width: "20%",
    height: "100%",
    backgroundColor: "#00A651",
    borderRadius: 4,
  },
  stepText: {
    fontSize: 16,
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
    marginBottom: 30,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  inputContainer: {
    position: "relative",
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#000",
  },
  dropdown: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownTextPlaceholder: {
    fontSize: 16,
    color: "#999",
  },
  dropdownTextSelected: {
    fontSize: 16,
    color: "#000",
  },
  dropdownIcon: {
    fontSize: 12,
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownList: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "80%",
    maxHeight: 300,
    paddingVertical: 8,
  },
  dropdownItem: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#000",
  },
  dateInputContainer: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  calendarIcon: {
    fontSize: 18,
  },
  phoneInputContainer: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  countryCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: "#ddd",
  },
  flagIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  continueButton: {
    backgroundColor: "#00A651",
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 30,
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSpacing: {
    height: 40,
  },
})

export default PersonnalInformation

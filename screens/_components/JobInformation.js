"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Modal, FlatList } from "react-native"

const JobInformation = ({ navigation }) => {
  const [formData, setFormData] = useState({
    employerName: "",
    jobTitle: "",
    employmentType: "",
    industry: "",
    monthlyIncome: "",
    companyName: "",
    startDate: "",
    employerAddress: "",
    employerPhone: "",
    payFrequency: "",
    contractType: "",
    taxId: "",
  })

  const [showDropdown, setShowDropdown] = useState({
    employmentType: false,
    industry: false,
    payFrequency: false,
    contractType: false,
  })

  const employmentTypes = ["Full-Time", "Part-Time", "Contract", "Freelance", "Internship"]
  const industries = ["Technology", "Healthcare", "Finance", "Education", "Retail", "Manufacturing", "Other"]
  const payFrequencies = ["Weekly", "Bi-Weekly", "Monthly", "Annually"]
  const contractTypes = ["Permanent", "Temporary", "Fixed-Term", "Zero-Hours"]

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
    // Navigate to next step (step 3/5)
    console.log("Form data:", formData)
    navigation.navigate('EmergencyContacts');
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
        <Text style={styles.stepText}>2 / 5</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Job Information</Text>
        <Text style={styles.subtitle}>
          To accurately assess your loan eligibility, please fill out your current employment information. Your privacy
          is our priority.
        </Text>

        {/* Current Employer Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Current Employer Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your employer's name"
            placeholderTextColor="#999"
            value={formData.employerName}
            onChangeText={(value) => handleInputChange("employerName", value)}
          />
        </View>

        {/* Job Title/Position */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Job Title/Position</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your job title"
            placeholderTextColor="#999"
            value={formData.jobTitle}
            onChangeText={(value) => handleInputChange("jobTitle", value)}
          />
        </View>

        {/* Employment Type */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Employment Type</Text>
          {renderDropdown("employmentType", employmentTypes, "Select your employment type")}
        </View>

        {/* Industry */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Industry</Text>
          {renderDropdown("industry", industries, "Select your industry")}
        </View>

        {/* Monthly Income */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Monthly Income (Net/Gross)</Text>
          <View style={styles.incomeInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.incomeInput}
              placeholder="10,000"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={formData.monthlyIncome}
              onChangeText={(value) => handleInputChange("monthlyIncome", value)}
            />
          </View>
        </View>

        {/* Employer Company Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Employer Company Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your employer company name"
            placeholderTextColor="#999"
            value={formData.companyName}
            onChangeText={(value) => handleInputChange("companyName", value)}
          />
        </View>

        {/* Employment Start Date */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Employment Start Date</Text>
          <View style={styles.dateInputContainer}>
            <TextInput
              style={styles.dateInput}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#999"
              value={formData.startDate}
              onChangeText={(value) => handleInputChange("startDate", value)}
            />
            <Text style={styles.calendarIcon}>📅</Text>
          </View>
        </View>

        {/* Employer Address */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Employer Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your employer's address"
            placeholderTextColor="#999"
            value={formData.employerAddress}
            onChangeText={(value) => handleInputChange("employerAddress", value)}
          />
        </View>

        {/* Employer Phone Number */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Employer Phone Number</Text>
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
              value={formData.employerPhone}
              onChangeText={(value) => handleInputChange("employerPhone", value)}
            />
          </View>
        </View>

        {/* Pay Frequency */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Pay Frequency</Text>
          {renderDropdown("payFrequency", payFrequencies, "Select you pay frequency")}
        </View>

        {/* Contract Type */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Contract Type</Text>
          {renderDropdown("contractType", contractTypes, "Select your contract type")}
        </View>

        {/* Tax ID Number */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Tax ID Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your Tax ID number"
            placeholderTextColor="#999"
            value={formData.taxId}
            onChangeText={(value) => handleInputChange("taxId", value)}
          />
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
    width: "40%",
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
  incomeInputContainer: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  currencySymbol: {
    fontSize: 16,
    color: "#666",
    marginRight: 8,
  },
  incomeInput: {
    flex: 1,
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

export default JobInformation

"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native"

const EmergencyContacts = ({ navigation }) => {
  const [contact1Name, setContact1Name] = useState("")
  const [contact1Relationship, setContact1Relationship] = useState("")
  const [contact1Phone, setContact1Phone] = useState("")
  const [contact1Email, setContact1Email] = useState("")
  const [contact1Address, setContact1Address] = useState("")

  const [contact2Name, setContact2Name] = useState("")
  const [contact2Relationship, setContact2Relationship] = useState("")
  const [contact2Phone, setContact2Phone] = useState("")
  const [contact2Email, setContact2Email] = useState("")
  const [contact2Address, setContact2Address] = useState("")

  const [showRelationship1Dropdown, setShowRelationship1Dropdown] = useState(false)
  const [showRelationship2Dropdown, setShowRelationship2Dropdown] = useState(false)

  const relationships = ["Parent", "Sibling", "Spouse", "Friend", "Colleague", "Other"]

  const handleContinue = () => {
    navigation.navigate("UploadIDCard")
  }

  const handleBack = () => {
    navigation.goBack()
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
            <View style={[styles.progressFill, { width: "60%" }]} />
          </View>
          <Text style={styles.progressText}>3 / 5</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Emergency Contacts</Text>
        <Text style={styles.subtitle}>
          Please provide details of two trusted contacts. We'll only reach out to them in case of emergencies related to
          your loan.
        </Text>

        {/* Emergency Contact 1 */}
        <Text style={styles.sectionLabel}>Emergency Contact 1</Text>

        <Text style={styles.label}>Contact's Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter contact's full name"
          placeholderTextColor="#999"
          value={contact1Name}
          onChangeText={setContact1Name}
        />

        <Text style={styles.label}>Relationship to User</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowRelationship1Dropdown(!showRelationship1Dropdown)}
        >
          <Text style={contact1Relationship ? styles.dropdownTextSelected : styles.dropdownTextPlaceholder}>
            {contact1Relationship || "Select relationship to you"}
          </Text>
          <Text style={styles.dropdownIcon}>▼</Text>
        </TouchableOpacity>
        {showRelationship1Dropdown && (
          <View style={styles.dropdownMenu}>
            {relationships.map((rel) => (
              <TouchableOpacity
                key={rel}
                style={styles.dropdownItem}
                onPress={() => {
                  setContact1Relationship(rel)
                  setShowRelationship1Dropdown(false)
                }}
              >
                <Text style={styles.dropdownItemText}>{rel}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Contact's Phone Number</Text>
        <View style={styles.phoneContainer}>
          <View style={styles.countryCode}>
            <Text style={styles.flag}>🇺🇸</Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </View>
          <TextInput
            style={styles.phoneInput}
            placeholder="+1 (123) 456-7890"
            placeholderTextColor="#999"
            value={contact1Phone}
            onChangeText={setContact1Phone}
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.label}>Contact's Email Address</Text>
        <View style={styles.emailContainer}>
          <Text style={styles.emailIcon}>✉</Text>
          <TextInput
            style={styles.emailInput}
            placeholder="Enter contact's email address"
            placeholderTextColor="#999"
            value={contact1Email}
            onChangeText={setContact1Email}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.label}>Contact's Home Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter contact's home address"
          placeholderTextColor="#999"
          value={contact1Address}
          onChangeText={setContact1Address}
        />

        {/* Emergency Contact 2 */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Emergency Contact 2</Text>

        <Text style={styles.label}>Contact's Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter contact's full name"
          placeholderTextColor="#999"
          value={contact2Name}
          onChangeText={setContact2Name}
        />

        <Text style={styles.label}>Relationship to User</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowRelationship2Dropdown(!showRelationship2Dropdown)}
        >
          <Text style={contact2Relationship ? styles.dropdownTextSelected : styles.dropdownTextPlaceholder}>
            {contact2Relationship || "Select relationship to you"}
          </Text>
          <Text style={styles.dropdownIcon}>▼</Text>
        </TouchableOpacity>
        {showRelationship2Dropdown && (
          <View style={styles.dropdownMenu}>
            {relationships.map((rel) => (
              <TouchableOpacity
                key={rel}
                style={styles.dropdownItem}
                onPress={() => {
                  setContact2Relationship(rel)
                  setShowRelationship2Dropdown(false)
                }}
              >
                <Text style={styles.dropdownItemText}>{rel}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Contact's Phone Number</Text>
        <View style={styles.phoneContainer}>
          <View style={styles.countryCode}>
            <Text style={styles.flag}>🇺🇸</Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </View>
          <TextInput
            style={styles.phoneInput}
            placeholder="+1 (123) 456-7890"
            placeholderTextColor="#999"
            value={contact2Phone}
            onChangeText={setContact2Phone}
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.label}>Contact's Email Address</Text>
        <View style={styles.emailContainer}>
          <Text style={styles.emailIcon}>✉</Text>
          <TextInput
            style={styles.emailInput}
            placeholder="Enter contact's email address"
            placeholderTextColor="#999"
            value={contact2Email}
            onChangeText={setContact2Email}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.label}>Contact's Home Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter contact's home address"
          placeholderTextColor="#999"
          value={contact2Address}
          onChangeText={setContact2Address}
        />

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
  sectionLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 16,
    textTransform: "uppercase",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#000",
  },
  dropdown: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
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
  dropdownMenu: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#000",
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  countryCode: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  flag: {
    fontSize: 20,
    marginRight: 4,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#000",
  },
  emailContainer: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  emailIcon: {
    fontSize: 18,
    marginRight: 8,
    color: "#666",
  },
  emailInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
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

export default EmergencyContacts

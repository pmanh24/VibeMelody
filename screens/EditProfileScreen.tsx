"use client"

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native"
import { useState } from "react"
import { SafeAreaView } from "react-native-safe-area-context";


interface EditProfileScreenProps {
  onBack: () => void
  initialName: string
  initialEmail: string
}

export default function EditProfileScreen({ onBack, initialName, initialEmail }: EditProfileScreenProps) {
  const [name, setName] = useState(initialName)
  const [email, setEmail] = useState(initialEmail)

  const handleSave = () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }
    Alert.alert("Success", "Profile updated successfully")
    onBack()
  }

  return (
    <SafeAreaView style={styles.safeArea}>
<View style={styles.container}>
      {/* Background */}
      <View style={styles.gradientBg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.backButton} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
          </View>
          <TouchableOpacity style={styles.changeAvatarButton}>
            <Text style={styles.changeAvatarText}>📷 Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Name Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#64748b"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Email Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity style={styles.cancelButton} onPress={onBack}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
    </SafeAreaView>
    
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0f172a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  backButtonText: {
    fontSize: 14,
    color: "#60a5fa",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    fontFamily: "DancingScript_700Bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1e3a8a",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#60a5fa",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#60a5fa",
  },
  changeAvatarButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#1e3a8a",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#60a5fa",
  },
  changeAvatarText: {
    fontSize: 13,
    color: "#60a5fa",
    fontWeight: "600",
  },
  formSection: {
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#e2e8f0",
    marginBottom: 6,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#1e293b",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#334155",
    color: "#ffffff",
    fontSize: 13,
  },
  saveButton: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    backgroundColor: "#60a5fa",
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 10,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0f172a",
  },
  cancelButton: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    backgroundColor: "#1e293b",
    borderRadius: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94a3b8",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
})

"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

interface ForgotPasswordScreenProps {
  onBack: () => void
}

export default function ForgotPasswordScreen({ onBack }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address")
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address")
      return
    }

    setIsSubmitted(true)
    Alert.alert("Success", `Password reset link sent to ${email}`)

    setTimeout(() => onBack(), 2000)
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.gradientBg} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
              <Text style={styles.backButton}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Forgot Password</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            {!isSubmitted ? (
              <>
                <View style={styles.iconContainer}>
                  <Text style={styles.icon}>Lock</Text>
                </View>

                <Text style={styles.title}>Reset Your Password</Text>
                <Text style={styles.description}>
                  Enter your email address and we'll send you a link to reset your password.
                </Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="your.email@example.com"
                    placeholderTextColor="#64748b"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.8}>
                  <Text style={styles.submitButtonText}>Send Reset Link</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onBack} style={styles.backLink}>
                  <Text style={styles.backLinkText}>Back to Login</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.successIconContainer}>
                  <Text style={styles.successIcon}>Check</Text>
                </View>
                <Text style={styles.successTitle}>Check Your Email</Text>
                <Text style={styles.successDescription}>
                  We've sent a password reset link to <Text style={{ color: "#60a5fa" }}>{email}</Text>.
                </Text>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0f172a" },
  container: { flex: 1 },
  gradientBg: { ...StyleSheet.absoluteFillObject, backgroundColor: "#0f172a" },
  scrollContent: { flexGrow: 1, paddingBottom: 32 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(96, 165, 250, 0.1)",
  },
  backButton: { fontSize: 14, color: "#60a5fa", fontWeight: "600", fontFamily: "Geist" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#fff", fontFamily: "DancingScript_700Bold" },
  content: { paddingHorizontal: 24, paddingTop: 32, alignItems: "center" },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(96, 165, 250, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(96, 165, 250, 0.3)",
  },
  icon: { fontSize: 36 },
  title: { fontSize: 26, fontWeight: "bold", color: "#fff", marginBottom: 12, textAlign: "center", fontFamily: "DancingScript_700Bold" },
  description: { fontSize: 14, color: "#cbd5e1", textAlign: "center", marginBottom: 32, lineHeight: 20, fontFamily: "Geist" },
  inputContainer: { width: "100%", marginBottom: 24 },
  label: { fontSize: 13, fontWeight: "600", color: "#e2e8f0", marginBottom: 8, fontFamily: "Geist" },
  input: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    color: "#fff",
    fontSize: 14,
    fontFamily: "Geist",
  },
  submitButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#60a5fa",
    alignItems: "center",
    marginBottom: 16,
  },
  submitButtonText: { fontSize: 15, fontWeight: "600", color: "#fff", fontFamily: "Geist" },
  backLink: { paddingVertical: 8 },
  backLinkText: { fontSize: 14, color: "#60a5fa", textDecorationLine: "underline", fontFamily: "Geist" },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  successIcon: { fontSize: 36, color: "#22c55e" },
  successTitle: { fontSize: 26, fontWeight: "bold", color: "#fff", marginBottom: 12, textAlign: "center", fontFamily: "DancingScript_700Bold" },
  successDescription: { fontSize: 14, color: "#cbd5e1", textAlign: "center", lineHeight: 20, fontFamily: "Geist" },
})
// screens/ProfileScreen.tsx
"use client"

import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import {
  ArrowLeft,
  Settings,
  Lock,
  Upload,
  UserRound,
  LogOut,
  CheckCircle2,
} from "lucide-react-native"
import { api } from "../lib/api"
import { useUserStore } from "../store/useUserStore"

type Props = {
  onBack: () => void
  onNavigate: (screen: string) => void
}

export default function ProfileScreen({ onBack, onNavigate }: Props) {
  const { user, logout } = useUserStore()
  const [activeSection, setActiveSection] = useState<
    "main" | "updateProfile" | "updatePassword" | "registerArtist"
  >("main")

  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)

  const [editName, setEditName] = useState("")
  const [editAvatar, setEditAvatar] = useState("")
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  useEffect(() => {
    if (!user) return
    ;(async () => {
      try {
        setLoading(true)
        const { data } = await api.get("/me/main")
        setProfile(data.user)
        setEditName(data.user?.fullName || data.user?.name || "")
        setEditAvatar(data.user?.imageUrl || "")
      } catch (e) {
        console.error("❌ Load profile failed:", e)
      } finally {
        setLoading(false)
      }
    })()
  }, [user])

  const handleLogout = () => {
    Alert.alert("Confirm", "Do you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout()
          onNavigate("login")
        },
      },
    ])
  }

  const handleSaveProfile = async () => {
    try {
      setLoading(true)
      const payload = {
        fullName: editName,
        imageUrl: editAvatar,
      }
      const { data } = await api.put("/me/profile", payload)
      setProfile((p: any) => ({ ...p, ...data }))
      Alert.alert("✅ Success", "Profile updated successfully")
      setActiveSection("main")
    } catch (e: any) {
      console.error(e)
      Alert.alert("Error", e.response?.data?.message || "Update failed")
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (
      !passwordForm.current ||
      !passwordForm.new ||
      !passwordForm.confirm
    ) {
      Alert.alert("Error", "Please fill all fields")
      return
    }
    if (passwordForm.new !== passwordForm.confirm) {
      Alert.alert("Error", "New passwords do not match")
      return
    }

    try {
      setLoading(true)
      await api.put("/me/password", {
        currentPassword: passwordForm.current,
        newPassword: passwordForm.new,
      })
      Alert.alert("✅ Success", "Password changed successfully")
      setPasswordForm({ current: "", new: "", confirm: "" })
      setActiveSection("main")
    } catch (e: any) {
      Alert.alert(
        "Error",
        e.response?.data?.message || "Change password failed"
      )
    } finally {
      setLoading(false)
    }
  }

  if (loading && !profile) {
    return (
      <View style={[styles.safeArea, { justifyContent: "center" }]}>
        <ActivityIndicator color="#60a5fa" size="large" />
      </View>
    )
  }

  const avatarUrl =
    editAvatar ||
    profile?.imageUrl ||
    "https://cdn-icons-png.flaticon.com/512/847/847969.png"

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <ArrowLeft color="#60a5fa" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {activeSection === "main"
              ? "Profile"
              : activeSection === "updateProfile"
              ? "Update Profile"
              : activeSection === "updatePassword"
              ? "Change Password"
              : "Register Artist"}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* MAIN SECTION */}
        {activeSection === "main" && (
          <>
            <View style={styles.avatarBlock}>
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              <Text style={styles.nameText}>
                {profile?.fullName || profile?.name || "User"}
              </Text>
              <Text style={styles.emailText}>
                {profile?.email || "user@example.com"}
              </Text>
            </View>

            <View style={styles.menuBlock}>
              <TouchableOpacity
                style={styles.menuBtn}
                onPress={() => setActiveSection("updateProfile")}
              >
                <UserRound color="#60a5fa" size={20} />
                <Text style={styles.menuText}>Edit Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuBtn}
                onPress={() => setActiveSection("updatePassword")}
              >
                <Lock color="#60a5fa" size={20} />
                <Text style={styles.menuText}>Change Password</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuBtn}
                onPress={() => setActiveSection("registerArtist")}
              >
                <Settings color="#60a5fa" size={20} />
                <Text style={styles.menuText}>Register as Artist</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <LogOut color="#fff" size={20} />
              <Text style={styles.logoutText}>LOG OUT</Text>
            </TouchableOpacity>
          </>
        )}

        {/* UPDATE PROFILE */}
        {activeSection === "updateProfile" && (
          <View style={styles.formBlock}>
            <TouchableOpacity
              style={styles.backInline}
              onPress={() => setActiveSection("main")}
            >
              <ArrowLeft color="#60a5fa" size={20} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            <Text style={styles.formTitle}>Update Profile</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor="#64748b"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Avatar URL</Text>
              <TextInput
                value={editAvatar}
                onChangeText={setEditAvatar}
                style={styles.input}
                placeholder="https://..."
                placeholderTextColor="#64748b"
              />
            </View>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSaveProfile}
              disabled={loading}
            >
              <Upload color="#000" size={18} />
              <Text style={styles.saveText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* CHANGE PASSWORD */}
        {activeSection === "updatePassword" && (
          <View style={styles.formBlock}>
            <TouchableOpacity
              style={styles.backInline}
              onPress={() => setActiveSection("main")}
            >
              <ArrowLeft color="#60a5fa" size={20} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            <Text style={styles.formTitle}>Change Password</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Current Password</Text>
              <TextInput
                value={passwordForm.current}
                onChangeText={(t) =>
                  setPasswordForm((p) => ({ ...p, current: t }))
                }
                style={styles.input}
                secureTextEntry
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                value={passwordForm.new}
                onChangeText={(t) =>
                  setPasswordForm((p) => ({ ...p, new: t }))
                }
                style={styles.input}
                secureTextEntry
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput
                value={passwordForm.confirm}
                onChangeText={(t) =>
                  setPasswordForm((p) => ({ ...p, confirm: t }))
                }
                style={styles.input}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleChangePassword}
              disabled={loading}
            >
              <CheckCircle2 color="#000" size={18} />
              <Text style={styles.saveText}>Update Password</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* REGISTER ARTIST */}
        {activeSection === "registerArtist" && (
          <View style={styles.formBlock}>
            <TouchableOpacity
              style={styles.backInline}
              onPress={() => setActiveSection("main")}
            >
              <ArrowLeft color="#60a5fa" size={20} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            <Text style={styles.formTitle}>Register as Artist</Text>

            <Text style={[styles.label, { marginBottom: 16 }]}>
              By registering, you can upload your music and manage your artist
              profile.
            </Text>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={() => Alert.alert("🎵", "Artist registration sent!")}
            >
              <Settings color="#000" size={18} />
              <Text style={styles.saveText}>Register Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0f172a" },
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
  avatarBlock: { alignItems: "center", marginTop: 24, marginBottom: 32 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  nameText: { fontSize: 18, fontWeight: "700", color: "#fff", marginTop: 12 },
  emailText: { color: "#94a3b8", fontSize: 13, marginTop: 4 },
  menuBlock: { marginHorizontal: 24, gap: 14 },
  menuBtn: {
    backgroundColor: "#111827",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    gap: 12,
  },
  menuText: { color: "#f1f5f9", fontSize: 15, fontWeight: "600" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#60a5fa",
    marginHorizontal: 24,
    borderRadius: 20,
    paddingVertical: 14,
    marginTop: 28,
    gap: 10,
  },
  logoutText: { color: "#000", fontWeight: "700", fontSize: 15 },
  formBlock: { padding: 24 },
  formTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
  },
  label: { color: "#cbd5e1", marginBottom: 6 },
  input: {
    backgroundColor: "#1e293b",
    color: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  saveBtn: {
    backgroundColor: "#60a5fa",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  saveText: { color: "#000", fontWeight: "700" },
  backInline: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backText: { color: "#60a5fa", marginLeft: 6 },
})

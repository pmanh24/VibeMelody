"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Modal,
  Alert,
} from "react-native"
import {
  Settings,
  Share2,
  Lock,
  UserPlus,
  Upload,
  Edit2,
  X,
  ChevronRight,
} from "lucide-react-native"
import { SafeAreaView } from "react-native-safe-area-context"

// === TẤT CẢ ẢNH DÙNG i1.jpg ===
const AVATAR_IMAGE = require("../assets/i1.jpg")
const PLAYLIST_COVER = require("../assets/i1.jpg")

const userProfile = {
  name: "Võ Anh Hoàng",
  username: "@voanhoang",
  avatar: AVATAR_IMAGE,
  bio: "Music lover and playlist curator. Always discovering new sounds.",
  followers: 1234,
  following: 567,
  tracks: 36,
  playlists: [
    { id: 1, name: "Gymv2", tracks: 36, image: PLAYLIST_COVER },
    { id: 2, name: "Chill Vibes", tracks: 24, image: PLAYLIST_COVER },
    { id: 3, name: "Workout Mix", tracks: 18, image: PLAYLIST_COVER },
  ],
}

export default function ProfilePage() {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [editData, setEditData] = useState({
    name: userProfile.name,
    bio: userProfile.bio,
  })

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Hồ sơ</Text>
          <TouchableOpacity style={styles.settingsBtn}>
            <Settings color="#60a5fa" size={24} />
          </TouchableOpacity>
        </View>

        {/* PROFILE INFO */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image source={userProfile.avatar} style={styles.avatar} />
            <TouchableOpacity
              style={styles.uploadOverlay}
              onPress={() => setShowEditModal(true)}
            >
              <Upload color="#fff" size={28} />
            </TouchableOpacity>
          </View>

          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{userProfile.name}</Text>
              <TouchableOpacity onPress={() => setShowEditModal(true)}>
                <Edit2 color="#60a5fa" size={20} />
              </TouchableOpacity>
            </View>
            <Text style={styles.username}>{userProfile.username}</Text>
            <Text style={styles.bio}>{userProfile.bio}</Text>

            {/* STATS */}
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{userProfile.followers.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Người theo dõi</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{userProfile.following}</Text>
                <Text style={styles.statLabel}>Đang theo dõi</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{userProfile.tracks}</Text>
                <Text style={styles.statLabel}>Bài hát</Text>
              </View>
            </View>

            {/* ACTION BUTTONS */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.followBtn}>
                <Text style={styles.followText}>Theo dõi</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <Share2 color="#fff" size={18} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <Settings color="#fff" size={18} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ACCOUNT SETTINGS */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Cài đặt tài khoản</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowPasswordModal(true)}
          >
            <Lock color="#60a5fa" size={22} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Đổi mật khẩu</Text>
              <Text style={styles.settingDesc}>Cập nhật mật khẩu của bạn</Text>
            </View>
            <ChevronRight color="#64748b" size={20} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <UserPlus color="#60a5fa" size={22} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Đăng ký làm nghệ sĩ</Text>
              <Text style={styles.settingDesc}>Trở thành nghệ sĩ và tải nhạc lên</Text>
            </View>
            <ChevronRight color="#64748b" size={20} />
          </TouchableOpacity>
        </View>

        {/* PLAYLISTS */}
        <View style={styles.playlistsSection}>
          <Text style={styles.sectionTitle}>Danh sách phát</Text>
          <View style={styles.playlistGrid}>
            {userProfile.playlists.map((playlist) => (
              <TouchableOpacity key={playlist.id} style={styles.playlistCard}>
                <Image source={playlist.image} style={styles.playlistCover} />
                <Text style={styles.playlistName} numberOfLines={1}>
                  {playlist.name}
                </Text>
                <Text style={styles.playlistTracks}>{playlist.tracks} bài</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <Modal visible={showEditModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh sửa hồ sơ</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X color="#fff" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ảnh đại diện</Text>
                <TouchableOpacity style={styles.uploadBox}>
                  <Upload color="#60a5fa" size={24} />
                  <Text style={styles.uploadText}>Nhấn để tải ảnh mới</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tên</Text>
                <TextInput
                  style={styles.input}
                  value={editData.name}
                  onChangeText={(t) => setEditData({ ...editData, name: t })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tiểu sử</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  value={editData.bio}
                  onChangeText={(t) => setEditData({ ...editData, bio: t })}
                  multiline
                  placeholder="Nói về bản thân..."
                  placeholderTextColor="#64748b"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn}>
                <Text style={styles.saveText}>Lưu thay đổi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* CHANGE PASSWORD MODAL */}
      <Modal visible={showPasswordModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đổi mật khẩu</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <X color="#fff" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mật khẩu hiện tại</Text>
                <TextInput style={styles.input} secureTextEntry />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mật khẩu mới</Text>
                <TextInput style={styles.input} secureTextEntry />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
                <TextInput style={styles.input} secureTextEntry />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={styles.cancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn}>
                <Text style={styles.saveText}>Lưu thay đổi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

// === STYLES – ĐẸP, SẠCH, CHUẨN MOBILE ===
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0f172a" },
  container: { flex: 1 },

  // HEADER
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#fff", fontFamily: "DancingScript_700Bold" },
  settingsBtn: { padding: 4 },

  // PROFILE SECTION
  profileSection: { paddingHorizontal: 16, paddingTop: 16 },
  avatarContainer: { position: "relative", alignSelf: "center", marginBottom: 16 },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 60,
  },
  info: {},
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  name: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  username: { fontSize: 15, color: "#94a3b8", marginBottom: 8 },
  bio: { fontSize: 14, color: "#e2e8f0", marginBottom: 16, lineHeight: 20 },

  // STATS
  statsRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  stat: { alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  statLabel: { fontSize: 12, color: "#94a3b8" },

  // ACTION BUTTONS
  actionRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  followBtn: {
    flex: 1,
    backgroundColor: "#60a5fa",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  followText: { color: "#000", fontWeight: "600", fontSize: 15 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
  },

  // SETTINGS SECTION
  settingsSection: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 12 },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  settingText: { flex: 1 },
  settingTitle: { fontSize: 15, fontWeight: "600", color: "#fff" },
  settingDesc: { fontSize: 13, color: "#94a3b8" },

  // PLAYLISTS
  playlistsSection: { paddingHorizontal: 16, marginTop: 24 },
  playlistGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "space-between" },
  playlistCard: {
    width: "48%",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  playlistCover: { width: "100%", height: 120, borderRadius: 8, marginBottom: 8 },
  playlistName: { fontSize: 14, fontWeight: "600", color: "#fff", textAlign: "center" },
  playlistTracks: { fontSize: 12, color: "#94a3b8" },

  // MODAL
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: { backgroundColor: "#1e293b", borderRadius: 20, width: "100%", maxHeight: "90%" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  modalBody: { padding: 20, maxHeight: 400 },
  inputGroup: { marginBottom: 16 },
  label: { color: "#94a3b8", fontSize: 14, marginBottom: 6 },
  input: {
    backgroundColor: "#0f172a",
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 15,
  },
  textarea: { height: 100, textAlignVertical: "top" },
  uploadBox: {
    borderWidth: 2,
    borderColor: "#334155",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    backgroundColor: "#0f172a",
  },
  uploadText: { color: "#64748b", fontSize: 14, marginTop: 8 },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  cancelText: { color: "#fff", fontWeight: "600" },
  saveBtn: {
    flex: 1,
    backgroundColor: "#60a5fa",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  saveText: { color: "#000", fontWeight: "600" },
})
"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native"
import {
  ArrowLeft,
  Edit2,
  Upload,
  X,
  Music,
  Check,
  AlertCircle,
} from "lucide-react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import * as DocumentPicker from "expo-document-picker"
import * as ImagePicker from "expo-image-picker"

const I1_IMAGE = require("../assets/i1.jpg")
const ARTIST_ID = "690675c47a201801c29ee385"
const ARTIST_NAME_FALLBACK = "Sơn Tùng M-TP"

// === API HELPER (AXIOS) ===
const api = {
  post: async (url: string, data: FormData) => {
    const response = await fetch(`http://localhost:5000/api${url}`, {
      method: "POST",
      body: data,
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  },
}

interface Track {
  id: string
  name: string
  artist: string
  duration: number
  file?: any
  imageFile?: any
  imageUrl?: any
}

interface Props {
  onBack: () => void
}

export default function UploadScreen({ onBack }: Props) {
  const [tracks, setTracks] = useState<Track[]>([])
  const [editingTrack, setEditingTrack] = useState<Track | null>(null)
  const [editForm, setEditForm] = useState({ name: "", artist: "", keepFile: true })
  const [saving, setSaving] = useState(false)

  // === UPLOAD MUSIC + IMAGE ===
  const pickAudio = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "audio/*",
      copyToCacheDirectory: true,
    })

    if (!result.canceled && result.assets) {
      const asset = result.assets[0]
      const newTrack: Track = {
        id: Date.now().toString(),
        name: asset.name.replace(/\.[^/.]+$/, ""),
        artist: ARTIST_NAME_FALLBACK,
        duration: 0,
        file: asset,
        imageUrl: I1_IMAGE,
      }
      setTracks(prev => [...prev, newTrack])
    }
  }

  const pickImageForTrack = async (trackId: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    })

    if (!result.canceled && result.assets) {
      const asset = result.assets[0]
      setTracks(prev =>
        prev.map(t =>
          t.id === trackId
            ? { ...t, imageFile: asset, imageUrl: { uri: asset.uri } }
            : t
        )
      )
    }
  }

  // === EDIT TRACK ===
  const startEdit = (track: Track) => {
    setEditingTrack(track)
    setEditForm({
      name: track.name,
      artist: track.artist,
      keepFile: true,
    })
  }

  const saveEdit = () => {
    if (!editingTrack) return
    setTracks(prev =>
      prev.map(t =>
        t.id === editingTrack.id
          ? { ...t, name: editForm.name, artist: editForm.artist }
          : t
      )
    )
    setEditingTrack(null)
  }

  // === UPLOAD TO SERVER ===
  const uploadOneSong = async ({
    artistId,
    artistName,
    title,
    duration,
    audioFile,
    imageFile,
    albumId,
  }: any) => {
    const fd = new FormData()
    fd.append("artistId", artistId)
    fd.append("artistName", artistName)
    fd.append("title", title)
    fd.append("duration", String(duration || 0))
    if (albumId) fd.append("albumId", albumId)
    if (imageFile) {
      fd.append("imageFile", {
        uri: imageFile.uri,
        name: imageFile.fileName || "cover.jpg",
        type: imageFile.mimeType || "image/jpeg",
      } as any)
    }
    fd.append("audioFile", {
      uri: audioFile.uri,
      name: audioFile.name,
      type: audioFile.mimeType || "audio/mpeg",
    } as any)

    console.log("[upload] sending:", { title, artistName, hasImage: !!imageFile })
    const res = await api.post("/songs", fd)
    return res
  }

  const saveAllToServer = async () => {
    const withFile = tracks.filter(t => !!t.file)
    if (withFile.length === 0) {
      Alert.alert("Lỗi", "Không có file âm thanh nào hợp lệ.")
      return
    }

    setSaving(true)
    let success = 0
    try {
      for (const t of withFile) {
        try {
          await uploadOneSong({
            artistId: ARTIST_ID,
            artistName: (t.artist || ARTIST_NAME_FALLBACK).trim(),
            title: t.name,
            duration: t.duration,
            audioFile: t.file,
            imageFile: t.imageFile,
          })
          success++
        } catch (e: any) {
          console.error("[upload] FAIL:", t.name, e.message)
        }
      }
      Alert.alert(
        "Thành công",
        `Đã upload ${success}/${withFile.length} bài hát!`,
        [{ text: "OK", onPress: () => setTracks([]) }]
      )
    } finally {
      setSaving(false)
    }
  }

  const removeTrack = (id: string) => {
    setTracks(prev => prev.filter(t => t.id !== id))
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft color="#60a5fa" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Upload Music</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* UPLOAD BUTTON */}
        <TouchableOpacity style={styles.uploadBtn} onPress={pickAudio}>
          <Upload color="#000" size={24} />
          <Text style={styles.uploadText}>Chọn File Âm Thanh</Text>
        </TouchableOpacity>

        {/* UPLOADED TRACKS */}
        {tracks.length > 0 && (
          <View style={styles.uploadedSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Đã chọn ({tracks.length})
              </Text>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={saveAllToServer}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <Check color="#000" size={18} />
                    <Text style={styles.saveText}>Lưu lên Server</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.trackList}>
              {tracks.map(track => (
                <View key={track.id} style={styles.trackItem}>
                  <Image
                    source={track.imageUrl || I1_IMAGE}
                    style={styles.trackImg}
                  />
                  <View style={styles.trackInfo}>
                    <Text style={styles.trackName} numberOfLines={1}>
                      {track.name}
                    </Text>
                    <Text style={styles.trackArtist} numberOfLines={1}>
                      {track.artist}
                    </Text>
                  </View>

                  {/* ACTION BUTTONS */}
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => startEdit(track)}
                    >
                      <Edit2 color="#60a5fa" size={18} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.imageBtn}
                      onPress={() => pickImageForTrack(track.id)}
                    >
                      <Music color="#94a3b8" size={16} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => removeTrack(track.id)}
                    >
                      <X color="#ef4444" size={18} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* EDIT MODAL */}
      <Modal visible={!!editingTrack} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Chỉnh sửa bài hát</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên bài hát</Text>
              <TextInput
                style={styles.input}
                value={editForm.name}
                onChangeText={text => setEditForm({ ...editForm, name: text })}
                placeholder="Nhập tên bài"
                placeholderTextColor="#64748b"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nghệ sĩ</Text>
              <TextInput
                style={styles.input}
                value={editForm.artist}
                onChangeText={text => setEditForm({ ...editForm, artist: text })}
                placeholder="Nhập tên nghệ sĩ"
                placeholderTextColor="#64748b"
              />
            </View>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setEditingTrack(null)}
            >
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveEditBtn} onPress={saveEdit}>
              <Text style={styles.saveEditText}>Lưu</Text>
            </TouchableOpacity>
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
  backButton: { padding: 4 },
  title: { fontSize: 20, fontWeight: "bold", color: "#fff", fontFamily: "DancingScript_700Bold" },

  // UPLOAD BUTTON
  uploadBtn: {
    flexDirection: "row",
    backgroundColor: "#60a5fa",
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  uploadText: { color: "#000", fontSize: 16, fontWeight: "600" },

  // UPLOADED SECTION
  uploadedSection: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },

  saveBtn: {
    flexDirection: "row",
    backgroundColor: "#60a5fa",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    gap: 8,
    alignItems: "center",
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveText: { color: "#000", fontWeight: "600", fontSize: 14 },

  trackList: {},
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  trackImg: { width: 56, height: 56, borderRadius: 8, marginRight: 12 },
  trackInfo: { flex: 1 },
  trackName: { color: "#fff", fontSize: 15, fontWeight: "600" },
  trackArtist: { color: "#94a3b8", fontSize: 13 },

  actions: { flexDirection: "row", gap: 8 },
  editBtn: { padding: 8 },
  imageBtn: { padding: 8 },
  removeBtn: { padding: 8 },

  // MODAL
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#1e293b",
    width: "90%",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 16 },

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

  cancelBtn: {
    backgroundColor: "#334155",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 8,
  },
  cancelText: { color: "#fff", fontWeight: "600" },

  saveEditBtn: {
    backgroundColor: "#60a5fa",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 8,
  },
  saveEditText: { color: "#000", fontWeight: "600" },
})
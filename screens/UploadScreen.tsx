"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  ArrowLeft,
  Edit2,
  Upload,
  X,
  Check,
  Image as ImageIcon,
  FileAudio,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { api } from "../lib/api"; // ĐÃ DÙNG AXIOS NHƯ WEB
import * as FileSystem from "expo-file-system/legacy"; // ✅ dùng API mới
import Toast from "react-native-toast-message";

const I1_IMAGE = require("../assets/i1.jpg");
const ARTIST_ID = "690793f189c8f89e0773a7b0";
const ARTIST_NAME_FALLBACK = "Sơn Tùng M-TP";

interface Track {
  id: string;
  name: string;
  artist: string;
  duration: number;
  file?: any;
  imageFile?: any;
  imageUrl?: any;
}

interface Props {
  onBack: () => void;
}

export default function UploadScreen({ onBack }: Props) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    artist: "",
    keepFile: true,
  });
  const [saving, setSaving] = useState(false);

  // === UPLOAD MUSIC + IMAGE (GIỐNG WEB) ===
  const pickTrack = async () => {
    const audioResult = await DocumentPicker.getDocumentAsync({
      type: "audio/*",
      copyToCacheDirectory: true,
    });

    if (audioResult.canceled || !audioResult.assets) return;

    const audio = audioResult.assets[0];

    const imageResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    const image = !imageResult.canceled ? imageResult.assets[0] : null;

    const newTrack: Track = {
      id: Date.now().toString(),
      name: audio.name.replace(/\.[^/.]+$/, ""),
      artist: ARTIST_NAME_FALLBACK,
      duration: 0,
      file: audio,
      imageFile: image || undefined,
      imageUrl: image ? { uri: image.uri } : I1_IMAGE,
    };

    setTracks((prev) => [...prev, newTrack]);
  };

  // === EDIT TRACK ===
  const startEdit = (track: Track) => {
    setEditingTrack(track);
    setEditForm({
      name: track.name,
      artist: track.artist,
      keepFile: true,
    });
  };

  const saveEdit = () => {
    if (!editingTrack) return;
    setTracks((prev) =>
      prev.map((t) =>
        t.id === editingTrack.id
          ? { ...t, name: editForm.name, artist: editForm.artist }
          : t
      )
    );
    setEditingTrack(null);
  };

  // === UPLOAD TO SERVER (DÙNG AXIOS) ===
const uploadOneSong = async (payload: any) => {
  try {
    console.log("[upload] preparing:", payload.title);

    // ✅ Kiểm tra file tồn tại bằng API mới
    const fileInfo = await FileSystem.getInfoAsync(payload.audioFile.uri);
    if (!fileInfo.exists) {
      throw new Error(`File not found: ${payload.audioFile.uri}`);
    }

    // 🧱 Tạo form data đúng chuẩn React Native
    const fd = new FormData();
    fd.append("artistId", String(payload.artistId));
    fd.append("artistName", payload.artistName);
    fd.append("title", payload.title);
    fd.append("duration", String(payload.duration || 0));

    if (payload.imageFile?.uri) {
      fd.append("imageFile", {
        uri: payload.imageFile.uri,
        name: payload.imageFile.name || "cover.jpg",
        type: payload.imageFile.mimeType || "image/jpeg",
      } as any);
    }

    fd.append("audioFile", {
      uri: payload.audioFile.uri,
      name: payload.audioFile.name || "song.mp3",
      type: payload.audioFile.mimeType || "audio/mpeg",
    } as any);

    console.log("[upload] sending:", {
      title: payload.title,
      hasImage: !!payload.imageFile,
      uri: payload.audioFile.uri,
    });

    // 🚀 Gửi request qua axios
    const res = await api.post("/songs", fd, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: () => fd, // giữ nguyên FormData
    });

    console.log("[upload] success:", res.data);
    return res.data;
  } catch (err: any) {
    console.error(
      "[upload] FAIL:",
      payload.title,
      err.response?.data || err.message
    );
    throw err;
  }
};

  const saveAllToServer = async () => {
    const withFile = tracks.filter((t) => !!t.file);
    if (withFile.length === 0) {
      Toast.show({ type: "error", text1: "Không có file hợp lệ!" });
      return;
    }

    setSaving(true);
    let success = 0;
    try {
      for (const t of withFile) {
        try {
          console.log("[DEBUG] t.file =", t.file);
          await uploadOneSong({
            artistId: ARTIST_ID,
            artistName: (t.artist || ARTIST_NAME_FALLBACK).trim(),
            title: t.name,
            duration: t.duration,
            audioFile: t.file,
            imageFile: t.imageFile,
          });
          success++;
        } catch (e: any) {
          console.error(
            "[upload] FAIL:",
            t.name,
            e.response?.data || e.message
          );
          Toast.show({ type: "error", text1: `Upload thất bại: ${t.name}` });
        }
      }

      if (success > 0) {
        setTracks([]);
        Toast.show({
          type: "success",
          text1: `Đã upload ${success}/${withFile.length} bài!`,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const removeTrack = (id: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
  };
console.log("oke")
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

        {/* CARD UPLOADER – GIỐNG WEB */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.uploaderBtn} onPress={pickTrack}>
            <Upload color="#60a5fa" size={28} />
            <Text style={styles.uploaderText}>Chọn File Nhạc + Ảnh Bìa</Text>
          </TouchableOpacity>
        </View>

        {/* UPLOADED TRACKS */}
        {tracks.length > 0 && (
          <View style={styles.uploadedSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Đã chọn ({tracks.length})</Text>
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
              {tracks.map((track) => (
                <View key={track.id} style={styles.trackCard}>
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
                  <View style={styles.actions}>
                    <TouchableOpacity onPress={() => startEdit(track)}>
                      <Edit2 color="#60a5fa" size={18} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeTrack(track.id)}>
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

      {/* EDIT MODAL – GIỐNG WEB */}
      <Modal visible={!!editingTrack} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Chỉnh sửa bài hát</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên bài hát</Text>
              <TextInput
                style={styles.input}
                value={editForm.name}
                onChangeText={(text) =>
                  setEditForm({ ...editForm, name: text })
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nghệ sĩ</Text>
              <TextInput
                style={styles.input}
                value={editForm.artist}
                onChangeText={(text) =>
                  setEditForm({ ...editForm, artist: text })
                }
              />
            </View>

            <View style={styles.checkboxRow}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() =>
                  setEditForm((prev) => ({ ...prev, keepFile: !prev.keepFile }))
                }
              >
                {editForm.keepFile && <Check color="#60a5fa" size={16} />}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>Giữ file nhạc cũ</Text>
            </View>

            <View style={styles.modalActions}>
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
        </View>
      </Modal>

      <Toast />
    </SafeAreaView>
  );
}

// === STYLES – GIỐNG WEB 95% ===
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0f172a" },
  container: { flex: 1 },

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
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "DancingScript_700Bold",
  },

  card: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#334155",
  },
  uploaderBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  uploaderText: { color: "#60a5fa", fontSize: 16, fontWeight: "600" },

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

  trackList: { gap: 12 },
  trackCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  trackImg: { width: 56, height: 56, borderRadius: 8, marginRight: 12 },
  trackInfo: { flex: 1 },
  trackName: { color: "#fff", fontSize: 15, fontWeight: "600" },
  trackArtist: { color: "#94a3b8", fontSize: 13 },
  actions: { flexDirection: "row", gap: 12 },

  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#1e293b",
    width: "88%",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#334155",
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  inputGroup: { marginBottom: 16 },
  label: { color: "#94a3b8", fontSize: 14, marginBottom: 6 },
  input: {
    backgroundColor: "#0f172a",
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#334155",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#60a5fa",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxLabel: { color: "#e2e8f0", fontSize: 14 },
  modalActions: { flexDirection: "row", gap: 12 },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#334155",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  cancelText: { color: "#fff", fontWeight: "600" },
  saveEditBtn: {
    flex: 1,
    backgroundColor: "#60a5fa",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  saveEditText: { color: "#000", fontWeight: "600" },
});

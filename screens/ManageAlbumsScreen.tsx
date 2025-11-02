"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native"
import {
  Plus,
  Edit,
  Eye,
  EyeOff,
  Trash2,
  Music,
  ChevronLeft,
} from "lucide-react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const I1_IMAGE = require("../assets/i1.jpg")

// === DỮ LIỆU MẪU ===
const mockAlbums = [
  {
    id: "1",
    name: "Gymv2",
    artist: "Vo Anh Hoang",
    year: 2023,
    tracks: 36,
    visible: true,
    image: I1_IMAGE,
  },
  {
    id: "2",
    name: "Urban Nights",
    artist: "Vo Anh Hoang",
    year: 2024,
    tracks: 12,
    visible: true,
    image: I1_IMAGE,
  },
  {
    id: "3",
    name: "Coastal Dreams",
    artist: "Vo Anh Hoang",
    year: 2024,
    tracks: 8,
    visible: false,
    image: I1_IMAGE,
  },
]

interface Album {
  id: string
  name: string
  artist: string
  year: number
  tracks: number
  visible: boolean
  image: any
}

interface Props {
  onBack: () => void
  onCreateAlbum: () => void
  onEditAlbum: (albumId: string) => void
}

export default function ManageAlbumsScreen({ onBack, onCreateAlbum, onEditAlbum }: Props) {
  const [albums, setAlbums] = useState<Album[]>(mockAlbums)

  const toggleVisibility = (albumId: string) => {
    setAlbums(prev =>
      prev.map(album =>
        album.id === albumId ? { ...album, visible: !album.visible } : album
      )
    )
  }

  const deleteAlbum = (albumId: string) => {
    Alert.alert(
      "Xóa album",
      "Bạn có chắc chắn muốn xóa album này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => {
            setAlbums(prev => prev.filter(album => album.id !== albumId))
          },
        },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ChevronLeft color="#60a5fa" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Quản lý Album</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* CREATE BUTTON */}
        <TouchableOpacity style={styles.createBtn} onPress={onCreateAlbum}>
          <Plus color="#000" size={20} />
          <Text style={styles.createBtnText}>Tạo Album Mới</Text>
        </TouchableOpacity>

        {/* ALBUM LIST */}
        <View style={styles.albumList}>
          {albums.length === 0 ? (
            <View style={styles.emptyState}>
              <Music color="#64748b" size={48} />
              <Text style={styles.emptyTitle}>Chưa có album nào</Text>
              <Text style={styles.emptyDesc}>Tạo album đầu tiên của bạn!</Text>
            </View>
          ) : (
            albums.map(album => (
              <View
                key={album.id}
                style={[
                  styles.albumCard,
                  !album.visible && styles.albumHidden,
                ]}
              >
                {/* COVER IMAGE */}
                <View style={styles.coverContainer}>
                  <Image source={album.image} style={styles.coverImage} />
                  {!album.visible && (
                    <View style={styles.hiddenOverlay}>
                      <EyeOff color="#fff" size={32} />
                    </View>
                  )}
                </View>

                {/* INFO */}
                <View style={styles.albumInfo}>
                  <Text style={styles.albumName} numberOfLines={1}>
                    {album.name}
                  </Text>
                  <Text style={styles.albumArtist} numberOfLines={1}>
                    {album.artist}
                  </Text>
                  <View style={styles.albumMeta}>
                    <Music color="#94a3b8" size={14} />
                    <Text style={styles.metaText}>
                      {album.tracks} bài • {album.year}
                    </Text>
                  </View>
                </View>

                {/* ACTION BUTTONS */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => onEditAlbum(album.id)}
                  >
                    <Edit color="#fff" size={18} />
                    <Text style={styles.editText}>Sửa</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.visibilityBtn}
                    onPress={() => toggleVisibility(album.id)}
                  >
                    {album.visible ? (
                      <Eye color="#94a3b8" size={20} />
                    ) : (
                      <EyeOff color="#94a3b8" size={20} />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => deleteAlbum(album.id)}
                  >
                    <Trash2 color="#ef4444" size={20} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// === STYLES – MOBILE 1 CỘT, ĐẸP, CHUẨN ===
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

  // CREATE BUTTON
  createBtn: {
    flexDirection: "row",
    backgroundColor: "#60a5fa",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  createBtnText: { color: "#000", fontSize: 16, fontWeight: "600" },

  // ALBUM LIST
  albumList: { paddingHorizontal: 16 },
  albumCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  albumHidden: { opacity: 0.65 },

  // COVER
  coverContainer: { position: "relative" },
  coverImage: { width: "100%", height: 180 },
  hiddenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },

  // INFO
  albumInfo: { padding: 16 },
  albumName: { fontSize: 17, fontWeight: "bold", color: "#fff", marginBottom: 4 },
  albumArtist: { fontSize: 14, color: "#94a3b8", marginBottom: 8 },
  albumMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 13, color: "#94a3b8" },

  // ACTION ROW
  actionRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  editBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#334155",
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  editText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  visibilityBtn: {
    width: 48,
    height: 48,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteBtn: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(239,68,68,0.15)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  // EMPTY STATE
  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#fff", marginTop: 16 },
  emptyDesc: { fontSize: 14, color: "#64748b", textAlign: "center", marginTop: 8, paddingHorizontal: 40 },
})
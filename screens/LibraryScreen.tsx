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
} from "react-native"
import {
  ChevronLeft,
  Plus,
  Search,
  Music,
  Clock,
  X,
  Edit,
} from "lucide-react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const I1_IMAGE = require("../assets/i1.jpg")

// === DỮ LIỆU MẪU ===
const mockTracks = [
  {
    id: "lib1",
    name: "Vengeance",
    artist: "Vo Anh Hoang",
    image: I1_IMAGE,
    duration: 214,
    date: "Oct 7, 2023",
  },
  {
    id: "lib2",
    name: "JUDAS",
    artist: "Vo Anh Hoang",
    image: I1_IMAGE,
    duration: 197,
    date: "Oct 7, 2023",
  },
  {
    id: "lib3",
    name: "POOR - Sped Up",
    artist: "Vo Anh Hoang",
    image: I1_IMAGE,
    duration: 210,
    date: "Oct 7, 2023",
  },
]

interface Track {
  id: string
  name: string
  artist: string
  image: any
  duration: number
  date?: string
}

interface Props {
  onBack: () => void
  onPlay: (track: Track) => void
  onCreateAlbum: () => void
  onManageAlbums: () => void
  onManageMusic: () => void
}

export default function LibraryScreen({
  onBack,
  onPlay,
  onCreateAlbum,
  onManageAlbums,
  onManageMusic,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("")
  const [tracks] = useState(mockTracks)

  const filteredTracks = tracks.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ChevronLeft color="#60a5fa" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Thư viện</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <Search color="#94a3b8" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm bài hát, nghệ sĩ..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => setSearchQuery("")}
            >
              <X color="#94a3b8" size={18} />
            </TouchableOpacity>
          )}
        </View>

        {/* ACTION BUTTONS – 3 NÚT NGANG HÀNG */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.createAlbumBtn} onPress={onCreateAlbum}>
            <Plus color="#fff" size={18} />
            <Text style={styles.actionText}>Tạo Album</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.manageAlbumBtn} onPress={onManageAlbums}>
            <Edit color="#fff" size={18} />
            <Text style={styles.actionText}>Quản lý Album</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.manageMusicBtn} onPress={onManageMusic}>
            <Music color="#fff" size={18} />
            <Text style={styles.actionText}>Quản lý nhạc</Text>
          </TouchableOpacity>
        </View>

        {/* TRACK LIST */}
        <ScrollView style={styles.trackList} showsVerticalScrollIndicator={false}>
          {filteredTracks.length === 0 ? (
            <View style={styles.emptyState}>
              <Music color="#64748b" size={48} />
              <Text style={styles.emptyTitle}>Chưa có nhạc nào</Text>
              <Text style={styles.emptyDesc}>
                {searchQuery
                  ? "Không tìm thấy kết quả"
                  : "Thêm nhạc vào thư viện để bắt đầu"}
              </Text>
            </View>
          ) : (
            filteredTracks.map((track, i) => (
              <TouchableOpacity
                key={track.id}
                style={styles.trackItem}
                onPress={() => onPlay(track)}
              >
                <Text style={styles.trackIndex}>{i + 1}</Text>
                <Image source={track.image} style={styles.trackImg} />
                <View style={styles.trackInfo}>
                  <Text style={styles.trackName} numberOfLines={1}>
                    {track.name}
                  </Text>
                  <Text style={styles.trackArtist} numberOfLines={1}>
                    {track.artist}
                  </Text>
                </View>
                <Text style={styles.trackDuration}>
                  {formatDuration(track.duration)}
                </Text>
                <Clock color="#94a3b8" size={16} />
              </TouchableOpacity>
            ))
          )}
          <View style={{ height: 120 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

// === STYLES – ĐẸP, SẠCH, 3 NÚT NGANG HÀNG ===
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

  // SEARCH
  searchContainer: {
    position: "relative",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  searchIcon: { position: "absolute", left: 14, top: 14, zIndex: 10 },
  searchInput: {
    backgroundColor: "#1e293b",
    color: "#fff",
    paddingLeft: 44,
    paddingRight: 44,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 15,
  },
  clearBtn: { position: "absolute", right: 14, top: 14, zIndex: 10, padding: 4 },

  // ACTION BUTTONS – 3 NÚT
  actionRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  createAlbumBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#1e293b",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  manageAlbumBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#334155",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  manageMusicBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#475569",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionText: { color: "#fff", fontSize: 13.5, fontWeight: "600" },

  // TRACK LIST
  trackList: { flex: 1, paddingHorizontal: 16 },
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    marginBottom: 8,
  },
  trackIndex: { width: 32, color: "#94a3b8", fontSize: 14, textAlign: "center" },
  trackImg: { width: 44, height: 44, borderRadius: 8, marginRight: 12 },
  trackInfo: { flex: 1 },
  trackName: { color: "#fff", fontSize: 14.5, fontWeight: "600" },
  trackArtist: { color: "#94a3b8", fontSize: 12.5 },
  trackDuration: { color: "#94a3b8", fontSize: 13, width: 50, textAlign: "center" },

  // EMPTY STATE
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#fff", marginTop: 16 },
  emptyDesc: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 40,
  },
})
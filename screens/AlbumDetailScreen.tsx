"use client"

import { useState } from "react"
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  StyleSheet,
  Dimensions,
} from "react-native"
import {
  Play,
  Shuffle,
  Download,
  MoreHorizontal,
  Clock,
  Plus,
  Search,
  X,
  ChevronLeft,
} from "lucide-react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const { width } = Dimensions.get("window")
const COVER_SIZE = width / 4 - 8
const I1_IMAGE = require("../assets/i1.jpg")

// === DỮ LIỆU MẪU ===
const albumData = {
  id: 1,
  name: "Gymv2",
  type: "Public Playlist",
  artist: "Vo Anh Hoang",
  totalTracks: 36,
  duration: "1 hour 30 minutes",
  coverImages: [I1_IMAGE, I1_IMAGE, I1_IMAGE, I1_IMAGE],
  tracks: [
    {
      id: 1,
      name: "Vengeance",
      artist: "iwilldiehere",
      album: "Vengeance",
      date: "Oct 7, 2023",
      duration: "2:14",
      image: I1_IMAGE,
    },
    {
      id: 2,
      name: "JUDAS",
      artist: "SAY3AM",
      album: "JUDAS",
      date: "Oct 7, 2023",
      duration: "1:57",
      image: I1_IMAGE,
    },
    {
      id: 3,
      name: "POOR - Sped Up",
      artist: "gqtis",
      album: "POOR (Sped Up)",
      date: "Oct 7, 2023",
      duration: "2:10",
      image: I1_IMAGE,
    },
  ],
}

const availableSongs = [
  { id: 4, name: "Dark Nights", artist: "Vo Anh Hoang", duration: "3:24", image: I1_IMAGE },
  { id: 5, name: "Electric Soul", artist: "Vo Anh Hoang", duration: "2:45", image: I1_IMAGE },
  { id: 6, name: "Midnight Drive", artist: "Vo Anh Hoang", duration: "3:12", image: I1_IMAGE },
  { id: 7, name: "Neon Dreams", artist: "Vo Anh Hoang", duration: "2:58", image: I1_IMAGE },
  { id: 8, name: "City Lights", artist: "Vo Anh Hoang", duration: "3:35", image: I1_IMAGE },
]

// === TYPES ===
interface Track {
  id: string
  name: string
  artist: string
  image: any
  duration: number
  album?: string
  date?: string
}

interface Props {
  onBack: () => void
  onPlayTrack: (track: Track) => void
}

// === COMPONENT ===
export default function AlbumDetailScreen({ onBack, onPlayTrack }: Props) {
  const [showAddSongs, setShowAddSongs] = useState(false)
  const [selectedSongs, setSelectedSongs] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [tracks, setTracks] = useState(albumData.tracks)

  const parseDuration = (str: string): number => {
    const [m, s] = str.split(":").map(Number)
    return m * 60 + s
  }

  const toTrack = (t: any): Track => ({
    id: t.id.toString(),
    name: t.name,
    artist: t.artist,
    image: t.image,
    duration: parseDuration(t.duration),
    album: t.album,
    date: t.date,
  })

  const toggleSongSelection = (songId: number) => {
    setSelectedSongs((prev) =>
      prev.includes(songId) ? prev.filter((id) => id !== songId) : [...prev, songId]
    )
  }

  const filteredSongs = availableSongs.filter(
    (song) =>
      song.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const removeTrack = (trackId: number) => {
    setTracks((prev) => prev.filter((t) => t.id !== trackId))
  }

  const addSelectedSongs = () => {
    const songsToAdd = availableSongs.filter((s) => selectedSongs.includes(s.id))
    const newTracks = songsToAdd.map((s) => ({
      ...s,
      album: albumData.name,
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    }))
    setTracks((prev) => [...prev, ...newTracks])
    setShowAddSongs(false)
    setSelectedSongs([])
    setSearchQuery("")
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ChevronLeft color="#60a5fa" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Album Detail</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollContainer}>
          {/* ALBUM INFO */}
          <View style={styles.albumInfo}>
            <View style={styles.coverGrid}>
              {albumData.coverImages.map((img, i) => (
                <Image key={i} source={img} style={styles.coverImage} resizeMode="cover" />
              ))}
            </View>

            <View style={styles.info}>
              <Text style={styles.type}>{albumData.type}</Text>
              <Text style={styles.name}>{albumData.name}</Text>
              <View style={styles.meta}>
                <Text style={styles.artist}>{albumData.artist}</Text>
                <Text style={styles.dot}> • </Text>
                <Text style={styles.tracks}>
                  {tracks.length} songs, about {albumData.duration}
                </Text>
              </View>
            </View>
          </View>

          {/* CONTROLS */}
          <View style={styles.controls}>
            <TouchableOpacity style={styles.playBtn}>
              <Play color="#000" fill="#000" size={24} style={{ marginLeft: 2 }} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}><Shuffle color="#94a3b8" size={20} /></TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}><Download color="#94a3b8" size={20} /></TouchableOpacity>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddSongs(true)}>
              <Plus color="#fff" size={20} />
              <Text style={styles.addText}>Add Songs</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}><MoreHorizontal color="#94a3b8" size={20} /></TouchableOpacity>
          </View>

          {/* TRACK LIST */}
          <View style={styles.trackList}>
            {/* HEADER – BỎ CỘT ALBUM */}
            <View style={styles.trackHeader}>
              <Text style={styles.th}>#</Text>
              <Text style={styles.thTitle}>Title</Text>
              <Text style={styles.th}>Date Added</Text>
              <Text style={styles.thCenter}><Clock color="#94a3b8" size={16} /></Text>
              <View style={{ width: 40 }} />
            </View>

            {/* ROWS */}
            {tracks.map((track, i) => (
              <TouchableOpacity
                key={track.id}
                style={styles.trackRow}
                onPress={() => onPlayTrack(toTrack(track))}
              >
                <Text style={styles.trackIndex}>{i + 1}</Text>
                <View style={styles.trackTitle}>
                  <Image source={track.image} style={styles.trackImg} />
                  <View>
                    <Text style={styles.trackName} numberOfLines={1}>{track.name}</Text>
                    <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
                  </View>
                </View>
                <Text style={styles.trackDate} numberOfLines={1}>{track.date}</Text>
                <Text style={styles.trackDuration}>{track.duration}</Text>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={(e) => {
                    e.stopPropagation()
                    removeTrack(track.id)
                  }}
                >
                  <X color="#94a3b8" size={16} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* MODAL */}
        <Modal visible={showAddSongs} transparent animationType="fade">
          <View style={styles.modalOverlay} />
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Songs to Album</Text>
              <Text style={styles.modalSubtitle}>Select songs from your library</Text>
              <View style={styles.searchContainer}>
                <Search color="#94a3b8" size={20} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search songs..."
                  placeholderTextColor="#64748b"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>

            <ScrollView style={styles.modalList}>
              {filteredSongs.length > 0 ? (
                filteredSongs.map((song) => (
                  <TouchableOpacity
                    key={song.id}
                    style={styles.songItem}
                    onPress={() => toggleSongSelection(song.id)}
                  >
                    <View style={[styles.checkbox, selectedSongs.includes(song.id) && styles.checkboxActive]} />
                    <Image source={song.image} style={styles.songImg} />
                    <View style={styles.songInfo}>
                      <Text style={styles.songName} numberOfLines={1}>{song.name}</Text>
                      <Text style={styles.songArtist} numberOfLines={1}>{song.artist}</Text>
                    </View>
                    <Text style={styles.songDuration}>{song.duration}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noSongs}>No songs found</Text>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setShowAddSongs(false)
                  setSelectedSongs([])
                  setSearchQuery("")
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addBtnModal, selectedSongs.length === 0 && styles.addBtnDisabled]}
                onPress={addSelectedSongs}
                disabled={selectedSongs.length === 0}
              >
                <Text style={styles.addBtnText}>
                  Add {selectedSongs.length} {selectedSongs.length === 1 ? "song" : "songs"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  )
}

// === STYLES – BỎ CỘT ALBUM, DÃN CÁCH RÕ RÀNG ===
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0f172a" },
  container: { flex: 1 },
  scrollContainer: { flex: 1 },

  // HEADER
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    backgroundColor: "#0f172a",
    zIndex: 10,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", fontFamily: "DancingScript_700Bold" },

  // ALBUM INFO
  albumInfo: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: "#1e293b",
    gap: 16,
    alignItems: "flex-start",
  },
  coverGrid: {
    width: COVER_SIZE * 2 + 8,
    height: COVER_SIZE * 2 + 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    justifyContent: "flex-start",
  },
  coverImage: { width: COVER_SIZE, height: COVER_SIZE, borderRadius: 8 },
  info: { flex: 1, justifyContent: "center", paddingRight: 8 },
  type: { fontSize: 13, color: "#94a3b8", marginBottom: 4 },
  name: { fontSize: 32, fontWeight: "bold", color: "#fff", marginBottom: 6, fontFamily: "DancingScript_700Bold" },
  meta: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 },
  artist: { fontSize: 13, color: "#fff", fontWeight: "600" },
  dot: { color: "#94a3b8", fontSize: 12 },
  tracks: { fontSize: 13, color: "#94a3b8" },

  // CONTROLS
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#0f172a",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  playBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#60a5fa",
    justifyContent: "center",
    alignItems: "center",
  },
  iconBtn: { padding: 8 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1e293b",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  addText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  // TRACK LIST
  trackList: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 120,
  },
  trackHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    marginBottom: 8,
  },
  th: { fontSize: 11, color: "#64748b", textAlign: "center" },
  thTitle: { flex: 1, fontSize: 11, color: "#64748b", paddingLeft: 8 },
  thCenter: { width: 56, textAlign: "center" },

  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#1e293b",
    borderRadius: 10,
    marginBottom: 6,
  },
  trackIndex: { width: 36, textAlign: "center", color: "#94a3b8", fontSize: 13 },
  trackTitle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingRight: 16, // Dãn cách với cột Date
  },
  trackImg: { width: 38, height: 38, borderRadius: 6 },
  trackName: { color: "#fff", fontSize: 13.5, fontWeight: "600", maxWidth: 140 },
  trackArtist: { color: "#94a3b8", fontSize: 11.5, maxWidth: 140 },
  trackDate: { width: 90, color: "#64748b", fontSize: 11.5, textAlign: "center" },
  trackDuration: { width: 56, textAlign: "center", color: "#94a3b8", fontSize: 11.5 },
  removeBtn: { padding: 6, paddingLeft: 10 },

  // MODAL
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.85)" },
  modal: {
    position: "absolute",
    top: "8%",
    left: 16,
    right: 16,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    maxHeight: "84%",
    overflow: "hidden",
    elevation: 10,
  },
  modalHeader: { padding: 20, borderBottomWidth: 1, borderBottomColor: "#334155" },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  modalSubtitle: { fontSize: 13, color: "#94a3b8", marginTop: 4 },
  searchContainer: { position: "relative", marginTop: 14 },
  searchIcon: { position: "absolute", left: 12, top: 11, zIndex: 10 },
  searchInput: {
    backgroundColor: "#0f172a",
    color: "#fff",
    paddingLeft: 42,
    paddingRight: 14,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 14,
  },
  modalList: { flex: 1, paddingHorizontal: 20 },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#64748b",
  },
  checkboxActive: { backgroundColor: "#60a5fa", borderColor: "#60a5fa" },
  songImg: { width: 44, height: 44, borderRadius: 8 },
  songInfo: { flex: 1 },
  songName: { color: "#fff", fontSize: 13.5, fontWeight: "600" },
  songArtist: { color: "#94a3b8", fontSize: 11.5 },
  songDuration: { color: "#94a3b8", fontSize: 11.5 },
  noSongs: { textAlign: "center", color: "#94a3b8", paddingVertical: 30, fontSize: 14 },
  modalFooter: {
    flexDirection: "row",
    gap: 10,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingVertical: 11,
    borderRadius: 999,
    alignItems: "center",
  },
  cancelText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  addBtnModal: {
    flex: 1,
    backgroundColor: "#60a5fa",
    paddingVertical: 11,
    borderRadius: 999,
    alignItems: "center",
  },
  addBtnDisabled: { opacity: 0.5 },
  addBtnText: { color: "#000", fontWeight: "600", fontSize: 14 },
})
"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Dimensions,
} from "react-native"
import {
  ArrowLeft,
  Plus,
  Save,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const { width } = Dimensions.get("window")
const I1_IMAGE = require("../assets/i1.jpg")

// === DỮ LIỆU MẪU ===
const mockArtistSongs = [
  { id: "song-1", name: "Vengeance", artist: "Vo Anh Hoang", duration: 214, image: I1_IMAGE },
  { id: "song-2", name: "JUDAS", artist: "Vo Anh Hoang", duration: 197, image: I1_IMAGE },
  { id: "song-3", name: "POOR - Sped Up", artist: "Vo Anh Hoang", duration: 210, image: I1_IMAGE },
  { id: "song-4", name: "Dark Ambient", artist: "Vo Anh Hoang", duration: 245, image: I1_IMAGE },
  { id: "song-5", name: "Coastal Vibes", artist: "Vo Anh Hoang", duration: 189, image: I1_IMAGE },
]

interface Track {
  id: string
  name: string
  artist: string
  duration: number
  image: any
}

interface Props {
  onBack: () => void
  onSave?: () => void
}

export default function CreateAlbumScreen({ onBack, onSave }: Props) {
  const [isEditing] = useState(false)
  const [albumName, setAlbumName] = useState(isEditing ? "Gymv2" : "")
  const [artist, setArtist] = useState(isEditing ? "Vo Anh Hoang" : "")
  const [releaseYear, setReleaseYear] = useState(isEditing ? "2023" : "")
  const [coverImage, setCoverImage] = useState(isEditing ? I1_IMAGE : null)
  const [tracks, setTracks] = useState<Track[]>(isEditing ? [
    { id: "1", name: "Intro", artist: "Sample Artist", duration: 180, image: I1_IMAGE },
    { id: "2", name: "Main Track", artist: "Sample Artist", duration: 240, image: I1_IMAGE },
    { id: "3", name: "Outro", artist: "Sample Artist", duration: 200, image: I1_IMAGE },
  ] : [])

  const [showAddSongs, setShowAddSongs] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSongs, setSelectedSongs] = useState<string[]>([])

  useEffect(() => {
    if (isEditing) {
      setAlbumName("Gymv2")
      setArtist("Vo Anh Hoang")
      setReleaseYear("2023")
      setCoverImage(I1_IMAGE)
    }
  }, [isEditing])

  const toggleSongSelection = (songId: string) => {
    setSelectedSongs(prev =>
      prev.includes(songId) ? prev.filter(id => id !== songId) : [...prev, songId]
    )
  }

  const filteredSongs = mockArtistSongs.filter(song =>
    song.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !tracks.some(t => t.id === song.id)
  )

  const addSelectedSongs = () => {
    const songsToAdd = mockArtistSongs.filter(s => selectedSongs.includes(s.id))
    setTracks(prev => [...prev, ...songsToAdd])
    setShowAddSongs(false)
    setSelectedSongs([])
    setSearchQuery("")
  }

  const removeTrack = (trackId: string) => {
    setTracks(prev => prev.filter(t => t.id !== trackId))
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSave = () => {
    console.log("Saving album:", { albumName, artist, releaseYear, tracks })
    alert(isEditing ? "Album updated!" : "Album created!")
    onSave?.()
    onBack()
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft color="#60a5fa" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? "Edit Album" : "Create Album"}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* ALBUM INFO CARD */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Album Information</Text>

          {/* COVER IMAGE */}
          <View style={styles.coverSection}>
            <Text style={styles.label}>Cover Image</Text>
            <View style={styles.coverPreview}>
              {coverImage ? (
                <Image source={coverImage} style={styles.coverImage} />
              ) : (
                <View style={styles.coverPlaceholder}>
                  <Plus color="#64748b" size={32} />
                </View>
              )}
            </View>
            {/* Upload ẩn trên mobile, dùng placeholder */}
            <TouchableOpacity style={styles.uploadBtn}>
              <Text style={styles.uploadText}>Choose Image</Text>
            </TouchableOpacity>
          </View>

          {/* FORM FIELDS */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Album Name</Text>
            <TextInput
              style={styles.input}
              value={albumName}
              onChangeText={setAlbumName}
              placeholder="Enter album name"
              placeholderTextColor="#64748b"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Artist</Text>
            <TextInput
              style={styles.input}
              value={artist}
              onChangeText={setArtist}
              placeholder="Enter artist name"
              placeholderTextColor="#64748b"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Release Year</Text>
            <TextInput
              style={styles.input}
              value={releaseYear}
              onChangeText={setReleaseYear}
              placeholder="2024"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Save color="#000" size={20} />
            <Text style={styles.saveText}>{isEditing ? "Update Album" : "Save Album"}</Text>
          </TouchableOpacity>
        </View>

        {/* TRACK LIST CARD */}
        <View style={styles.trackCard}>
          <View style={styles.trackHeader}>
            <Text style={styles.sectionTitle}>Track List ({tracks.length})</Text>
            <TouchableOpacity
              style={styles.addTrackBtn}
              onPress={() => setShowAddSongs(true)}
            >
              <Plus color="#fff" size={18} />
              <Text style={styles.addTrackText}>Add Track</Text>
            </TouchableOpacity>
          </View>

          {tracks.length === 0 ? (
            <View style={styles.emptyTracks}>
              <Text style={styles.emptyText}>No tracks yet</Text>
            </View>
          ) : (
            <View style={styles.trackList}>
              {tracks.map((track, i) => (
                <View key={track.id} style={styles.trackItem}>
                  <Text style={styles.trackIndex}>{i + 1}</Text>
                  <Image source={track.image} style={styles.trackImg} />
                  <View style={styles.trackInfo}>
                    <Text style={styles.trackName} numberOfLines={1}>{track.name}</Text>
                    <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
                  </View>
                  <Text style={styles.trackDuration}>{formatDuration(track.duration)}</Text>
                  <TouchableOpacity
                    style={styles.removeTrackBtn}
                    onPress={() => removeTrack(track.id)}
                  >
                    <X color="#94a3b8" size={18} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* MODAL ADD SONGS */}
      <Modal visible={showAddSongs} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Songs to Album</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAddSongs(false)
                  setSelectedSongs([])
                  setSearchQuery("")
                }}
              >
                <X color="#fff" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Search color="#94a3b8" size={20} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search songs..."
                placeholderTextColor="#64748b"
              />
            </View>

            <ScrollView style={styles.songList}>
              {filteredSongs.length === 0 ? (
                <Text style={styles.noSongs}>No songs found</Text>
              ) : (
                filteredSongs.map(song => (
                  <TouchableOpacity
                    key={song.id}
                    style={[
                      styles.songItem,
                      selectedSongs.includes(song.id) && styles.songItemSelected
                    ]}
                    onPress={() => toggleSongSelection(song.id)}
                  >
                    <View style={[
                      styles.checkbox,
                      selectedSongs.includes(song.id) && styles.checkboxActive
                    ]} />
                    <Image source={song.image} style={styles.songImg} />
                    <View style={styles.songInfo}>
                      <Text style={styles.songName} numberOfLines={1}>{song.name}</Text>
                      <Text style={styles.songArtist} numberOfLines={1}>{song.artist}</Text>
                    </View>
                    <Text style={styles.songDuration}>{formatDuration(song.duration)}</Text>
                  </TouchableOpacity>
                ))
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
                style={[
                  styles.addBtn,
                  selectedSongs.length === 0 && styles.addBtnDisabled
                ]}
                onPress={addSelectedSongs}
                disabled={selectedSongs.length === 0}
              >
                <Text style={styles.addBtnText}>
                  Add {selectedSongs.length} {selectedSongs.length === 1 ? "song" : "songs"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

// === STYLES – MOBILE 1 CỘT, SẠCH, GỌN ===
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
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", fontFamily: "DancingScript_700Bold" },

  infoCard: {
    marginHorizontal: 16,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  coverSection: { marginBottom: 20 },
  label: { fontSize: 14, color: "#94a3b8", marginBottom: 8 },
  coverPreview: {
    alignItems: "center",
    marginBottom: 12,
  },
  coverImage: {
    width: 160,
    height: 160,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#334155",
  },
  coverPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 16,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#334155",
    borderStyle: "dashed",
  },
  uploadBtn: {
    backgroundColor: "#1e293b",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: "center",
  },
  uploadText: { color: "#60a5fa", fontSize: 14, fontWeight: "600" },

  formGroup: { marginBottom: 16 },
  input: {
    backgroundColor: "#0f172a",
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 15,
  },

  saveBtn: {
    flexDirection: "row",
    backgroundColor: "#60a5fa",
    paddingVertical: 14,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  saveText: { color: "#000", fontWeight: "600", fontSize: 15 },

  trackCard: {
    marginHorizontal: 16,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  trackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addTrackBtn: {
    flexDirection: "row",
    backgroundColor: "#334155",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    gap: 6,
    alignItems: "center",
  },
  addTrackText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  emptyTracks: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: { color: "#64748b", fontSize: 15 },

  trackList: {},
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: "#0f172a",
    borderRadius: 12,
    marginBottom: 8,
  },
  trackIndex: { width: 32, color: "#94a3b8", fontSize: 14, textAlign: "center" },
  trackImg: { width: 40, height: 40, borderRadius: 8, marginRight: 10 },
  trackInfo: { flex: 1 },
  trackName: { color: "#fff", fontSize: 14, fontWeight: "600" },
  trackArtist: { color: "#94a3b8", fontSize: 12 },
  trackDuration: { color: "#94a3b8", fontSize: 13, width: 50, textAlign: "center" },
  removeTrackBtn: { padding: 6 },

  // MODAL
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#1e293b",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },

  searchContainer: { position: "relative", marginHorizontal: 20, marginTop: 16 },
  searchIcon: { position: "absolute", left: 14, top: 14, zIndex: 10 },
  searchInput: {
    backgroundColor: "#0f172a",
    color: "#fff",
    paddingLeft: 44,
    paddingRight: 14,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 15,
  },

  songList: { flex: 1, paddingHorizontal: 20, marginTop: 16 },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "#0f172a",
    marginBottom: 8,
  },
  songItemSelected: { backgroundColor: "rgba(96,165,250,0.15)", borderWidth: 1, borderColor: "#60a5fa" },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#64748b",
    marginRight: 12,
  },
  checkboxActive: { backgroundColor: "#60a5fa", borderColor: "#60a5fa" },
  songImg: { width: 44, height: 44, borderRadius: 8, marginRight: 12 },
  songInfo: { flex: 1 },
  songName: { color: "#fff", fontSize: 14, fontWeight: "600" },
  songArtist: { color: "#94a3b8", fontSize: 12 },
  songDuration: { color: "#94a3b8", fontSize: 13 },
  noSongs: { textAlign: "center", color: "#64748b", paddingVertical: 40, fontSize: 15 },

  modalFooter: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  cancelText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  addBtn: {
    flex: 1,
    backgroundColor: "#60a5fa",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  addBtnDisabled: { opacity: 0.5 },
  addBtnText: { color: "#000", fontWeight: "600", fontSize: 15 },
})
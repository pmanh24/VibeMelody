"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from "react-native"
import { Search, Play } from "lucide-react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const { width } = Dimensions.get("window")
const ALBUM_SIZE = (width - 48 - 18) / 4 // 4 cột, gap 6 → 18px

// ---------------------------------------------------------------------
// Types (được dùng chung với App.tsx)
interface Track {
  id: string
  name: string
  artist: string
  image: any
  duration: number
}

interface Props {
  onBack: () => void
  onPlay: (track: Track) => void   // ← thêm prop
}
// ---------------------------------------------------------------------

const mockSongs = [
  {
    id: 1,
    name: "Urban Jungle",
    artist: "City Lights",
    album: "Night Vibes",
    duration: "3:24",
    image: require("../assets/i1.jpg"),
  },
  {
    id: 2,
    name: "Neon Dreams",
    artist: "Electric Soul",
    album: "Synthwave",
    duration: "4:12",
    image: require("../assets/i1.jpg"),
  },
  {
    id: 3,
    name: "Midnight Drive",
    artist: "Night Runners",
    album: "Highway",
    duration: "3:45",
    image: require("../assets/i1.jpg"),
  },
]

const mockAlbums = [
  {
    id: 1,
    name: "Gymv2",
    artist: "Võ Anh Hoàng",
    tracks: 36,
    image: require("../assets/i1.jpg"),
  },
  {
    id: 2,
    name: "Urban Nights",
    artist: "Various Artists",
    tracks: 24,
    image: require("../assets/i1.jpg"),
  },
  {
    id: 3,
    name: "Neon Lights",
    artist: "Night Runners",
    tracks: 12,
    image: require("../assets/i1.jpg"),
  },
  {
    id: 4,
    name: "Summer Vibes",
    artist: "Coastal Kids",
    tracks: 18,
    image: require("../assets/i1.jpg"),
  },
]

export default function SearchScreen({ onBack, onPlay }: Props) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"songs" | "albums">("songs")

  // chuyển đổi duration string → seconds
  const parseDuration = (str: string): number => {
    const [m, s] = str.split(":").map(Number)
    return m * 60 + s
  }

  const handlePlaySong = (song: typeof mockSongs[0]) => {
    const track: Track = {
      id: song.id.toString(),
      name: song.name,
      artist: song.artist,
      image: song.image,
      duration: parseDuration(song.duration),
    }
    onPlay(track)
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search color="#94a3b8" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm bài hát, album, nghệ sĩ..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "songs" && styles.tabActive]}
            onPress={() => setActiveTab("songs")}
          >
            <Text style={[styles.tabText, activeTab === "songs" && styles.tabTextActive]}>
              Bài hát
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "albums" && styles.tabActive]}
            onPress={() => setActiveTab("albums")}
          >
            <Text style={[styles.tabText, activeTab === "albums" && styles.tabTextActive]}>
              Album
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === "songs" ? (
            <View style={styles.songList}>
              {mockSongs.map((song) => (
                <TouchableOpacity
                  key={song.id}
                  style={styles.songItem}
                  activeOpacity={0.7}
                  onPress={() => handlePlaySong(song)}  
                >
                  <View style={styles.songImageContainer}>
                    <Image source={song.image} style={styles.songImage} />
                    <View style={styles.playOverlay}>
                      <Play color="#fff" fill="#fff" size={20} />
                    </View>
                  </View>
                  <View style={styles.songInfo}>
                    <Text style={styles.songName} numberOfLines={1}>
                      {song.name}
                    </Text>
                    <Text style={styles.songArtist} numberOfLines={1}>
                      {song.artist}
                    </Text>
                  </View>
                  <Text style={styles.songAlbum}>{song.album}</Text>
                  <Text style={styles.songDuration}>{song.duration}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.albumGrid}>
              {mockAlbums.map((album) => (
                <TouchableOpacity key={album.id} style={styles.albumCard} activeOpacity={0.8}>
                  <View style={styles.albumImageContainer}>
                    <Image source={album.image} style={styles.albumImage} />
                    <View style={styles.albumPlayButton}>
                      <Play color="#000" fill="#000" size={20} style={{ marginLeft: 2 }} />
                    </View>
                  </View>
                  <Text style={styles.albumName} numberOfLines={1}>
                    {album.name}
                  </Text>
                  <Text style={styles.albumArtist} numberOfLines={1}>
                    {album.artist}
                  </Text>
                  <Text style={styles.albumTracks}>{album.tracks} bài hát</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  backButton: { padding: 4 },
  backText: { fontSize: 14, color: "#60a5fa", fontWeight: "600", fontFamily: "Geist" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", fontFamily: "DancingScript_700Bold" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 16,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    height: 48,
    color: "#fff",
    fontSize: 15,
    fontFamily: "Geist",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    marginHorizontal: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: "#60a5fa" },
  tabText: { fontSize: 15, color: "#94a3b8", fontFamily: "Geist" },
  tabTextActive: { color: "#fff", fontWeight: "600" },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  songList: { gap: 8 },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    gap: 12,
  },
  songImageContainer: { position: "relative" },
  songImage: { width: 48, height: 48, borderRadius: 8 },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0,
  },
  songInfo: { flex: 1 },
  songName: { fontSize: 14, fontWeight: "600", color: "#fff", fontFamily: "Geist" },
  songArtist: { fontSize: 12, color: "#94a3b8", fontFamily: "Geist" },
  songAlbum: { fontSize: 12, color: "#64748b", fontFamily: "Geist", marginRight: 8 },
  songDuration: { fontSize: 12, color: "#64748b", fontFamily: "Geist" },
  albumGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16, justifyContent: "space-between" },
  albumCard: { width: ALBUM_SIZE },
  albumImageContainer: { position: "relative", marginBottom: 12 },
  albumImage: { width: "100%", height: ALBUM_SIZE, borderRadius: 12 },
  albumPlayButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#60a5fa",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0,
    transform: [{ translateY: 8 }],
  },
  albumName: { fontSize: 14, fontWeight: "600", color: "#fff", fontFamily: "Geist" },
  albumArtist: { fontSize: 12, color: "#94a3b8", fontFamily: "Geist" },
  albumTracks: { fontSize: 11, color: "#64748b", marginTop: 4, fontFamily: "Geist" },
})
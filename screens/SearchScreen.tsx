"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native"
import { Search, Play, ChevronLeft } from "lucide-react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const { width } = Dimensions.get("window")
const ALBUM_SIZE = (width - 48 - 18) / 4 // 4 cột, gap 6 → 18px

// ---------------------------------------------------------------------
// Types (được dùng chung với App.tsx)
interface Track {
  _id: string
  title: string
  artist: string
  imageUrl?: string
  audioUrl?: string
  duration?: number
}

interface Album {
  _id: string
  name: string
  artist: string
  imageUrl?: string
  tracks?: number
}

interface Props {
  onBack: () => void
  onPlay: (track: Track) => void
}
// ---------------------------------------------------------------------

export default function SearchScreen({ onBack, onPlay }: Props) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"songs" | "albums">("songs")
  const [songs, setSongs] = useState<Track[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)

  // 🟢 Fetch API dữ liệu thật
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [songRes, albumRes] = await Promise.all([
          fetch("http://192.168.0.101:5000/api/all"),
          fetch("http://192.168.0.101:5000/api/albums"),
        ])

        const songData = await songRes.json()
        const albumData = await albumRes.json()

        console.log("🎵 Songs:", songData)
        console.log("💿 Albums:", albumData)

        setSongs(Array.isArray(songData) ? songData : songData.songs || [])
        setAlbums(Array.isArray(albumData) ? albumData : albumData.albums || [])
      } catch (err) {
        console.error("[Search fetch error]", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredSongs = songs.filter(
    (s) =>
      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredAlbums = albums.filter(
    (a) =>
      a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.artist?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handlePlaySong = (song: Track) => onPlay(song)

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ChevronLeft color="#60a5fa" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tìm kiếm</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search color="#94a3b8" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm bài hát, album, nghệ sĩ..."
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
            <Text
              style={[
                styles.tabText,
                activeTab === "songs" && styles.tabTextActive,
              ]}
            >
              Bài hát
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "albums" && styles.tabActive]}
            onPress={() => setActiveTab("albums")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "albums" && styles.tabTextActive,
              ]}
            >
              Album
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <ActivityIndicator
              color="#60a5fa"
              size="large"
              style={{ marginTop: 40 }}
            />
          ) : activeTab === "songs" ? (
            <View style={styles.songList}>
              {filteredSongs.length === 0 ? (
                <Text style={styles.emptyText}>Không có bài hát nào</Text>
              ) : (
                filteredSongs.map((song) => (
                  <TouchableOpacity
                    key={song._id}
                    style={styles.songItem}
                    activeOpacity={0.7}
                    onPress={() => handlePlaySong(song)}
                  >
                    <View style={styles.songImageContainer}>
                      <Image
                        source={{
                          uri:
                            song.imageUrl ||
                            "https://cdn-icons-png.flaticon.com/512/1384/1384060.png",
                        }}
                        style={styles.songImage}
                      />
                      <View style={styles.playOverlay}>
                        <Play color="#fff" fill="#fff" size={20} />
                      </View>
                    </View>
                    <View style={styles.songInfo}>
                      <Text style={styles.songName} numberOfLines={1}>
                        {song.title || "Không tên"}
                      </Text>
                      <Text style={styles.songArtist} numberOfLines={1}>
                        {song.artist || "Không rõ nghệ sĩ"}
                      </Text>
                    </View>
                    <Text style={styles.songDuration}>
                      {song.duration
                        ? Math.floor(song.duration / 60) +
                          ":" +
                          (song.duration % 60).toString().padStart(2, "0")
                        : "--:--"}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          ) : (
            <View style={styles.albumGrid}>
              {filteredAlbums.length === 0 ? (
                <Text style={styles.emptyText}>Không có album nào</Text>
              ) : (
                filteredAlbums.map((album) => (
                  <TouchableOpacity
                    key={album._id}
                    style={styles.albumCard}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{
                        uri:
                          album.imageUrl ||
                          "https://cdn-icons-png.flaticon.com/512/169/169367.png",
                      }}
                      style={styles.albumImage}
                    />
                    <Text style={styles.albumName} numberOfLines={1}>
                      {album.name}
                    </Text>
                    <Text style={styles.albumArtist} numberOfLines={1}>
                      {album.artist}
                    </Text>
                    <Text style={styles.albumTracks}>
                      {album.tracks || 0} bài hát
                    </Text>
                  </TouchableOpacity>
                ))
              )}
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
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
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
  searchInput: { flex: 1, height: 48, color: "#fff", fontSize: 15 },
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
  tabText: { fontSize: 15, color: "#94a3b8" },
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
  songName: { fontSize: 14, fontWeight: "600", color: "#fff" },
  songArtist: { fontSize: 12, color: "#94a3b8" },
  songDuration: { fontSize: 12, color: "#64748b" },
  albumGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "space-between",
  },
  albumCard: { width: ALBUM_SIZE },
  albumImage: { width: "100%", height: ALBUM_SIZE, borderRadius: 12 },
  albumName: { fontSize: 14, fontWeight: "600", color: "#fff", marginTop: 8 },
  albumArtist: { fontSize: 12, color: "#94a3b8" },
  albumTracks: { fontSize: 11, color: "#64748b", marginTop: 4 },
  emptyText: { color: "#94a3b8", textAlign: "center", marginTop: 40 },
})

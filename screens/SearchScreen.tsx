import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Search, Play, ChevronLeft, BadgeCheck } from "lucide-react-native"
import { api } from "../lib/api" // ✅ lấy API qua axios instance

const { width } = Dimensions.get("window")
const ALBUM_SIZE = (width - 48 - 18) / 4

interface Track {
  _id: string
  title: string
  artist: string
  imageUrl?: string
  duration?: number
}

interface Album {
  _id: string
  title: string
  artistName?: string
  imageUrl?: string
  tracks?: number
}

interface Artist {
  _id: string
  name: string
  username?: string
  followersCount?: number
  avatar?: string
  isVerified?: boolean
}

interface Props {
  onBack: () => void
  onPlay: (track: Track) => void
}

export default function SearchScreen({ onBack, onPlay }: Props) {
  const [query, setQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"songs" | "albums" | "artists">(
    "songs"
  )
  const [songs, setSongs] = useState<Track[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(false)

  const fmtDur = (sec = 0) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${String(s).padStart(2, "0")}`
  }

  // 🟢 fetch bằng axios instance `api`
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [songRes, albumRes, artistRes] = await Promise.all([
          api.get("/allsongs", { params: { q: query } }),
          api.get("/allalbums", { params: { q: query } }),
          api.get("/artists/search", { params: { q: query } }),
        ])

        const sList = Array.isArray(songRes.data)
          ? songRes.data
          : songRes.data.items || []
        const aList = Array.isArray(albumRes.data)
          ? albumRes.data
          : albumRes.data.items || []
        const artList = Array.isArray(artistRes.data)
          ? artistRes.data
          : artistRes.data.items || []

        setSongs(
          sList.map((s: any) => ({
            _id: s._id,
            title: s.title,
            artist: s.artistName || s.artist,
            imageUrl: s.imageUrl,
            duration: s.duration || s.durationSec || 0,
          }))
        )

        setAlbums(
          aList.map((a: any) => ({
            _id: a._id,
            title: a.title,
            artistName: a.artistName,
            imageUrl: a.imageUrl,
            tracks: Array.isArray(a.songs)
              ? a.songs.length
              : a.tracks || 0,
          }))
        )

        setArtists(
          artList.map((u: any) => ({
            _id: u._id,
            name: u.name,
            username: u.username,
            followersCount: u.followersCount || 0,
            avatar: u.avatar,
            isVerified: u.isVerified,
          }))
        )
      } catch (err) {
        console.error("[Search fetch error]", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [query])

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
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {["songs", "albums", "artists"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab as any)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab === "songs"
                  ? "Bài hát"
                  : tab === "albums"
                  ? "Album"
                  : "Nghệ sĩ"}
              </Text>
            </TouchableOpacity>
          ))}
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
              {songs.length === 0 ? (
                <Text style={styles.emptyText}>Không có bài hát phù hợp</Text>
              ) : (
                songs.map((s) => (
                  <TouchableOpacity
                    key={s._id}
                    style={styles.songItem}
                    activeOpacity={0.8}
                    onPress={() => onPlay(s)}
                  >
                    <View style={styles.songImageWrap}>
                      <Image
                        source={{
                          uri:
                            s.imageUrl ||
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
                        {s.title}
                      </Text>
                      <Text style={styles.songArtist} numberOfLines={1}>
                        {s.artist}
                      </Text>
                    </View>
                    <Text style={styles.songDuration}>
                      {fmtDur(s.duration)}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          ) : activeTab === "albums" ? (
            <View style={styles.albumGrid}>
              {albums.length === 0 ? (
                <Text style={styles.emptyText}>Không có album phù hợp</Text>
              ) : (
                albums.map((a) => (
                  <TouchableOpacity
                    key={a._id}
                    style={styles.albumCard}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{
                        uri:
                          a.imageUrl ||
                          "https://cdn-icons-png.flaticon.com/512/169/169367.png",
                      }}
                      style={styles.albumImage}
                    />
                    <Text style={styles.albumName} numberOfLines={1}>
                      {a.title}
                    </Text>
                    <Text style={styles.albumArtist} numberOfLines={1}>
                      {a.artistName}
                    </Text>
                    <Text style={styles.albumTracks}>
                      {a.tracks || 0} bài hát
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          ) : (
            <View style={styles.artistList}>
              {artists.length === 0 ? (
                <Text style={styles.emptyText}>Không có nghệ sĩ phù hợp</Text>
              ) : (
                artists.map((a) => (
                  <View key={a._id} style={styles.artistItem}>
                    <Image
                      source={{
                        uri:
                          a.avatar ||
                          "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                      }}
                      style={styles.artistAvatar}
                    />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text style={styles.artistName}>{a.name}</Text>
                        {a.isVerified && (
                          <BadgeCheck
                            color="#60a5fa"
                            fill="#60a5fa"
                            size={14}
                            style={{ marginLeft: 6 }}
                          />
                        )}
                      </View>
                      <Text style={styles.artistSub}>
                        Nghệ sĩ • {a.followersCount || 0} người theo dõi
                      </Text>
                    </View>
                  </View>
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
  songImageWrap: { position: "relative" },
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
  artistList: { gap: 12 },
  artistItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  artistAvatar: { width: 48, height: 48, borderRadius: 24 },
  artistName: { fontSize: 15, fontWeight: "600", color: "#fff" },
  artistSub: { fontSize: 12, color: "#94a3b8" },
  emptyText: { color: "#94a3b8", textAlign: "center", marginTop: 40 },
})

"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native"
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Search,
  Music,
  Users,
  Upload,
  Disc3,
} from "lucide-react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const { width } = Dimensions.get("window")
const CARD_WIDTH = (width - 48 - 18) / 4 // 4 cards, gap 6 → 18px
const ALBUM_CARD_WIDTH = width * 0.58

// === DỮ LIỆU ===
const features = [
  {
    id: "f1",
    title: "Vast Music Library",
    description: "Millions of songs from around the world, every music genre you love",
    image: require("../assets/i1.jpg"),
    gradient: ["#4c1d95", "#1e3a8a"],
    icon: Music,
  },
  {
    id: "f2",
    title: "Free Album Publishing",
    description: "Artists can freely upload and manage their albums, share music with the world",
    image: require("../assets/i1.jpg"),
    gradient: ["#831843", "#6b21a8"],
    icon: Upload,
  },
  {
    id: "f3",
    title: "Connect with Friends",
    description: "Connect with friends, share playlists, see what they're listening to and chat directly",
    image: require("../assets/i1.jpg"),
    gradient: ["#1e3a8a", "#115e59"],
    icon: Users,
  },
]

const trending = [
  { id: "t1", name: "Urban Jungle", artist: "City Lights", image: require("../assets/i1.jpg"), duration: 180 },
  { id: "t2", name: "Inner Light", artist: "Shocking Lemon", image: require("../assets/i1.jpg"), duration: 210 },
  { id: "t3", name: "Neon Lights", artist: "Night Runners", image: require("../assets/i1.jpg"), duration: 195 },
  { id: "t4", name: "Summer Daze", artist: "Coastal Kids", image: require("../assets/i1.jpg"), duration: 165 },
  { id: "t5", name: "Purple Sunset", artist: "Dream Valley", image: require("../assets/i1.jpg"), duration: 200 },
  { id: "t6", name: "Starlight", artist: "Luna Bay", image: require("../assets/i1.jpg"), duration: 175 },
]

const newest = [
  { id: "n1", name: "Lost in Tokyo", artist: "Electric Dreams", image: require("../assets/i1.jpg"), duration: 190 },
  { id: "n2", name: "Purple Sunset", artist: "Dream Valley", image: require("../assets/i1.jpg"), duration: 200 },
  { id: "n3", name: "Neon Lights", artist: "Night Runners", image: require("../assets/i1.jpg"), duration: 195 },
  { id: "n4", name: "Test in Prod", artist: "Programmer", image: require("../assets/i1.jpg"), duration: 160 },
  { id: "n5", name: "Urban Jungle", artist: "City Lights", image: require("../assets/i1.jpg"), duration: 180 },
  { id: "n6", name: "Summer Daze", artist: "Coastal Kids", image: require("../assets/i1.jpg"), duration: 165 },
]

const albums = [
  {
    id: "a1",
    name: "Gymv2",
    artist: "Vo Anh Hoang",
    type: "Public Playlist",
    totalTracks: 36,
    duration: "1 hour 30 minutes",
    coverImages: [
      require("../assets/i1.jpg"),
      require("../assets/i1.jpg"),
      require("../assets/i1.jpg"),
      require("../assets/i1.jpg"),
    ],
  },
  {
    id: "a2",
    name: "Chill Vibes",
    artist: "Relax Daily",
    type: "Album",
    totalTracks: 12,
    duration: "45 minutes",
    coverImages: [
      require("../assets/i1.jpg"),
      require("../assets/i1.jpg"),
      require("../assets/i1.jpg"),
      require("../assets/i1.jpg"),
    ],
  },
  {
    id: "a3",
    name: "Urban Nights",
    artist: "City Lights",
    type: "Album",
    totalTracks: 18,
    duration: "1h 12m",
    coverImages: [
      require("../assets/i1.jpg"),
      require("../assets/i1.jpg"),
      require("../assets/i1.jpg"),
      require("../assets/i1.jpg"),
    ],
  },
]

interface Track {
  id: string
  name: string
  artist: string
  image: any
  duration: number
}

interface Album {
  id: string
  name: string
  artist: string
  type: string
  totalTracks: number
  duration: string
  coverImages: any[]
}

interface Props {
  onPlay: (track: Track) => void
  onSearch: () => void
  onOpenAlbum: (album: Album) => void
}

export default function HomeScreen({ onPlay, onSearch, onOpenAlbum }: Props) {
  const [featureIndex, setFeatureIndex] = useState(0)
  const [trendingStart, setTrendingStart] = useState(0)
  const [newestStart, setNewestStart] = useState(0)
  const itemsPerView = 4

  const handlePlayTrack = (track: Track) => {
    onPlay(track)
  }

  const handleOpenAlbum = (album: Album) => {
    onOpenAlbum(album) // GIỮ NGUYÊN NHƯ CŨ – HOẠT ĐỘNG BÌNH THƯỜNG
  }

  const currentFeature = features[featureIndex]
  const Icon = currentFeature.icon

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Vibe Melody</Text>
          <TouchableOpacity onPress={onSearch} style={styles.searchButton}>
            <Search color="#60a5fa" size={24} />
          </TouchableOpacity>
        </View>

        {/* FEATURE CAROUSEL */}
        <View style={styles.featureContainer}>
          <Image source={currentFeature.image} style={styles.featureImage} resizeMode="cover" />
          <View style={[styles.gradientOverlay, { backgroundColor: currentFeature.gradient[0] }]} />
          
          <View style={styles.featureContent}>
            <View style={styles.featureIcon}>
              <Icon color="#fff" size={32} />
            </View>
            <Text style={styles.featureTitle}>{currentFeature.title}</Text>
            <Text style={styles.featureDesc}>{currentFeature.description}</Text>
          </View>

          {/* Controls */}
          <View style={styles.featureControls}>
            <TouchableOpacity
              onPress={() => setFeatureIndex((prev) => (prev === 0 ? features.length - 1 : prev - 1))}
              style={styles.controlBtn}
            >
              <ChevronLeft color="#fff" size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFeatureIndex((prev) => (prev === features.length - 1 ? 0 : prev + 1))}
              style={styles.controlBtn}
            >
              <ChevronRight color="#fff" size={20} />
            </TouchableOpacity>
          </View>

          {/* Dots */}
          <View style={styles.dots}>
            {features.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === featureIndex && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        {/* ALBUMS SECTION – UI ĐẸP HƠN, GIỮ NGUYÊN DỮ LIỆU & XỬ LÝ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Albums</Text>
            <TouchableOpacity style={styles.seeAllBtn}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.albumRow}>
              {albums.map((album, index) => (
                <TouchableOpacity
                  key={album.id}
                  style={[
                    styles.albumCard,
                    index === 0 && styles.albumCardFirst,
                  ]}
                  onPress={() => handleOpenAlbum(album)} // GIỮ NGUYÊN – HOẠT ĐỘNG BÌNH THƯỜNG
                  activeOpacity={0.85}
                >
                  {/* 4 ẢNH NHỎ – SẠCH, ĐẸP */}
                  <View style={styles.albumCoverGrid}>
                    {album.coverImages.slice(0, 4).map((img, i) => (
                      <View key={i} style={styles.albumCoverWrapper}>
                        <Image source={img} style={styles.albumCover} resizeMode="cover" />
                      </View>
                    ))}
                  </View>

                  {/* INFO */}
                  <View style={styles.albumInfo}>
                    <Text style={styles.albumName} numberOfLines={1}>
                      {album.name}
                    </Text>
                    <Text style={styles.albumArtist} numberOfLines={1}>
                      {album.artist}
                    </Text>
                    <View style={styles.albumMetaRow}>
                      <Disc3 color="#60a5fa" size={13} />
                      <Text style={styles.albumMeta}>
                        {album.totalTracks} songs • {album.duration}
                      </Text>
                    </View>
                  </View>

                  {/* TYPE BADGE */}
                  <View style={[
                    styles.typeBadge,
                    album.type === "Album" ? styles.albumBadge : styles.playlistBadge
                  ]}>
                    <Text style={styles.typeText}>
                      {album.type === "Album" ? "Album" : "Playlist"}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* TRENDING SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending</Text>
            <View style={styles.navButtons}>
              <TouchableOpacity
                onPress={() => setTrendingStart(Math.max(0, trendingStart - itemsPerView))}
                disabled={trendingStart === 0}
                style={[styles.navBtn, trendingStart === 0 && styles.navBtnDisabled]}
              >
                <ChevronLeft color="#fff" size={20} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setTrendingStart(Math.min(trending.length - itemsPerView, trendingStart + itemsPerView))}
                disabled={trendingStart >= trending.length - itemsPerView}
                style={[styles.navBtn, trendingStart >= trending.length - itemsPerView && styles.navBtnDisabled]}
              >
                <ChevronRight color="#fff" size={20} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.cardRow}>
              {trending.slice(trendingStart, trendingStart + itemsPerView).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.musicCard}
                  activeOpacity={0.8}
                  onPress={() => handlePlayTrack(item)}
                >
                  <View style={styles.imageContainer}>
                    <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
                    <View style={styles.playButton}>
                      <Play color="#000" fill="#000" size={20} style={{ marginLeft: 2 }} />
                    </View>
                  </View>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.cardArtist} numberOfLines={1}>{item.artist}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* NEWEST SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Newest</Text>
            <View style={styles.navButtons}>
              <TouchableOpacity
                onPress={() => setNewestStart(Math.max(0, newestStart - itemsPerView))}
                disabled={newestStart === 0}
                style={[styles.navBtn, newestStart === 0 && styles.navBtnDisabled]}
              >
                <ChevronLeft color="#fff" size={20} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setNewestStart(Math.min(newest.length - itemsPerView, newestStart + itemsPerView))}
                disabled={newestStart >= newest.length - itemsPerView}
                style={[styles.navBtn, newestStart >= newest.length - itemsPerView && styles.navBtnDisabled]}
              >
                <ChevronRight color="#fff" size={20} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.cardRow}>
              {newest.slice(newestStart, newestStart + itemsPerView).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.musicCard}
                  activeOpacity={0.8}
                  onPress={() => handlePlayTrack(item)}
                >
                  <View style={styles.imageContainer}>
                    <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
                    <View style={styles.playButton}>
                      <Play color="#000" fill="#000" size={20} style={{ marginLeft: 2 }} />
                    </View>
                  </View>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.cardArtist} numberOfLines={1}>{item.artist}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// === STYLES – ĐÃ CẢI TIẾN UI PHẦN ALBUM ===
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
  searchButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", fontFamily: "DancingScript_700Bold" },

  // FEATURE CAROUSEL
  featureContainer: {
    height: 340,
    marginHorizontal: 16,
    marginBottom: 32,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  featureImage: { ...StyleSheet.absoluteFillObject },
  gradientOverlay: { ...StyleSheet.absoluteFillObject, opacity: 0.6 },
  featureContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    zIndex: 10,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  featureTitle: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 8, fontFamily: "DancingScript_700Bold" },
  featureDesc: { fontSize: 15, color: "#e2e8f0", lineHeight: 22, fontFamily: "Geist" },
  featureControls: {
    position: "absolute",
    bottom: 24,
    right: 24,
    flexDirection: "row",
    gap: 8,
    zIndex: 10,
  },
  controlBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dots: {
    position: "absolute",
    bottom: 24,
    left: "50%",
    transform: [{ translateX: -30 }],
    flexDirection: "row",
    gap: 8,
    zIndex: 10,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.5)" },
  dotActive: { width: 24, backgroundColor: "#fff" },

  // SECTION
  section: { marginBottom: 32, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", fontFamily: "DancingScript_700Bold" },
  seeAllBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  seeAllText: { color: "#60a5fa", fontSize: 14, fontWeight: "600" },

  // ALBUM CARD – UI ĐẸP HƠN
  albumRow: { flexDirection: "row" },
  albumCard: {
    width: ALBUM_CARD_WIDTH,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 16,
    position: "relative",
  },
  albumCardFirst: { marginLeft: 0 },

  // 4 ẢNH NHỎ – SẠCH, CÓ VIỀN
  albumCoverGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    height: ALBUM_CARD_WIDTH,
    padding: 8,
    gap: 4,
  },
  albumCoverWrapper: {
    width: "48%",
    height: "48%",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#334155",
  },
  albumCover: { width: "100%", height: "100%" },

  // INFO
  albumInfo: { paddingHorizontal: 14, paddingBottom: 14 },
  albumName: { fontSize: 15.5, fontWeight: "bold", color: "#fff", marginBottom: 4 },
  albumArtist: { fontSize: 13.5, color: "#94a3b8", marginBottom: 6 },
  albumMetaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  albumMeta: { fontSize: 12.5, color: "#64748b" },

  // TYPE BADGE
  typeBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  albumBadge: { backgroundColor: "#60a5fa" },
  playlistBadge: { backgroundColor: "#10b981" },
  typeText: { color: "#fff", fontSize: 11, fontWeight: "600" },

  // NAV BUTTONS
  navButtons: { flexDirection: "row", gap: 8 },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
  },
  navBtnDisabled: { opacity: 0.5 },

  // CARD ROW
  cardRow: { flexDirection: "row", gap: 16, paddingRight: 16 },
  musicCard: { width: CARD_WIDTH },
  imageContainer: { position: "relative", marginBottom: 12 },
  cardImage: { width: "100%", height: CARD_WIDTH, borderRadius: 12 },
  playButton: {
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
  cardTitle: { fontSize: 14, fontWeight: "600", color: "#fff", marginBottom: 4, fontFamily: "Geist" },
  cardArtist: { fontSize: 12, color: "#94a3b8", fontFamily: "Geist" },
})
"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
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
  MessageCircle,
} from "lucide-react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import axios from "axios"
import {api} from '../lib/api'

const { width } = Dimensions.get("window")
const CARD_WIDTH = (width - 48 - 18) / 4
const ALBUM_CARD_WIDTH = width * 0.58

// === DỮ LIỆU TĨNH ===
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

interface Props {
  onPlay: (track: any) => void
  onSearch: () => void
  onOpenAlbum: (album: any) => void
  onOpenChat: () => void
}

export default function HomeScreen({ onPlay, onSearch, onOpenAlbum, onOpenChat }: Props) {
  const [featureIndex, setFeatureIndex] = useState(0)
  const [songs, setSongs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const itemsPerView = 4
  const [trendingStart, setTrendingStart] = useState(0)
  const [newestStart, setNewestStart] = useState(0)

  // === FETCH DỮ LIỆU TỪ BACKEND ===
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true)
        const res = await api.get(`/all`)
        setSongs(res.data || [])
      } catch (err: any) {
        console.error("[Fetch songs error]", err)
        setError("Failed to load songs")
      } finally {
        setLoading(false)
      }
    }
    fetchSongs()
  }, [])

  const handlePlayTrack = (track: any) => onPlay(track)

  const currentFeature = features[featureIndex]
  const Icon = currentFeature.icon

  // Tách trending (bài được yêu thích nhiều nhất) và newest (mới nhất)
  const trendingSongs = [...songs].sort((a, b) => b.likesCount - a.likesCount)
  const newestSongs = [...songs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Vibe Melody</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={onSearch} style={styles.iconButton}>
              <Search color="#60a5fa" size={24} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onOpenChat} style={styles.iconButton}>
              <MessageCircle color="#60a5fa" size={24} />
            </TouchableOpacity>
          </View>
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
          <View style={styles.featureControls}>
            <TouchableOpacity
              onPress={() =>
                setFeatureIndex(prev => (prev === 0 ? features.length - 1 : prev - 1))
              }
              style={styles.controlBtn}
            >
              <ChevronLeft color="#fff" size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                setFeatureIndex(prev => (prev === features.length - 1 ? 0 : prev + 1))
              }
              style={styles.controlBtn}
            >
              <ChevronRight color="#fff" size={20} />
            </TouchableOpacity>
          </View>
          <View style={styles.dots}>
            {features.map((_, i) => (
              <View key={i} style={[styles.dot, i === featureIndex && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* SONG SECTIONS */}
        {loading ? (
          <ActivityIndicator size="large" color="#60a5fa" style={{ marginTop: 40 }} />
        ) : error ? (
          <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
        ) : (
          <>
            {/* TRENDING */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Trending</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.cardRow}>
                  {trendingSongs.slice(trendingStart, trendingStart + itemsPerView).map(song => (
                    <TouchableOpacity
                      key={song._id}
                      style={styles.musicCard}
                      onPress={() => handlePlayTrack(song)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.imageContainer}>
                        <Image
                          source={
                            song.imageUrl
                              ? { uri: song.imageUrl }
                              : require("../assets/i1.jpg")
                          }
                          style={styles.cardImage}
                          resizeMode="cover"
                        />
                        <View style={styles.playButton}>
                          <Play color="#000" fill="#000" size={20} style={{ marginLeft: 2 }} />
                        </View>
                      </View>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {song.title}
                      </Text>
                      <Text style={styles.cardArtist} numberOfLines={1}>
                        {song.artist}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* NEWEST */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Newest</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.cardRow}>
                  {newestSongs.slice(newestStart, newestStart + itemsPerView).map(song => (
                    <TouchableOpacity
                      key={song._id}
                      style={styles.musicCard}
                      onPress={() => handlePlayTrack(song)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.imageContainer}>
                        <Image
                          source={
                            song.imageUrl
                              ? { uri: song.imageUrl }
                              : require("../assets/i1.jpg")
                          }
                          style={styles.cardImage}
                          resizeMode="cover"
                        />
                        <View style={styles.playButton}>
                          <Play color="#000" fill="#000" size={20} style={{ marginLeft: 2 }} />
                        </View>
                      </View>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {song.title}
                      </Text>
                      <Text style={styles.cardArtist} numberOfLines={1}>
                        {song.artist}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// === STYLES GIỮ NGUYÊN ===
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
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  headerRight: { flexDirection: "row", gap: 12 },
  iconButton: { padding: 4 },
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
  featureContent: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 24, zIndex: 10 },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  featureTitle: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 8 },
  featureDesc: { fontSize: 15, color: "#e2e8f0", lineHeight: 22 },
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
  section: { marginBottom: 32, paddingHorizontal: 16 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
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
  },
  cardTitle: { fontSize: 14, fontWeight: "600", color: "#fff", marginBottom: 4 },
  cardArtist: { fontSize: 12, color: "#94a3b8" },
})

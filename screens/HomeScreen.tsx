// screens/HomeScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Music,
  Upload,
  Users,
  MessageCircle,
  Search,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {api} from "../lib/api";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48 - 18) / 4;

const features = [
  {
    id: "f1",
    title: "Vast Music Library",
    description:
      "Millions of songs from around the world, every music genre you love",
    image: require("../assets/music-library.png"),
    gradient: ["#4c1d95", "#1e3a8a"],
    icon: Music,
  },
  {
    id: "f2",
    title: "Free Album Publishing",
    description:
      "Artists can freely upload and manage their albums, share music with the world",
    image: require("../assets/music-upload-interface.png"),
    gradient: ["#831843", "#6b21a8"],
    icon: Upload,
  },
  {
    id: "f3",
    title: "Connect with Friends",
    description:
      "Connect with friends, share playlists, see what they're listening to and chat directly",
    image: require("../assets/social-music.png"),
    gradient: ["#1e3a8a", "#115e59"],
    icon: Users,
  },
];

interface Props {
  onPlay: (track: any) => void;
  onSearch: () => void;
  onOpenAlbum: (album: any) => void;
  onOpenChat: () => void;
  onOpenSong: (songId: string) => void; 
}

export default function HomeScreen({
  onPlay,
  onSearch,
  onOpenAlbum,
  onOpenChat,
  onOpenSong,
}: Props) {
  const [featureIndex, setFeatureIndex] = useState(0);
  const [trendingSongs, setTrendingSongs] = useState<any[]>([]);
  const [trendingAlbums, setTrendingAlbums] = useState<any[]>([]);
  const [newestSongs, setNewestSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const itemsPerView = 4;
  const currentFeature = features[featureIndex];
  const Icon = currentFeature.icon;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/main/home");
        if (cancelled) return;
        const data = res.data || {};
        setTrendingSongs(data.trendingSongs || []);
        setTrendingAlbums(data.trendingAlbums || []);
        setNewestSongs(data.newestSongs || []);
      } catch (err) {
        console.error("Failed to load home data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Vibe Melody</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={onSearch} style={styles.iconButton}>
              <Search color="#60a5fa" size={22} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onOpenChat} style={styles.iconButton}>
              <MessageCircle color="#60a5fa" size={22} />
            </TouchableOpacity>
          </View>
        </View>

        {/* HERO / FEATURE */}
        <View style={styles.featureContainer}>
          <Image
            source={currentFeature.image}
            style={styles.featureImage}
            resizeMode="cover"
          />
          <View
            style={[styles.gradientOverlay, { backgroundColor: currentFeature.gradient[0] }]}
          />
          <View style={styles.featureContent}>
            <View style={styles.featureIcon}>
              <Icon color="#fff" size={30} />
            </View>
            <Text style={styles.featureTitle}>{currentFeature.title}</Text>
            <Text style={styles.featureDesc}>{currentFeature.description}</Text>
          </View>

          <View style={styles.featureControls}>
            <TouchableOpacity
              onPress={() =>
                setFeatureIndex((prev) => (prev === 0 ? features.length - 1 : prev - 1))
              }
              style={styles.controlBtn}
            >
              <ChevronLeft color="#fff" size={18} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                setFeatureIndex((prev) => (prev === features.length - 1 ? 0 : prev + 1))
              }
              style={styles.controlBtn}
            >
              <ChevronRight color="#fff" size={18} />
            </TouchableOpacity>
          </View>

          <View style={styles.dots}>
            {features.map((_, i) => (
              <View key={i} style={[styles.dot, i === featureIndex && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* TRENDING SONGS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Songs</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#60a5fa" />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.cardRow}>
                {trendingSongs.slice(0, itemsPerView).map((song) => (
                  <TouchableOpacity
                    key={song._id}
                    onPress={() => onOpenSong(song._id)} // ✅ truyền songId
                    style={styles.musicCard}
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
                      />
                      <View style={styles.playButton}>
                        <Play color="#000" fill="#000" size={18} />
                      </View>
                    </View>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {song.title}
                    </Text>
                    <Text style={styles.cardArtist} numberOfLines={1}>
                      {song.artistName || song.artist}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        {/* TRENDING ALBUMS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Albums</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#60a5fa" />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.cardRow}>
                {trendingAlbums.slice(0, itemsPerView).map((album) => (
                  <TouchableOpacity
                    key={album._id}
                    onPress={() => onOpenAlbum(album)}
                    style={styles.musicCard}
                    activeOpacity={0.8}
                  >
                    <View style={styles.imageContainer}>
                      <Image
                        source={
                          album.imageUrl
                            ? { uri: album.imageUrl }
                            : require("../assets/i1.jpg")
                        }
                        style={styles.cardImage}
                      />
                      <View style={styles.playButton}>
                        <Play color="#000" fill="#000" size={18} />
                      </View>
                    </View>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {album.title}
                    </Text>
                    <Text style={styles.cardArtist} numberOfLines={1}>
                      {album.artistName}
                      {album.tracksCount ? ` • ${album.tracksCount}` : ""}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        {/* NEWEST SONGS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Newest Songs</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#60a5fa" />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.cardRow}>
                {newestSongs.slice(0, itemsPerView).map((song) => (
                  <TouchableOpacity
                    key={song._id}
                    onPress={() => onOpenSong(song._id)} // ✅ truyền songId
                    style={styles.musicCard}
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
                      />
                      <View style={styles.playButton}>
                        <Play color="#000" fill="#000" size={18} />
                      </View>
                    </View>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {song.title}
                    </Text>
                    <Text style={styles.cardArtist} numberOfLines={1}>
                      {song.artistName || song.artist}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
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
  featureTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
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
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  dotActive: { width: 24, backgroundColor: "#fff" },

  section: { marginBottom: 32, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  cardRow: { flexDirection: "row", gap: 16 },
  musicCard: { width: CARD_WIDTH },
  imageContainer: { position: "relative", marginBottom: 12 },
  cardImage: { width: "100%", height: CARD_WIDTH, borderRadius: 12 },
  playButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#60a5fa",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  cardArtist: { fontSize: 12, color: "#94a3b8" },
});

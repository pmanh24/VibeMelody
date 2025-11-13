import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  Play,
  Shuffle,
  Download,
  MoreHorizontal,
  Clock,
  Plus,
  X,
  Heart,
  ChevronLeft,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../lib/api";
import { useUserStore } from "../store/useUserStore";
import { usePlayerStore, PlayerSong } from "../store/usePlayerStore";

const { width } = Dimensions.get("window");
const COVER_SIZE = width * 0.8;

interface Track {
  id: string;
  name: string;
  artist: string;
  image?: any;
  duration: number; // seconds
  album?: string;
  date?: string;
  audioUrl?: string;
}

interface Props {
  album: any; // album cơ bản truyền từ HomeScreen
  onBack: () => void;
  onPlayTrack: (track: Track) => void; // vẫn giữ để không phải sửa App.tsx
  onEditAlbum?: (albumId: string) => void;
}

const formatDuration = (sec?: number) => {
  const s = Math.max(0, Math.floor(sec || 0));
  const m = Math.floor(s / 60);
  const r = String(s % 60).padStart(2, "0");
  return `${m}:${r}`;
};

const formatAlbumDuration = (totalSec: number) => {
  const m = Math.round(totalSec / 60);
  if (m < 60) return `${m} minutes`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return `${h} hr${h > 1 ? "s" : ""} ${rem} min`;
};

export default function AlbumDetailScreen({
  album,
  onBack,
  onPlayTrack,
  onEditAlbum,
}: Props) {
  const { user } = useUserStore() as any;
  const playAlbumStore = usePlayerStore((s) => s.playAlbum);

  const [detail, setDetail] = useState<any>(album || null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);

  const [albumLiked, setAlbumLiked] = useState(false);
  const [albumLikesCount, setAlbumLikesCount] = useState(0);
  const [liking, setLiking] = useState(false);

  const albumId = detail?._id || album?._id;

  // canEdit: chỉ chủ album mới thấy Add Songs
  const canEdit = useMemo(() => {
    if (!detail || !user) return false;
    const uid = user._id || user.id;
    if (!uid || !detail.artistId) return false;
    return String(uid) === String(detail.artistId);
  }, [detail, user]);

  // fetch album + songs
  useEffect(() => {
    if (!albumId) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/main/albums/${albumId}`);

        if (cancelled) return;

        const a = data.album || album;
        setDetail(a);
        setAlbumLikesCount(a?.likesCount || 0);

        const mappedTracks: Track[] =
          (data.songs || []).map((s: any) => ({
            id: s._id,
            name: s.title,
            artist: s.artistName || s.artist,
            album: a?.title || album?.title || "",
            date: s.createdAt
              ? new Date(s.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "",
            duration: s.duration || s.durationSec || 0,
            image: s.imageUrl || a?.imageUrl || album?.imageUrl,
            audioUrl: s.audioUrl,
          })) || [];

        setTracks(mappedTracks);
      } catch (err) {
        console.error("Failed to load album:", err);
        Alert.alert("Lỗi", "Không tải được album");
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [albumId]);

  // fetch like-status
  useEffect(() => {
    if (!albumId || !user) return;
    let cancelled = false;

    (async () => {
      try {
        const { data } = await api.get(`/albums/${albumId}/like-status`);
        if (cancelled) return;
        setAlbumLiked(!!data.liked);
        setAlbumLikesCount(
          typeof data.likesCount === "number" ? data.likesCount : 0
        );
      } catch (err) {
        console.error("Failed to load album like status:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [albumId, user]);

  // build queue cho PlayerStore
  const buildQueue = (): PlayerSong[] =>
    tracks.map((t) => ({
      _id: t.id,
      title: t.name,
      artist: t.artist,
      // nếu image là string (url) thì dùng luôn, còn nếu là require(...) thì fallback album.imageUrl
      imageUrl:
        typeof t.image === "string"
          ? t.image
          : detail?.imageUrl || album?.imageUrl || undefined,
      audioUrl: t.audioUrl,
      duration: t.duration,
    }));

  // toggle like album
  const toggleAlbumLike = async () => {
    if (!albumId) return;
    if (!user) {
      Alert.alert("Thông báo", "Bạn cần đăng nhập để thích album này");
      return;
    }
    if (liking) return;

    setLiking(true);
    const prevLiked = albumLiked;
    const prevCount = albumLikesCount;

    if (!prevLiked) {
      // like
      setAlbumLiked(true);
      setAlbumLikesCount((c) => c + 1);
      try {
        const { data } = await api.post(`/albums/${albumId}/like`);
        if (typeof data.likesCount === "number") {
          setAlbumLikesCount(data.likesCount);
        }
      } catch (err) {
        console.error("Like album failed:", err);
        setAlbumLiked(prevLiked);
        setAlbumLikesCount(prevCount);
      } finally {
        setLiking(false);
      }
    } else {
      // unlike
      setAlbumLiked(false);
      setAlbumLikesCount((c) => Math.max(0, c - 1));
      try {
        const { data } = await api.delete(`/albums/${albumId}/like`);
        if (typeof data.likesCount === "number") {
          setAlbumLikesCount(data.likesCount);
        }
      } catch (err) {
        console.error("Unlike album failed:", err);
        setAlbumLiked(prevLiked);
        setAlbumLikesCount(prevCount);
      } finally {
        setLiking(false);
      }
    }
  };

  // play cả album bằng store
  const handlePlayAlbum = () => {
    const queue = buildQueue();
    if (!queue.length) return;
    playAlbumStore(queue, 0);
    // nếu muốn vẫn gọi callback cũ:
    // onPlayTrack?.(tracks[0]);
  };

  // remove track (client-only, như web)
  const removeTrack = (trackId: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
  };

  const totalDurationSec = useMemo(
    () => tracks.reduce((sum, t) => sum + (t.duration || 0), 0),
    [tracks]
  );

  if (loading && !detail) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: "center" }]}>
          <ActivityIndicator color="#60a5fa" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!detail) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: "center" }]}>
          <Text style={{ color: "#fff", textAlign: "center" }}>
            Album not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const coverImages = [detail.imageUrl];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ChevronLeft color="#60a5fa" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{detail.title || "Album"}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollContainer}>
          {/* ALBUM INFO */}
          <View style={styles.albumInfo}>
            <Image
              source={
                detail.imageUrl
                  ? { uri: detail.imageUrl }
                  : require("../assets/i1.jpg") // fallback local
              }
              style={styles.albumCover}
              resizeMode="cover"
            />

            <View style={styles.info}>
              <Text style={styles.type}>{detail.type || "Album"}</Text>
              <Text style={styles.name}>{detail.title}</Text>
              <View style={styles.meta}>
                <Text style={styles.artist}>
                  {detail.artistName || "Unknown Artist"}
                </Text>
                <Text style={styles.dot}> • </Text>
                <Text style={styles.tracksText}>
                  {tracks.length} songs,{" "}
                  {totalDurationSec > 0
                    ? formatAlbumDuration(totalDurationSec)
                    : "Album"}
                </Text>
                {!!albumLikesCount && (
                  <>
                    <Text style={styles.dot}> • </Text>
                    <Text style={styles.tracksText}>
                      {albumLikesCount} likes
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>

          {/* CONTROLS */}
          <View style={styles.controls}>
            <TouchableOpacity style={styles.playBtn} onPress={handlePlayAlbum}>
              <Play
                color="#000"
                fill="#000"
                size={24}
                style={{ marginLeft: 2 }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBtn}
              onPress={toggleAlbumLike}
              disabled={liking}
            >
              <Heart
                size={20}
                color={albumLiked ? "#fb7185" : "#94a3b8"}
                fill={albumLiked ? "#fb7185" : "none"}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBtn}>
              <Shuffle color="#94a3b8" size={20} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Download color="#94a3b8" size={20} />
            </TouchableOpacity>

            {canEdit && (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => {
                  if (onEditAlbum) onEditAlbum(albumId);
                  else
                    Alert.alert(
                      "Chức năng",
                      "Hook onEditAlbum để điều hướng sang màn quản lý album."
                    );
                }}
              >
                <Plus color="#fff" size={20} />
                <Text style={styles.addText}>Add Songs</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.iconBtn}>
              <MoreHorizontal color="#94a3b8" size={20} />
            </TouchableOpacity>
          </View>

          {/* TRACK LIST */}
          <View style={styles.trackList}>
            <View style={styles.trackHeader}>
              <Text style={styles.th}>#</Text>
              <Text style={styles.thTitle}>Title</Text>
              <Text style={styles.th}>Date Added</Text>
              <Text style={styles.thCenter}>
                <Clock color="#94a3b8" size={16} />
              </Text>
              <View style={{ width: 40 }} />
            </View>

            {tracks.map((track, i) => (
              <TouchableOpacity
                key={track.id}
                style={styles.trackRow}
                activeOpacity={0.8}
                onPress={() => {
                  const queue = buildQueue();
                  const idx = queue.findIndex((s) => s._id === track.id);
                  const startIndex = idx === -1 ? 0 : idx;
                  playAlbumStore(queue, startIndex);
                  // nếu muốn callback ngoài vẫn chạy:
                  onPlayTrack?.(track);
                }}
              >
                <Text style={styles.trackIndex}>{i + 1}</Text>
                <View style={styles.trackTitle}>
                  <Image
                    source={
                      track.image
                        ? typeof track.image === "string"
                          ? { uri: track.image }
                          : track.image
                        : require("../assets/i1.jpg")
                    }
                    style={styles.trackImg}
                  />
                  <View>
                    <Text style={styles.trackName} numberOfLines={1}>
                      {track.name}
                    </Text>
                    <Text style={styles.trackArtist} numberOfLines={1}>
                      {track.artist}
                    </Text>
                  </View>
                </View>
                <Text style={styles.trackDate} numberOfLines={1}>
                  {track.date}
                </Text>
                <Text style={styles.trackDuration}>
                  {formatDuration(track.duration)}
                </Text>
                {canEdit && (
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      removeTrack(track.id);
                    }}
                  >
                    <X color="#94a3b8" size={16} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}

            {!tracks.length && (
              <Text
                style={{
                  color: "#94a3b8",
                  textAlign: "center",
                  marginTop: 24,
                  fontSize: 13,
                }}
              >
                Album chưa có bài hát nào.
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// giữ nguyên tone & layout bản TSX cũ
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0f172a" },
  container: { flex: 1 },
  scrollContainer: { flex: 1 },

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
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "DancingScript_700Bold",
  },
  albumInfo: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: "#1e293b",
    alignItems: "center",
  },
  albumCover: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: 12,
    backgroundColor: "#020617",
  },
  info: {
    width: "100%",
    marginTop: 16,
    paddingRight: 8,
  },
  type: { fontSize: 13, color: "#94a3b8", marginBottom: 4 },
  name: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
    fontFamily: "DancingScript_700Bold",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  artist: { fontSize: 13, color: "#fff", fontWeight: "600" },
  dot: { color: "#94a3b8", fontSize: 12 },
  tracksText: { fontSize: 13, color: "#94a3b8" },

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
  trackIndex: {
    width: 36,
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 13,
  },
  trackTitle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingRight: 16,
  },
  trackImg: { width: 38, height: 38, borderRadius: 6 },
  trackName: {
    color: "#fff",
    fontSize: 13.5,
    fontWeight: "600",
    maxWidth: 140,
  },
  trackArtist: { color: "#94a3b8", fontSize: 11.5, maxWidth: 140 },
  trackDate: {
    width: 90,
    color: "#64748b",
    fontSize: 11.5,
    textAlign: "center",
  },
  trackDuration: {
    width: 56,
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 11.5,
  },
  removeBtn: { padding: 6, paddingLeft: 10 },
});

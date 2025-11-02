"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Audio } from "expo-av";
import {
  Heart,
  Repeat2,
  Share2,
  Plus,
  MoreHorizontal,
  Play,
  Pause,
  Send,
  ChevronLeft,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Song = {
  _id: string;
  title: string;
  artist: string;
  audioUrl: string;
  imageUrl?: string;
  duration?: number;
};

interface Props {
  track: Song;
  onBack: () => void;
}

export default function MusicDetailScreen({ track, onBack }: Props) {
  const [isLiked, setIsLiked] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<{ user: string; content: string }[]>([]);
  const [player, setPlayer] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🟢 Clear sound khi rời trang
  useEffect(() => {
    return () => {
      if (player) player.unloadAsync();
    };
  }, [player]);

  // 🟢 Fake load comment
  useEffect(() => {
    setComments([
      { user: "John", content: "This track is fire 🔥" },
      { user: "Anna", content: "Vibe is so chill!" },
    ]);
  }, []);

  // 🟢 Gửi comment (mock)
  const handleSendComment = () => {
    if (!comment.trim()) return;
    setComments((prev) => [...prev, { user: "You", content: comment.trim() }]);
    setComment("");
  };

  // 🟢 Like / Repost
  const toggleLike = () => setIsLiked(!isLiked);
  const toggleRepost = () => setIsReposted(!isReposted);

  // 🟢 Phát / Tạm dừng nhạc
  const handlePlayPause = async () => {
    if (!track.audioUrl) {
      return Alert.alert("Error", "No audio URL found for this song");
    }

    try {
      if (isPlaying && player) {
        await player.pauseAsync();
        setIsPlaying(false);
      } else if (player) {
        await player.playAsync();
        setIsPlaying(true);
      } else {
        setLoading(true);
        const { sound } = await Audio.Sound.createAsync(
          { uri: track.audioUrl },
          { shouldPlay: true }
        );
        setPlayer(sound);
        setIsPlaying(true);
        setLoading(false);
      }
    } catch (err) {
      console.error("Audio error:", err);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ChevronLeft color="#60a5fa" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Now Playing</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* COVER ART */}
        <View style={styles.coverArtCard}>
          <Image
            source={{
              uri:
                track.imageUrl ||
                "https://cdn-icons-png.flaticon.com/512/1384/1384060.png",
            }}
            style={styles.coverArt}
            resizeMode="cover"
          />
        </View>

        {/* PLAYER */}
        <View style={styles.playerCard}>
          <View style={styles.playerHeader}>
            <TouchableOpacity style={styles.playBtnBig} onPress={handlePlayPause}>
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : isPlaying ? (
                <Pause color="#000" fill="#000" size={32} />
              ) : (
                <Play color="#000" fill="#000" size={32} />
              )}
            </TouchableOpacity>

            <View style={styles.trackInfo}>
              <Text style={styles.trackTitle}>{track.title}</Text>
              <Text style={styles.artistName}>{track.artist}</Text>
              <Text style={styles.uploadedAt}>Uploaded recently</Text>
            </View>
          </View>

          {/* ACTION BUTTONS */}
          <View style={styles.actionRow}>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionBtn, isLiked && styles.actionBtnActive]}
                onPress={toggleLike}
              >
                <Heart
                  color={isLiked ? "#60a5fa" : "#94a3b8"}
                  fill={isLiked ? "#60a5fa" : "none"}
                  size={22}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, isReposted && styles.actionBtnActive]}
                onPress={toggleRepost}
              >
                <Repeat2 color={isReposted ? "#60a5fa" : "#94a3b8"} size={22} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn}>
                <Share2 color="#94a3b8" size={22} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Plus color="#94a3b8" size={22} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <MoreHorizontal color="#94a3b8" size={22} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* COMMENTS */}
        <View style={styles.commentInputCard}>
          <TextInput
            style={styles.commentInput}
            placeholder="Write a comment..."
            placeholderTextColor="#64748b"
            value={comment}
            onChangeText={setComment}
          />
          <TouchableOpacity onPress={handleSendComment} style={styles.sendBtn}>
            <Send color="#94a3b8" size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comments ({comments.length})</Text>
          {comments.length === 0 && (
            <Text style={{ color: "#64748b", marginTop: 10 }}>
              No comments yet
            </Text>
          )}
          {comments.map((c, i) => (
            <View key={i} style={{ marginTop: 10 }}>
              <Text style={{ color: "#fff", fontWeight: "600" }}>{c.user}</Text>
              <Text style={{ color: "#94a3b8" }}>{c.content}</Text>
            </View>
          ))}
        </View>
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
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  coverArtCard: { margin: 16, borderRadius: 16, overflow: "hidden" },
  coverArt: { width: "100%", height: 250 },
  playerCard: {
    marginHorizontal: 16,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  playerHeader: { flexDirection: "row", alignItems: "center", gap: 16 },
  playBtnBig: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#60a5fa",
    justifyContent: "center",
    alignItems: "center",
  },
  trackInfo: { flex: 1 },
  trackTitle: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  artistName: { color: "#94a3b8" },
  uploadedAt: { color: "#64748b", fontSize: 13 },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  actionButtons: { flexDirection: "row", gap: 10 },
  actionBtn: { padding: 8, borderRadius: 10 },
  actionBtnActive: { backgroundColor: "rgba(96,165,250,0.15)" },
  commentInputCard: {
    margin: 16,
    flexDirection: "row",
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 10,
    alignItems: "center",
  },
  commentInput: { flex: 1, color: "#fff", fontSize: 15 },
  sendBtn: { padding: 6 },
  commentsSection: {
    margin: 16,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
  },
  commentsTitle: { color: "#fff", fontWeight: "600", fontSize: 16 },
});

// screens/MusicDetailScreen.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
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
import {api} from "../lib/api";

interface Song {
  _id: string;
  title: string;
  artist: any;
  artistName?: string;
  audioUrl: string;
  imageUrl?: string;
  duration?: number;
}

interface Props {
  songId: string;
  onBack: () => void;
}

export default function MusicDetailScreen({ songId, onBack }: Props) {
  const [song, setSong] = useState<Song | null>(null);
  const [artist, setArtist] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [comment, setComment] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [player, setPlayer] = useState<Audio.Sound | null>(null);

  // 🟢 Fetch dữ liệu chính
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(`/songs/main/${songId}`);
        if (cancelled) return;
        setSong(res.data.song);
        setArtist(res.data.artist);
        setComments(res.data.comments || []);
      } catch (err) {
        console.error("Failed to load song:", err);
        Alert.alert("Error", "Failed to load song details");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [songId]);

  // 🟢 Like status
  useEffect(() => {
    if (!songId) return;
    (async () => {
      try {
        const res = await api.get(`/songs/${songId}/like-status`);
        setIsLiked(!!res.data.liked);
        setLikesCount(res.data.likesCount || 0);
      } catch {}
    })();
  }, [songId]);

  // 🟢 Follow status
  useEffect(() => {
    if (!artist?._id) return;
    (async () => {
      try {
        const res = await api.get(
          `/artists/${artist._id}/follow-status`
        );
        setIsFollowing(!!res.data.following);
        setFollowersCount(res.data.followersCount || 0);
      } catch {}
    })();
  }, [artist?._id]);

  // 🟢 Dọn player khi rời
  useEffect(() => {
    return () => {
      if (player) player.unloadAsync();
    };
  }, [player]);

  // 🟢 Play / Pause nhạc
  const handlePlayPause = async () => {
    if (!song?.audioUrl) return Alert.alert("No audio", "This song has no audio file.");
    try {
      if (isPlaying && player) {
        await player.pauseAsync();
        setIsPlaying(false);
      } else if (player) {
        await player.playAsync();
        setIsPlaying(true);
      } else {
        const { sound } = await Audio.Sound.createAsync(
          { uri: song.audioUrl },
          { shouldPlay: true }
        );
        setPlayer(sound);
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Audio error:", err);
    }
  };

  // 🟢 Toggle Like
  const toggleLike = async () => {
    if (!song?._id || liking) return;
    setLiking(true);
    const prev = isLiked;
    const prevCount = likesCount;
    if (!prev) {
      setIsLiked(true);
      setLikesCount((c) => c + 1);
      try {
        const res = await api.post(
          `/songs/${song._id}/like`
        );
        setIsLiked(!!res.data.liked);
        setLikesCount(res.data.likesCount ?? prevCount + 1);
      } catch {
        setIsLiked(prev);
        setLikesCount(prevCount);
      } finally {
        setLiking(false);
      }
    } else {
      setIsLiked(false);
      setLikesCount((c) => Math.max(0, c - 1));
      try {
        const res = await api.delete(
          `/songs/${song._id}/like`
        );
        setIsLiked(!!res.data.liked);
        setLikesCount(res.data.likesCount ?? prevCount - 1);
      } catch {
        setIsLiked(prev);
        setLikesCount(prevCount);
      } finally {
        setLiking(false);
      }
    }
  };

  // 🟢 Toggle Follow
  const toggleFollow = async () => {
    if (!artist?._id || followLoading) return;
    setFollowLoading(true);
    const prev = isFollowing;
    const prevCount = followersCount;
    if (!prev) {
      setIsFollowing(true);
      setFollowersCount((c) => c + 1);
      try {
        const res = await api.post(
          `/artists/${artist._id}/follow`
        );
        setIsFollowing(!!res.data.following);
        setFollowersCount(res.data.followersCount ?? prevCount + 1);
      } catch {
        setIsFollowing(prev);
        setFollowersCount(prevCount);
      } finally {
        setFollowLoading(false);
      }
    } else {
      setIsFollowing(false);
      setFollowersCount((c) => Math.max(0, c - 1));
      try {
        const res = await api.delete(
          `/artists/${artist._id}/follow`
        );
        setIsFollowing(!!res.data.following);
        setFollowersCount(res.data.followersCount ?? prevCount - 1);
      } catch {
        setIsFollowing(prev);
        setFollowersCount(prevCount);
      } finally {
        setFollowLoading(false);
      }
    }
  };

  // 🟢 Comment
  const handleSendComment = async () => {
    if (!song?._id || !comment.trim()) return;
    try {
      const { data } = await api.post(
        `/songs/${song._id}/comments`,
        { content: comment }
      );
      setComments((prev) => [data, ...prev]);
      setComment("");
    } catch (err) {
      console.error("Comment failed:", err);
    }
  };

  if (loading || !song)
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#60a5fa" style={{ marginTop: 60 }} />
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ChevronLeft color="#60a5fa" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{song.title}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* COVER */}
        <View style={styles.coverArtCard}>
          <Image
            source={{
              uri: song.imageUrl || "https://cdn-icons-png.flaticon.com/512/1384/1384060.png",
            }}
            style={styles.coverArt}
            resizeMode="cover"
          />
        </View>

        {/* PLAYER */}
        <View style={styles.playerCard}>
          <View style={styles.playerHeader}>
            <TouchableOpacity style={styles.playBtnBig} onPress={handlePlayPause}>
              {isPlaying ? (
                <Pause color="#000" fill="#000" size={30} />
              ) : (
                <Play color="#000" fill="#000" size={30} />
              )}
            </TouchableOpacity>

            <View style={styles.trackInfo}>
              <Text style={styles.trackTitle}>{song.title}</Text>
              <Text style={styles.artistName}>{song.artistName || song.artist?.fullName}</Text>
              <Text style={styles.uploadedAt}>Recently uploaded</Text>
            </View>
          </View>

          {/* ACTIONS */}
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
              <TouchableOpacity style={styles.actionBtn}>
                <Repeat2 color="#94a3b8" size={22} />
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
            <Text style={styles.likeCount}>{likesCount} likes</Text>
          </View>
        </View>

        {/* ARTIST INFO */}
        {artist && (
          <View style={styles.artistCard}>
            <Image
              source={{
                uri: artist.imageUrl || "https://cdn-icons-png.flaticon.com/512/847/847969.png",
              }}
              style={styles.artistAvatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.artistNameBig}>{artist.fullName}</Text>
              <Text style={styles.artistFollowers}>{followersCount} followers</Text>
            </View>
            <TouchableOpacity
              onPress={toggleFollow}
              style={[
                styles.followBtn,
                isFollowing && { backgroundColor: "transparent", borderWidth: 1, borderColor: "#60a5fa" },
              ]}
            >
              <Text
                style={{
                  color: isFollowing ? "#60a5fa" : "#000",
                  fontWeight: "600",
                }}
              >
                {isFollowing ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

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
          {comments.length === 0 ? (
            <Text style={{ color: "#64748b", marginTop: 8 }}>No comments yet</Text>
          ) : (
            comments.map((c, i) => (
              <View key={i} style={{ marginTop: 10 }}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>{c.user?.fullName || "User"}</Text>
                <Text style={{ color: "#94a3b8" }}>{c.content}</Text>
              </View>
            ))
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
    marginTop: 16,
  },
  actionButtons: { flexDirection: "row", gap: 10 },
  actionBtn: { padding: 8, borderRadius: 10 },
  actionBtnActive: { backgroundColor: "rgba(96,165,250,0.15)" },
  likeCount: { color: "#94a3b8", fontSize: 13 },

  artistCard: {
    marginHorizontal: 16,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  artistAvatar: { width: 64, height: 64, borderRadius: 32, marginRight: 12 },
  artistNameBig: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  artistFollowers: { color: "#94a3b8", fontSize: 13 },
  followBtn: {
    backgroundColor: "#60a5fa",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  commentInputCard: {
    marginHorizontal: 16,
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

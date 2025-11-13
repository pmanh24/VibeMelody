// components/MiniPlayer.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Pressable,
  LayoutChangeEvent,
  GestureResponderEvent,
} from "react-native";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
} from "lucide-react-native";
import { usePlayerStore } from "../store/usePlayerStore";

interface Props {
  // mở màn hình player chi tiết
  onPress: () => void;
}

const formatTime = (sec?: number) => {
  if (!sec || sec < 0) return "0:00";
  const total = Math.floor(sec);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

export default function MiniPlayer({ onPress }: Props) {
  const currentSong = usePlayerStore((s) => s.currentSong as any);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const playNext = usePlayerStore((s) => s.playNext);
  const playPrevious = usePlayerStore((s) => s.playPrevious);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const setProgress = usePlayerStore((s) => s.setProgress);

  // lưu width của thanh progress để tính % khi bấm
  const [trackWidth, setTrackWidth] = useState(0);

  // Không có bài → không render MiniPlayer
  if (!currentSong) return null;

  const image =
    currentSong.imageUrl ||
    "https://cdn-icons-png.flaticon.com/512/1384/1384060.png";

  const progress =
    duration && duration > 0
      ? Math.min(1, Math.max(0, currentTime / duration))
      : 0;

  const handleTrackLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  const handleSeek = (e: GestureResponderEvent) => {
    if (!duration || duration <= 0 || !trackWidth) return;
    const x = e.nativeEvent.locationX;
    const ratio = Math.min(1, Math.max(0, x / trackWidth));
    const newSec = ratio * duration;
    // dùng setProgress trong store để tua
    setProgress(newSec);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Cover */}
      <Image source={{ uri: image }} style={styles.cover} />

      {/* Info + progress */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {currentSong.title || "Unknown"}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {currentSong.artist || "Unknown"}
        </Text>

        {/* Time + progress bar */}
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>

        <View style={styles.progressHitArea}>
          <Pressable
            style={styles.progressTrack}
            onLayout={handleTrackLayout}
            onPress={handleSeek}
          >
            <View
              style={[
                styles.progressBar,
                { width: `${progress * 100}%` },
              ]}
            />
          </Pressable>
        </View>
      </View>

      {/* Controls: prev / play / next */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={playPrevious}
          hitSlop={8}
        >
          <SkipBack size={18} color="#e5e7eb" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconBtn, styles.playMain]}
          onPress={togglePlay}
          hitSlop={10}
        >
          {isPlaying ? (
            <Pause size={18} color="#0f172a" />
          ) : (
            <Play size={18} color="#0f172a" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={playNext}
          hitSlop={8}
        >
          <SkipForward size={18} color="#e5e7eb" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 90,
    backgroundColor: "#020617",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    position: "absolute",
    bottom: 70, // nằm trên BottomTabBar
    left: 0,
    right: 0,
  },
  cover: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#1f2937",
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 14,
    color: "#f9fafb",
    fontWeight: "600",
  },
  artist: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  timeText: {
    fontSize: 10,
    color: "#6b7280",
  },
  progressHitArea: {
    marginTop: 4,
    paddingVertical: 6, // tăng vùng chạm
  },
  progressTrack: {
    height: 8, // dày hơn cho dễ bấm
    borderRadius: 999,
    backgroundColor: "#111827",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#60a5fa",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  iconBtn: {
    padding: 6,
  },
  playMain: {
    marginHorizontal: 2,
    backgroundColor: "#f9fafb",
    borderRadius: 999,
  },
});

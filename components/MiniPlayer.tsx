import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { Play, Pause } from "lucide-react-native";
import { Audio } from "expo-av";

interface Props {
  track: { name: string; artist: string; image?: string; url?: string };
  onPress: () => void;
}

export default function MiniPlayer({ track, onPress }: Props) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  const fallbackImage = "https://cdn-icons-png.flaticon.com/512/1384/1384060.png";

  // 🟢 Clear khi component bị gỡ
  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [sound]);

  // 🟢 Play / Pause
  const handlePlayPause = async () => {
    if (!track.url) return;
    try {
      if (isPlaying && sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else if (sound) {
        await sound.playAsync();
        setIsPlaying(true);
      } else {
        setLoading(true);
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: track.url },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);
        setLoading(false);
      }
    } catch (error) {
      console.log("Play error:", error);
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.85}>
      <Image
        source={{ uri: track.image || fallbackImage }}
        style={styles.cover}
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{track.name || "Unknown"}</Text>
        <Text style={styles.artist} numberOfLines={1}>{track.artist || "Unknown"}</Text>
      </View>

      <TouchableOpacity style={styles.playBtn} onPress={handlePlayPause}>
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : isPlaying ? (
          <Pause color="#000" fill="#000" size={20} />
        ) : (
          <Play color="#000" fill="#000" size={20} />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 70,
    backgroundColor: "#1e293b",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#334155",
    position: "absolute",
    bottom: 70,
    left: 0,
    right: 0,
  },
  cover: { width: 48, height: 48, borderRadius: 8, backgroundColor: "#334155" },
  info: { flex: 1, marginLeft: 12 },
  title: { fontSize: 14, color: "#fff", fontWeight: "600" },
  artist: { fontSize: 12, color: "#94a3b8" },
  playBtn: { padding: 8 },
});

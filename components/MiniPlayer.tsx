// components/MiniPlayer.tsx
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"
import { Play } from "lucide-react-native"

interface Props {
  track: { name: string; artist: string }
  onPress: () => void
}

export default function MiniPlayer({ track, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <Image source={require("../assets/i1.jpg")} style={styles.cover} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{track.name}</Text>
        <Text style={styles.artist} numberOfLines={1}>{track.artist}</Text>
      </View>
      <TouchableOpacity style={styles.playBtn}>
        <Play color="#000" fill="#000" size={20} />
      </TouchableOpacity>
    </TouchableOpacity>
  )
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
  cover: { width: 48, height: 48, borderRadius: 8 },
  info: { flex: 1, marginLeft: 12 },
  title: { fontSize: 14, color: "#fff", fontFamily: "Geist" },
  artist: { fontSize: 12, color: "#94a3b8" },
  playBtn: { padding: 8 },
})
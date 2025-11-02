"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native"
import {
  Heart,
  Repeat2,
  Share2,
  Plus,
  MoreHorizontal,
  Play,
  Send,
  ChevronLeft,
} from "lucide-react-native"
import { SafeAreaView } from "react-native-safe-area-context"

interface Track {
  id: string
  name: string
  artist: string
  image: any
  duration: number
}

interface Props {
  track: Track
  onBack: () => void
}

export default function MusicDetailScreen({ track, onBack }: Props) {
  const [isLiked, setIsLiked] = useState(false)
  const [isReposted, setIsReposted] = useState(false)
  const [comment, setComment] = useState("")

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

        {/* COVER ART – ĐẦU TRANG */}
        <View style={styles.coverArtCard}>
          <Image source={track.image} style={styles.coverArt} resizeMode="cover" />
        </View>

        {/* PLAYER CARD */}
        <View style={styles.playerCard}>
          <View style={styles.playerHeader}>
            <TouchableOpacity style={styles.playBtnBig}>
              <Play color="#000" fill="#000" size={32} />
            </TouchableOpacity>

            <View style={styles.trackInfo}>
              <Text style={styles.trackTitle} numberOfLines={2}>
                {track.name}
              </Text>
              <Text style={styles.artistName}>{track.artist}</Text>
              <Text style={styles.uploadedAt}>Just now</Text>
            </View>
          </View>

          {/* WAVEFORM */}
          <View style={styles.waveform}>
            {Array.from({ length: 7 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.waveBar,
                  i % 3 === 0 && styles.waveBarShort,
                  i === 3 && styles.waveBarTall,
                ]}
              />
            ))}
          </View>

          {/* ACTION BUTTONS */}
          <View style={styles.actionRow}>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionBtn, isLiked && styles.actionBtnActive]}
                onPress={() => setIsLiked(!isLiked)}
              >
                <Heart
                  color={isLiked ? "#60a5fa" : "#94a3b8"}
                  fill={isLiked ? "#60a5fa" : "none"}
                  size={22}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, isReposted && styles.actionBtnActive]}
                onPress={() => setIsReposted(!isReposted)}
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

            <View style={styles.stats}>
              <View style={styles.stat}>
                <Play color="#94a3b8" size={16} />
                <Text style={styles.statText}>0</Text>
              </View>
              <View style={styles.stat}>
                <Heart color="#94a3b8" size={16} />
                <Text style={styles.statText}>0</Text>
              </View>
              <View style={styles.stat}>
                <Repeat2 color="#94a3b8" size={16} />
                <Text style={styles.statText}>0</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ARTIST CARD */}
        <View style={styles.artistCard}>
          <Image source={track.image} style={styles.artistAvatar} />
          <Text style={styles.artistNameBig}>{track.artist}</Text>
          <View style={styles.artistStats}>
            <View style={styles.artistStat}>
              <Text style={styles.statIcon}>People</Text>
              <Text style={styles.statValue}>0</Text>
            </View>
            <View style={styles.artistStat}>
              <Text style={styles.statIcon}>Music</Text>
              <Text style={styles.statValue}>1</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.followBtn}>
            <Text style={styles.followBtnText}>Follow</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reportBtn}>
            <Text style={styles.reportBtnText}>Report</Text>
          </TouchableOpacity>
        </View>

        {/* COMMENT INPUT */}
        <View style={styles.commentInputCard}>
          <Image source={require("../assets/i1.jpg")} style={styles.userAvatar} />
          <TextInput
            style={styles.commentInput}
            placeholder="Write a comment"
            placeholderTextColor="#64748b"
            value={comment}
            onChangeText={setComment}
          />
          <TouchableOpacity style={styles.sendBtn}>
            <Send color="#94a3b8" size={20} />
          </TouchableOpacity>
        </View>

        {/* COMMENTS SECTION */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comments (0)</Text>
        </View>

        {/* ĐỆM DƯỚI ĐỂ KHÔNG BỊ MINI PLAYER ĐÈ */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// === STYLES – MOBILE 1 CỘT, SẠCH, ĐẸP, KHÔNG ĐÈ ===
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
    backgroundColor: "#0f172a",
    zIndex: 10,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", fontFamily: "DancingScript_700Bold" },

  // COVER ART
  coverArtCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
 coverArt: {
    width: 160,        // GIẢM XUỐNG 160x160
    height: 160,       // KHÔNG CÒN TO ĐÙNG
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#334155",
  },

  // PLAYER CARD
  playerCard: {
    marginHorizontal: 16,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  playerHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 20,
  },
  playBtnBig: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#60a5fa",
    justifyContent: "center",
    alignItems: "center",
  },
  trackInfo: { flex: 1, justifyContent: "center" },
  trackTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  artistName: {
    fontSize: 15,
    color: "#94a3b8",
    marginBottom: 2,
  },
  uploadedAt: {
    fontSize: 13,
    color: "#64748b",
  },

  // WAVEFORM
  waveform: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 60,
    gap: 4,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  waveBar: {
    flex: 1,
    backgroundColor: "#60a5fa",
    borderRadius: 2,
    height: 30,
  },
  waveBarShort: { height: 20 },
  waveBarTall: { height: 50 },

  // ACTION ROW
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 5,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 12,
  },
  actionBtnActive: {
    backgroundColor: "rgba(96,165,250,0.15)",
  },
  stats: {
    flexDirection: "row",
    gap: 16,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: "#94a3b8",
  },

  // ARTIST CARD
  artistCard: {
    marginHorizontal: 16,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  artistAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  artistNameBig: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  artistStats: {
    flexDirection: "row",
    gap: 32,
    marginBottom: 16,
  },
  artistStat: {
    alignItems: "center",
  },
  statIcon: {
    fontSize: 13,
    color: "#94a3b8",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "600",
  },
  followBtn: {
    backgroundColor: "#60a5fa",
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 999,
    width: "80%",
    alignItems: "center",
    marginBottom: 8,
  },
  followBtnText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 15,
  },
  reportBtn: {
    alignItems: "center",
  },
  reportBtnText: {
    color: "#94a3b8",
    fontSize: 13,
  },

  // COMMENT INPUT
  commentInputCard: {
    marginHorizontal: 16,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  commentInput: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    paddingVertical: 6,
  },
  sendBtn: {
    padding: 6,
  },

  // COMMENTS SECTION
  commentsSection: {
    marginHorizontal: 16,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    minHeight: 100,
    marginBottom: 16,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
})
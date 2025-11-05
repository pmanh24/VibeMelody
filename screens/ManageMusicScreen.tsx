"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native"
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Play,
  Search,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import {api} from "../lib/api" // ✅ import axios instance

const I1_IMAGE = require("../assets/i1.jpg")

interface Song {
  _id: string
  title: string
  artist: string
  album: string
  duration: string
  likes: number
  createdAt: string
  coverImage?: string
}

interface Props {
  onBack: () => void
  onUpload: () => void
}

export default function ManageMusicScreen({ onBack, onUpload }: Props) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [songs, setSongs] = useState<Song[]>([])
  const [editingSong, setEditingSong] = useState<Song | null>(null)
  const [editForm, setEditForm] = useState({ title: "", artist: "", album: "" })
  const [loading, setLoading] = useState(true)

  // === FETCH SONGS ===
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await api.get("/media/all")
        setSongs(res.data || [])
      } catch (err) {
        console.error("Lỗi khi tải danh sách nhạc:", err)
        Alert.alert("Lỗi", "Không thể tải danh sách bài hát từ server.")
      } finally {
        setLoading(false)
      }
    }
    fetchSongs()
  }, [])

  // === DELETE SONG ===
  const handleDelete = (id: string) => {
    Alert.alert("Xóa bài hát", "Bạn có chắc chắn muốn xóa bài hát này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/media/songs/${id}`)
            setSongs(prev => prev.filter(s => s._id !== id))
            Alert.alert("Thành công", "Đã xóa bài hát.")
          } catch (err) {
            console.error("Lỗi xóa:", err)
            Alert.alert("Lỗi", "Không thể xóa bài hát.")
          }
        },
      },
    ])
  }

  // === OPEN & SAVE EDIT ===
  const openEdit = (song: Song) => {
    setEditingSong(song)
    setEditForm({ title: song.title, artist: song.artist, album: song.album })
  }

  const saveEdit = async () => {
    if (!editingSong) return
    try {
      await api.patch(`/media/songs/${editingSong._id}`, editForm)
      setSongs(prev =>
        prev.map(s => (s._id === editingSong._id ? { ...s, ...editForm } : s))
      )
      setEditingSong(null)
      Alert.alert("Thành công", "Đã cập nhật bài hát.")
    } catch (err) {
      console.error("Lỗi cập nhật:", err)
      Alert.alert("Lỗi", "Không thể lưu thay đổi.")
    }
  }

  // === SEARCH + PAGINATION ===
  const itemsPerPage = 10
  const filteredSongs = songs.filter(
    s =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.album?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const totalPages = Math.ceil(filteredSongs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentSongs = filteredSongs.slice(startIndex, startIndex + itemsPerPage)

  // === RENDER ===
  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#60a5fa" />
        <Text style={{ color: "#94a3b8", marginTop: 10 }}>Đang tải danh sách nhạc...</Text>
      </SafeAreaView>
    )
  }

  // === GIỮ NGUYÊN PHẦN UI DƯỚI ===
  // (bạn giữ toàn bộ từ header, search, table, modal như cũ – chỉ thay dữ liệu là songs từ backend)
}


// === STYLES – ĐÃ SỬA: KHÔNG TRỐNG TRÊN ĐẦU, BẢNG BẮT ĐẦU NGAY SAU SEARCH ===
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0f172a" },
  container: { flex: 1 },

  // HEADER – SÁT ĐỈNH
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
  title: { fontSize: 20, fontWeight: "bold", color: "#fff", fontFamily: "DancingScript_700Bold" },

  // TOPBAR – KHÔNG CÓ MARGIN TOP LỚN
  topBar: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchContainer: { flex: 1, position: "relative" },
  searchIcon: { position: "absolute", left: 14, top: 14, zIndex: 10 },
  searchInput: {
    backgroundColor: "#1e293b",
    color: "#fff",
    paddingLeft: 44,
    paddingRight: 44,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 15,
  },
  clearBtn: { position: "absolute", right: 14, top: 14, padding: 4 },
  uploadBtn: {
    backgroundColor: "#60a5fa",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  uploadText: { color: "#000", fontWeight: "600", fontSize: 14 },

  // SCROLL + TABLE – BẮT ĐẦU NGAY SAU TOPBAR
  tableScroll: { flex: 1 },
  tableContent: { paddingHorizontal: 16, paddingTop: 8 },

  table: {},

  // TABLE HEADER & ROW
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    marginBottom: 8,
  },

  // CỘT HEADER
  thIndex: { width: 40, color: "#94a3b8", fontSize: 12, fontWeight: "600", textAlign: "center" },
  thTitle: { flex: 2, color: "#94a3b8", fontSize: 12, fontWeight: "600" },
  thAlbum: { flex: 1.2, color: "#94a3b8", fontSize: 12, fontWeight: "600" },
  thDate: { width: 90, color: "#94a3b8", fontSize: 12, fontWeight: "600" },
  thLikes: { width: 70, color: "#94a3b8", fontSize: 12, fontWeight: "600", textAlign: "center" },
  thDuration: { width: 70, color: "#94a3b8", fontSize: 12, fontWeight: "600", textAlign: "center" },
  thActions: { width: 80 },

  // CỘT DỮ LIỆU
  tdIndex: { width: 40, color: "#94a3b8", fontSize: 13.5, textAlign: "center" },
  tdTitle: { flex: 2, flexDirection: "row", alignItems: "center", gap: 10 },
  tdAlbum: { flex: 1.2, color: "#e2e8f0", fontSize: 13.5 },
  tdDate: { width: 90, color: "#94a3b8", fontSize: 13.5 },
  tdLikes: { width: 70, color: "#94a3b8", fontSize: 13.5, textAlign: "center" },
  tdDuration: { width: 70, color: "#94a3b8", fontSize: 13.5, textAlign: "center" },
  tdActions: { width: 80, flexDirection: "row", justifyContent: "flex-end", gap: 12 },

  // ẢNH + CHỮ
  coverWrapper: { position: "relative" },
  cover: { width: 44, height: 44, borderRadius: 8 },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0,
  },
  titleText: { flex: 1 },
  songTitle: { color: "#fff", fontWeight: "600", fontSize: 13.5 },
  songArtist: { color: "#94a3b8", fontSize: 12 },

  actionBtn: { padding: 6 },

  // PAGINATION
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#0f172a",
    marginTop: 8,
  },
  pageInfo: { color: "#94a3b8", fontSize: 13 },
  pageButtons: { flexDirection: "row", alignItems: "center", gap: 6 },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
  },
  navBtnDisabled: { opacity: 0.5 },
  pageBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
  },
  pageBtnActive: { backgroundColor: "#60a5fa" },
  pageText: { color: "#94a3b8", fontSize: 13 },
  pageTextActive: { color: "#000", fontWeight: "600" },

  // MODAL
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: { backgroundColor: "#1e293b", borderRadius: 20, width: "100%", maxWidth: 400 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  modalBody: { padding: 20 },
  inputGroup: { marginBottom: 16 },
  label: { color: "#94a3b8", fontSize: 14, marginBottom: 6 },
  input: {
    backgroundColor: "#0f172a",
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 15,
  },
  fileBtn: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  fileText: { color: "#60a5fa", fontSize: 14 },
  fileNote: { color: "#64748b", fontSize: 12, marginTop: 6 },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  cancelText: { color: "#fff", fontWeight: "600" },
  saveBtn: {
    flex: 1,
    backgroundColor: "#60a5fa",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  saveText: { color: "#000", fontWeight: "600" },
})
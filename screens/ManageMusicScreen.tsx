"use client"

import { useState } from "react"
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

const I1_IMAGE = require("../assets/i1.jpg")

// === DỮ LIỆU MẪU (47 BÀI) ===
const generateMockSongs = () => {
  const songs = []
  for (let i = 0; i < 47; i++) {
    songs.push({
      id: `song-${i + 1}`,
      title: `Song Title ${i + 1}`,
      artist: "Vo Anh Hoang",
      album: i % 3 === 0 ? "Gymv2" : i % 3 === 1 ? "Urban Nights" : "Coastal Dreams",
      duration: `${Math.floor(Math.random() * 3) + 2}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
      likes: Math.floor(Math.random() * 10000),
      uploadDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
        .toLocaleDateString("en-GB")
        .replace(/\//g, "/"),
      cover: I1_IMAGE,
    })
  }
  return songs
}

interface Song {
  id: string
  title: string
  artist: string
  album: string
  duration: string
  likes: number
  uploadDate: string
  cover: any
}

interface Props {
  onBack: () => void
  onUpload: () => void
}

export default function ManageMusicScreen({ onBack, onUpload }: Props) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [songs, setSongs] = useState<Song[]>(generateMockSongs())
  const [editingSong, setEditingSong] = useState<Song | null>(null)
  const [editForm, setEditForm] = useState({ title: "", artist: "", album: "" })

  const itemsPerPage = 10
  const filteredSongs = songs.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.album.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const totalPages = Math.ceil(filteredSongs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentSongs = filteredSongs.slice(startIndex, startIndex + itemsPerPage)

  const handleDelete = (id: string) => {
    Alert.alert(
      "Xóa bài hát",
      "Bạn có chắc chắn muốn xóa bài hát này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => setSongs(prev => prev.filter(s => s.id !== id)),
        },
      ]
    )
  }

  const openEdit = (song: Song) => {
    setEditingSong(song)
    setEditForm({ title: song.title, artist: song.artist, album: song.album })
  }

  const saveEdit = () => {
    if (!editingSong) return
    setSongs(prev =>
      prev.map(s =>
        s.id === editingSong.id
          ? { ...s, title: editForm.title, artist: editForm.artist, album: editForm.album }
          : s
      )
    )
    setEditingSong(null)
  }

  const renderPagination = () => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - 2)
    let end = Math.min(totalPages, start + maxVisible - 1)
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1)

    for (let i = start; i <= end; i++) {
      pages.push(
        <TouchableOpacity
          key={i}
          style={[styles.pageBtn, currentPage === i && styles.pageBtnActive]}
          onPress={() => setCurrentPage(i)}
        >
          <Text style={[styles.pageText, currentPage === i && styles.pageTextActive]}>
            {i}
          </Text>
        </TouchableOpacity>
      )
    }
    return pages
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* HEADER – ĐẨY SÁT ĐỈNH */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft color="#60a5fa" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Quản lý nhạc</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* SEARCH + UPLOAD – KHÔNG CÓ KHOẢNG TRỐNG LỚN */}
        <View style={styles.topBar}>
          <View style={styles.searchContainer}>
            <Search color="#94a3b8" size={20} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm bài hát, album..."
              placeholderTextColor="#64748b"
              value={searchQuery}
              onChangeText={text => {
                setSearchQuery(text)
                setCurrentPage(1)
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity style={styles.clearBtn} onPress={() => setSearchQuery("")}>
                <X color="#94a3b8" size={18} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.uploadBtn} onPress={onUpload}>
            <Upload color="#000" size={18} />
            <Text style={styles.uploadText}>Tải lên</Text>
          </TouchableOpacity>
        </View>

        {/* BẢNG DỮ LIỆU – BẮT ĐẦU NGAY SAU TOPBAR, KHÔNG CÓ KHOẢNG TRỐNG */}
        <ScrollView
          style={styles.tableScroll}
          contentContainerStyle={styles.tableContent}
          showsVerticalScrollIndicator={false}
        >
          {/* TABLE */}
          <View style={styles.table}>
            {/* HEADER */}
            <View style={styles.tableHeader}>
              <Text style={styles.thIndex}>#</Text>
              <Text style={styles.thTitle}>Tiêu đề</Text>
              <Text style={styles.thAlbum}>Album</Text>
              <Text style={styles.thDate}>Ngày</Text>
              <Text style={styles.thLikes}>Lượt thích</Text>
              <Text style={styles.thDuration}>Thời lượng</Text>
              <View style={styles.thActions} />
            </View>

            {/* ROWS */}
            {currentSongs.map((song, idx) => (
              <View key={song.id} style={styles.tableRow}>
                <Text style={styles.tdIndex}>{startIndex + idx + 1}</Text>

                {/* TIÊU ĐỀ + ẢNH */}
                <View style={styles.tdTitle}>
                  <View style={styles.coverWrapper}>
                    <Image source={song.cover} style={styles.cover} />
                    <View style={styles.playOverlay}>
                      <Play color="#fff" size={16} />
                    </View>
                  </View>
                  <View style={styles.titleText}>
                    <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
                    <Text style={styles.songArtist} numberOfLines={1}>{song.artist}</Text>
                  </View>
                </View>

                <Text style={styles.tdAlbum} numberOfLines={1}>{song.album}</Text>
                <Text style={styles.tdDate}>{song.uploadDate}</Text>
                <Text style={styles.tdLikes}>{song.likes.toLocaleString()}</Text>
                <Text style={styles.tdDuration}>{song.duration}</Text>

                <View style={styles.tdActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(song)}>
                    <Edit2 color="#60a5fa" size={18} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(song.id)}>
                    <Trash2 color="#ef4444" size={18} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* PAGINATION – CỐ ĐỊNH DƯỚI */}
          <View style={styles.pagination}>
            <Text style={styles.pageInfo}>
              Hiển thị {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredSongs.length)} trong {filteredSongs.length}
            </Text>
            <View style={styles.pageButtons}>
              <TouchableOpacity
                style={[styles.navBtn, currentPage === 1 && styles.navBtnDisabled]}
                onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft color="#fff" size={18} />
              </TouchableOpacity>
              {renderPagination()}
              <TouchableOpacity
                style={[styles.navBtn, currentPage === totalPages && styles.navBtnDisabled]}
                onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight color="#fff" size={18} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* MODAL */}
      <Modal visible={!!editingSong} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh sửa bài hát</Text>
              <TouchableOpacity onPress={() => setEditingSong(null)}>
                <X color="#fff" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tên bài hát</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.title}
                  onChangeText={t => setEditForm({ ...editForm, title: t })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nghệ sĩ</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.artist}
                  onChangeText={t => setEditForm({ ...editForm, artist: t })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Album</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.album}
                  onChangeText={t => setEditForm({ ...editForm, album: t })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>File nhạc (tùy chọn)</Text>
                <TouchableOpacity style={styles.fileBtn}>
                  <Upload color="#60a5fa" size={18} />
                  <Text style={styles.fileText}>Chọn file mới...</Text>
                </TouchableOpacity>
                <Text style={styles.fileNote}>
                  Để trống để giữ file hiện tại. Hỗ trợ: MP3, WAV, FLAC...
                </Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingSong(null)}>
                <Text style={styles.cancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
                <Text style={styles.saveText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
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
import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ArrowLeft, Plus, Save, Upload, X } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

const { height } = Dimensions.get("window");

interface Track {
  id: string;
  name: string;
  artist: string;
  duration: number;
  image: string;
}

interface Props {
  onBack: () => void;
  onSave?: () => void;
}

export default function CreateAlbumScreen({ onBack, onSave }: Props) {
  const [albumName, setAlbumName] = useState("");
  const [artist, setArtist] = useState("");
  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<any>(null);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [allSongs, setAllSongs] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [songsLoaded, setSongsLoaded] = useState(false);

  // === FETCH SONGS ===
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await fetch("http://192.168.0.101:5000/api/all");
        if (!res.ok) throw new Error(`API lỗi: ${res.status}`);
        const data = await res.json();

        if (!Array.isArray(data)) throw new Error("Dữ liệu không hợp lệ");

        const normalized = data.map((song: any) => ({
          id: song._id,
          name: song.title || song.name || "Unknown",
          artist: song.artist || "Unknown Artist",
          duration: song.duration || 0,
          image: song.imageUrl || "",
        }));

        setAllSongs(normalized);
        setSongsLoaded(true);
      } catch (err: any) {
        console.error("Fetch error:", err);
        Alert.alert("Lỗi mạng", err.message);
      }
    };

    fetchSongs();
  }, []);

  // === FILTER SONGS ===
  const filteredSongs = useMemo(() => {
    return allSongs.filter((s) =>
      (s.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allSongs, searchQuery]);

  // === TOGGLE SELECTION ===
  const toggleSongSelection = (songId: string) => {
    setSelectedSongs((prev) =>
      prev.includes(songId)
        ? prev.filter((id) => id !== songId)
        : [...prev, songId]
    );
  };

  // === ADD SELECTED SONGS ===
  const addSelectedSongs = () => {
    const songsToAdd = allSongs.filter((s) => selectedSongs.includes(s.id));
    const newTracks = [...tracks];

    songsToAdd.forEach((s) => {
      if (!newTracks.some((t) => t.id === s.id)) newTracks.push(s);
    });

    setTracks(newTracks);
    setSelectedSongs([]);
    setSearchQuery("");
  };

  // === REMOVE TRACK ===
  const removeTrack = (id: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
  };

  // === FORMAT TIME ===
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // === PICK IMAGE ===
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission", "Cần quyền truy cập ảnh.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setCoverImage(asset.uri);
      setCoverImageFile(asset);
    }
  };

  // === SAVE ALBUM ===
  const handleSave = async () => {
    if (!albumName || !artist || !title) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ thông tin album.");
      return;
    }
    if (tracks.length === 0) {
      Alert.alert("Thiếu bài hát", "Vui lòng thêm ít nhất 1 bài hát.");
      return;
    }

    setLoading(true);
    const formData = new FormData();

    // 🔹 Dữ liệu đúng chuẩn backend
    formData.append("title", albumName);
    formData.append("artistId", "6709a0a9b0215e74e23e3c5d"); // TODO: thay bằng ID người dùng đăng nhập
    formData.append("artistName", artist);
    formData.append("albumTitle", title); // Thêm title vào formData

    tracks.forEach((t) => formData.append("tracks[]", t.id));

    if (coverImageFile) {
      const fileName = coverImageFile.uri.split("/").pop() || "cover.jpg";
      const fileType = coverImageFile.mimeType || "image/jpeg";
      formData.append("coverImage", {
        uri: coverImageFile.uri,
        name: fileName,
        type: fileType,
      } as any);
    }

    try {
      const res = await fetch("http://192.168.0.101:5000/api/albums", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không thể lưu album");

      Alert.alert("Thành công", "Album đã được tạo!");
      onSave?.();
      onBack();
    } catch (err: any) {
      Alert.alert("Lỗi", err.message);
    } finally {
      setLoading(false);
    }
  };

  // === UI ===
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.container}>
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack}>
              <ArrowLeft color="#60a5fa" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Album</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* ALBUM INFO */}
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Album Information</Text>

            <View style={styles.coverSection}>
              <Text style={styles.label}>Cover Image</Text>
              {coverImage ? (
                <Image source={{ uri: coverImage }} style={styles.coverImage} />
              ) : (
                <View style={styles.coverPlaceholder}>
                  <Upload color="#64748b" size={32} />
                  <Text style={{ color: "#64748b", marginTop: 8 }}>
                    No image
                  </Text>
                </View>
              )}
              <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
                <Text style={styles.uploadText}>
                  {coverImage ? "Change Image" : "Upload Cover"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Album Name</Text>
              <TextInput
                style={styles.input}
                value={albumName}
                onChangeText={setAlbumName}
                placeholder="Enter album name"
                placeholderTextColor="#64748b"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Artist</Text>
              <TextInput
                style={styles.input}
                value={artist}
                onChangeText={setArtist}
                placeholder="Enter artist name"
                placeholderTextColor="#64748b"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Album Title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter album title"
                placeholderTextColor="#64748b"
              />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, loading && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Save color="#000" size={20} />
                  <Text style={styles.saveText}>Save Album</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* TRACK LIST */}
          <View style={styles.trackCard}>
            <Text style={styles.sectionTitle}>
              Track List ({tracks.length})
            </Text>

            {tracks.length === 0 ? (
              <Text style={styles.emptyText}>No tracks yet</Text>
            ) : (
              tracks.map((t) => (
                <View key={t.id} style={styles.trackItem}>
                  {t.image ? (
                    <Image source={{ uri: t.image }} style={styles.trackImg} />
                  ) : (
                    <View style={[styles.trackImg, { backgroundColor: "#334155" }]} />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.trackName}>{t.name}</Text>
                    <Text style={styles.trackArtist}>{t.artist}</Text>
                  </View>
                  <Text style={styles.trackDuration}>
                    {formatDuration(t.duration)}
                  </Text>
                  <TouchableOpacity onPress={() => removeTrack(t.id)}>
                    <X color="#94a3b8" size={18} />
                  </TouchableOpacity>
                </View>
              )) )
            } 
          </View>

          {/* SONGS SECTION */}
          <View style={styles.songCard}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search songs..."
                placeholderTextColor="#64748b"
              />
            </View>

            {!songsLoaded ? (
              <ActivityIndicator color="#60a5fa" style={{ marginVertical: 20 }} />
            ) : filteredSongs.length === 0 ? (
              <Text style={styles.emptyText}>No songs found</Text>
            ) : (
              filteredSongs.map((song) => (
                <TouchableOpacity
                  key={song.id}
                  style={[
                    styles.songItem,
                    selectedSongs.includes(song.id) && styles.songItemSelected,
                  ]}
                  onPress={() => toggleSongSelection(song.id)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      selectedSongs.includes(song.id) && styles.checkboxActive,
                    ]}
                  />
                  {song.image ? (
                    <Image source={{ uri: song.image }} style={styles.songImg} />
                  ) : (
                    <View
                      style={[styles.songImg, { backgroundColor: "#334155" }]}
                    />
                  )}
                  <View style={styles.songInfo}>
                    <Text style={styles.songName}>{song.name}</Text>
                    <Text style={styles.songArtist}>{song.artist}</Text>
                  </View>
                  <Text style={styles.songDuration}>
                    {formatDuration(song.duration)}
                  </Text>
                </TouchableOpacity>
              ))
            )}

            {selectedSongs.length > 0 && (
              <TouchableOpacity style={styles.addBtn} onPress={addSelectedSongs}>
                <Text style={styles.addBtnText}>
                  Add {selectedSongs.length} song
                  {selectedSongs.length > 1 ? "s" : ""}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  headerTitle: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  infoCard: {
    margin: 16,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: { color: "#fff", fontSize: 17, fontWeight: "600" },
  label: { color: "#94a3b8", marginTop: 10, marginBottom: 4 },
  input: {
    backgroundColor: "#0f172a",
    color: "#fff",
    borderRadius: 8,
    padding: 10,
  },
  coverSection: { alignItems: "center", marginVertical: 10 },
  coverImage: { width: 150, height: 150, borderRadius: 12 },
  coverPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 12,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#334155",
    borderStyle: "dashed",
  },
  uploadBtn: {
    backgroundColor: "#1e293b",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 8,
  },
  uploadText: { color: "#60a5fa", fontWeight: "600" },
  formGroup: { marginBottom: 12 },
  saveBtn: {
    flexDirection: "row",
    backgroundColor: "#60a5fa",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    paddingVertical: 12,
  },
  saveText: { color: "#000", fontWeight: "600" },
  trackCard: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
  },
  emptyText: { color: "#64748b", textAlign: "center", marginVertical: 20 },
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 12,
    marginBottom: 8,
    padding: 8,
  },
  trackImg: { width: 40, height: 40, borderRadius: 8, marginRight: 10 },
  trackName: { color: "#fff", fontSize: 14, fontWeight: "600" },
  trackArtist: { color: "#94a3b8", fontSize: 12 },
  trackDuration: { color: "#94a3b8", width: 50, textAlign: "center" },
  songCard: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
  },
  searchContainer: { marginBottom: 10 },
  searchInput: {
    backgroundColor: "#0f172a",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
  },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 12,
    marginBottom: 8,
    padding: 8,
  },
  songItemSelected: {
    borderWidth: 1,
    borderColor: "#60a5fa",
    backgroundColor: "rgba(96,165,250,0.15)",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: "#64748b",
    borderRadius: 5,
    marginRight: 8,
  },
  checkboxActive: { backgroundColor: "#60a5fa", borderColor: "#60a5fa" },
  songImg: { width: 44, height: 44, borderRadius: 8, marginRight: 10 },
  songInfo: { flex: 1 },
  songName: { color: "#fff", fontWeight: "600", fontSize: 14 },
  songArtist: { color: "#94a3b8", fontSize: 12 },
  songDuration: { color: "#94a3b8", width: 50, textAlign: "center" },
  addBtn: {
    backgroundColor: "#60a5fa",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
  },
  addBtnText: { color: "#000", fontWeight: "600" },
});

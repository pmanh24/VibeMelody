// components/MusicUploader.tsx
import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Upload, X } from "lucide-react-native"
import * as DocumentPicker from "expo-document-picker"

interface Track {
  id: string
  name: string
  artist: string
  file: any
}

interface Props {
  onTracksUploaded: (tracks: Track[]) => void
}

export default function MusicUploader({ onTracksUploaded }: Props) {
  const [files, setFiles] = useState<Track[]>([])

  const pickFiles = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "audio/*",
      multiple: true,
    })
    if (result.canceled) return

    const newFiles = result.assets.map((asset: any) => ({
      id: Math.random().toString(),
      name: asset.name.replace(/\.[^/.]+$/, ""),
      artist: "",
      file: asset,
    }))
    setFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const upload = () => {
    onTracksUploaded(files)
    setFiles([])
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.dropzone} onPress={pickFiles}>
        <Upload color="#94a3b8" size={48} />
        <Text style={styles.text}>Chọn file nhạc</Text>
      </TouchableOpacity>

      {files.map(file => (
        <View key={file.id} style={styles.fileItem}>
          <Text style={styles.fileName}>{file.name}</Text>
          <TouchableOpacity onPress={() => removeFile(file.id)}>
            <X color="#ef4444" size={20} />
          </TouchableOpacity>
        </View>
      ))}

      {files.length > 0 && (
        <TouchableOpacity style={styles.uploadBtn} onPress={upload}>
          <Text style={styles.uploadText}>Tải lên {files.length} bài</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  dropzone: {
    borderWidth: 2,
    borderColor: "#334155",
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
  },
  text: { color: "#fff", marginTop: 12 },
  fileItem: { flexDirection: "row", justifyContent: "space-between", padding: 12, backgroundColor: "#1e293b", borderRadius: 12, marginTop: 8 },
  fileName: { color: "#fff" },
  uploadBtn: { backgroundColor: "#60a5fa", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 16 },
  uploadText: { color: "#000", fontWeight: "600" },
})
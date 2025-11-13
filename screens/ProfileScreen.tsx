// screens/ProfileScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Lock,
  Upload,
  UserRound,
  LogOut,
  CheckCircle2,
  Settings,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { api } from "../lib/api";
import { useUserStore } from "../store/useUserStore";

type Props = {
  onBack: () => void;
  onNavigate: (screen: string) => void;
};

export default function ProfileScreen({ onBack, onNavigate }: Props) {
  const { user, logout, setUser } = useUserStore() as any;

  const [activeSection, setActiveSection] = useState<
    "main" | "updateProfile" | "updatePassword" | "registerArtist"
  >("main");

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const [editName, setEditName] = useState("");
  // imagePreview = hiện trên UI (uri local)
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // imageData = base64 hoặc data URL để gửi API
  const [imageData, setImageData] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // Load profile giống web: /me/main
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/me/main");
        const u = data.user || user;
        setProfile(u);
        setEditName(u?.fullName || u?.name || "");
        const img = u?.imageUrl || null;
        setImagePreview(img);
        setImageData(img);
      } catch (e) {
        console.error("❌ Load profile failed:", e);
        setProfile((prev: any) => prev || user);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleLogout = () => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn đăng xuất?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await logout();
          onNavigate("login");
        },
      },
    ]);
  };

  // Chọn ảnh từ máy (logic tương tự handleImageChange bên web nhưng dùng ImagePicker)
  const handlePickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Quyền truy cập", "Cần cho phép truy cập thư viện ảnh.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (result.canceled || !result.assets || !result.assets[0]) return;

      const asset = result.assets[0];
      const uri = asset.uri;
      const base64 = asset.base64;

      // Dùng base64 giống web: data:image/jpeg;base64,...
      const dataUrl = base64 ? `data:image/jpeg;base64,${base64}` : uri;

      setImagePreview(uri);
      setImageData(dataUrl);
    } catch (err) {
      console.error("Pick image error:", err);
      Alert.alert("Lỗi", "Không chọn được ảnh");
    }
  };
  const isArtist = !!profile?.isArtist;

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên hiển thị");
      return;
    }

    try {
      setLoading(true);
      const payload: any = {
        fullName: editName.trim(),
      };
      if (imageData) {
        payload.imageUrl = imageData;
      }

      const { data } = await api.put("/me/profile", payload);

      // Cập nhật local profile
      setProfile((prev: any) =>
        prev
          ? {
              ...prev,
              fullName: data.fullName || prev.fullName,
              imageUrl: data.imageUrl || prev.imageUrl,
            }
          : prev
      );

      // Cập nhật luôn user trong store (nếu có)
      if (setUser) {
        setUser({
          ...(user || {}),
          fullName: data.fullName || user?.fullName,
          imageUrl: data.imageUrl || user?.imageUrl,
        });
      }

      Alert.alert("✅ Thành công", "Cập nhật hồ sơ thành công");
      setActiveSection("main");
    } catch (e: any) {
      console.error("Update profile error:", e);
      Alert.alert(
        "Lỗi",
        e?.response?.data?.message || "Không cập nhật được hồ sơ"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ mật khẩu");
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      Alert.alert("Lỗi", "Mật khẩu mới không khớp");
      return;
    }

    try {
      setLoading(true);
      await api.put("/me/password", {
        currentPassword: passwordForm.current,
        newPassword: passwordForm.new,
      });

      Alert.alert("✅ Thành công", "Đổi mật khẩu thành công");
      setPasswordForm({ current: "", new: "", confirm: "" });
      setActiveSection("main");
    } catch (e: any) {
      console.error("Change password error:", e);
      Alert.alert(
        "Lỗi",
        e?.response?.data?.message || "Không đổi được mật khẩu"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <View style={[styles.safeArea, { justifyContent: "center" }]}>
        <ActivityIndicator color="#60a5fa" size="large" />
      </View>
    );
  }

  const avatarUrl =
    imagePreview ||
    profile?.imageUrl ||
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <ArrowLeft color="#60a5fa" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {activeSection === "main"
              ? "Profile"
              : activeSection === "updateProfile"
              ? "Update Profile"
              : activeSection === "updatePassword"
              ? "Change Password"
              : "Register Artist"}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* MAIN SECTION */}
        {activeSection === "main" && (
          <>
            <View style={styles.avatarBlock}>
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              <Text style={styles.nameText}>
                {profile?.fullName || profile?.name || "User"}
              </Text>
              <Text style={styles.emailText}>
                {profile?.email || "user@example.com"}
              </Text>
            </View>

            <View style={styles.menuBlock}>
              <TouchableOpacity
                style={styles.menuBtn}
                onPress={() => setActiveSection("updateProfile")}
              >
                <UserRound color="#60a5fa" size={20} />
                <Text style={styles.menuText}>Edit Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuBtn}
                onPress={() => setActiveSection("updatePassword")}
              >
                <Lock color="#60a5fa" size={20} />
                <Text style={styles.menuText}>Change Password</Text>
              </TouchableOpacity>

                 {/*  chỉ user thường mới thấy Register Artist */}
              {!isArtist && (
                <TouchableOpacity
                  style={styles.menuBtn}
                  onPress={() => onNavigate("registerArtist")}
                >
                  <Settings color="#60a5fa" size={20} />
                  <Text style={styles.menuText}>Register as Artist</Text>
                </TouchableOpacity>
              )}

              {/* nếu đã là artist -> mở ArtistProfileScreen */}
              {isArtist && (
                <TouchableOpacity
                  style={styles.menuBtn}
                  onPress={() => onNavigate("artistProfile")}
                >
                  <Settings color="#60a5fa" size={20} />
                  <Text style={styles.menuText}>Artist Profile</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <LogOut color="#fff" size={20} />
              <Text style={styles.logoutText}>LOG OUT</Text>
            </TouchableOpacity>
          </>
        )}

        {/* UPDATE PROFILE */}
        {activeSection === "updateProfile" && (
          <View style={styles.formBlock}>
            <TouchableOpacity
              style={styles.backInline}
              onPress={() => setActiveSection("main")}
            >
              <ArrowLeft color="#60a5fa" size={20} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            <Text style={styles.formTitle}>Update Profile</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor="#64748b"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Profile Picture</Text>
              <TouchableOpacity
                style={styles.imagePicker}
                onPress={handlePickImage}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.imagePreview}
                />
                <View style={styles.imagePickerTextWrap}>
                  <Upload color="#60a5fa" size={18} />
                  <Text style={styles.imagePickerText}>
                    Chọn ảnh từ thư viện
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSaveProfile}
              disabled={loading}
            >
              <Upload color="#000" size={18} />
              <Text style={styles.saveText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* CHANGE PASSWORD */}
        {activeSection === "updatePassword" && (
          <View style={styles.formBlock}>
            <TouchableOpacity
              style={styles.backInline}
              onPress={() => setActiveSection("main")}
            >
              <ArrowLeft color="#60a5fa" size={20} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            <Text style={styles.formTitle}>Change Password</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Current Password</Text>
              <TextInput
                value={passwordForm.current}
                onChangeText={(t) =>
                  setPasswordForm((p) => ({ ...p, current: t }))
                }
                style={styles.input}
                secureTextEntry
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                value={passwordForm.new}
                onChangeText={(t) => setPasswordForm((p) => ({ ...p, new: t }))}
                style={styles.input}
                secureTextEntry
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput
                value={passwordForm.confirm}
                onChangeText={(t) =>
                  setPasswordForm((p) => ({ ...p, confirm: t }))
                }
                style={styles.input}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleChangePassword}
              disabled={loading}
            >
              <CheckCircle2 color="#000" size={18} />
              <Text style={styles.saveText}>Update Password</Text>
            </TouchableOpacity>
          </View>
        )}

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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
  avatarBlock: { alignItems: "center", marginTop: 24, marginBottom: 32 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  nameText: { fontSize: 18, fontWeight: "700", color: "#fff", marginTop: 12 },
  emailText: { color: "#94a3b8", fontSize: 13, marginTop: 4 },
  menuBlock: { marginHorizontal: 24, gap: 14 },
  menuBtn: {
    backgroundColor: "#111827",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    gap: 12,
  },
  menuText: { color: "#f1f5f9", fontSize: 15, fontWeight: "600" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#60a5fa",
    marginHorizontal: 24,
    borderRadius: 20,
    paddingVertical: 14,
    marginTop: 28,
    gap: 10,
  },
  logoutText: { color: "#000", fontWeight: "700", fontSize: 15 },
  formBlock: { padding: 24 },
  formTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 12,
  },
  label: { color: "#cbd5e1", marginBottom: 6 },
  input: {
    backgroundColor: "#1e293b",
    color: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
  },
  saveBtn: {
    backgroundColor: "#60a5fa",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  saveText: { color: "#000", fontWeight: "700" },
  backInline: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backText: { color: "#60a5fa", marginLeft: 6 },
  imagePicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 10,
  },
  imagePreview: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  imagePickerTextWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  imagePickerText: {
    color: "#e5e7eb",
    fontSize: 14,
  },
});

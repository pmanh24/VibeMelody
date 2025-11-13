// screens/ArtistProfileScreen.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Share2,
  BadgeCheck,
  Edit2,
  Upload,
  Settings,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { api } from "../lib/api";
import { useUserStore } from "../store/useUserStore";

type Track = {
  _id: string;
  title: string;
  imageUrl?: string;
  likesCount?: number;
};

type Album = {
  _id: string;
  title: string;
  imageUrl?: string;
  releaseYear?: number;
  likesCount?: number;
};

type Props = {
  /** id artist muốn xem (người khác tìm ra) */
  artistId?: string;
  /** artist truyền sẵn từ Home/Search nếu có */
  initialArtist?: any;
  /** nếu có onBack thì show nút back, ngược lại là màn chính từ bottom tab */
  onBack?: () => void;
  /** mở bài hát */
  onOpenTrack?: (songId: string) => void;
  /** mở album */
  onOpenAlbum?: (album: Album) => void;
  onLogout: () => void;
};

export default function ArtistProfileScreen({
  artistId,
  initialArtist,
  onBack,
  onOpenTrack,
  onOpenAlbum,
  onLogout,
}: Props) {
  const { user } = useUserStore() as any;

  const [artist, setArtist] = useState<any>(initialArtist || null);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const id =  user?.id;
  // edit profile modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ name: "", bio: "" });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // change password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);

  // follow state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // artist id thực sự dùng để call API
  const resolvedArtistId = useMemo(() => {
    if (artistId) return artistId;
    if (initialArtist?._id) return initialArtist._id;
    return null;
  }, [artistId, initialArtist]);

  const isOwner = useMemo(() => {
    if (!artist || !user) return false;
    const uid = user._id || user.id;
    return String(uid) === String(artist._id);
  }, [artist, user]);

  // ===== LOAD ARTIST MAIN =====
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);

        const { data } = await api.get(`/artists/${id}/main`);

        if (cancelled) return;

        
        setArtist(data.artist);
        setTopTracks(data.topTracks || []);
        setAlbums(data.topAlbums || []);

        setEditData({
          name: data.artist?.name || "",
          bio: data.artist?.bio || "",
        });
        setImagePreview(data.artist?.avatar || null);
      } catch (err) {
        console.error("Failed to load artist:", err);
        Alert.alert("Lỗi", "Không tải được thông tin artist");
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [resolvedArtistId]);

  // ===== FOLLOW STATUS =====
  useEffect(() => {
    if (!user || isOwner) return;
    const id = resolvedArtistId || artist?._id;
    if (!id) return;

    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`/artists/${id}/follow-status`);
        if (cancelled) return;
        setIsFollowing(!!data.following);
      } catch (err) {
        console.error("Failed to load follow status:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, isOwner, resolvedArtistId, artist?._id]);

  // ===== PICK IMAGE =====
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

      const dataUrl = base64 ? `data:image/jpeg;base64,${base64}` : uri;
      setImagePreview(dataUrl);
    } catch (err) {
      console.error("Pick image error:", err);
      Alert.alert("Lỗi", "Không chọn được ảnh");
    }
  };

  // ===== SAVE ARTIST PROFILE =====
  const handleSaveProfile = async () => {
    if (!editData.name.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên artist");
      return;
    }

    try {
      const payload: any = {
        stageName: editData.name.trim(),
        bio: editData.bio,
      };
      if (imagePreview) payload.imageUrl = imagePreview;

      const { data } = await api.put("/artists/me/profile", payload);
      setArtist((prev: any) =>
        prev
          ? {
              ...prev,
              name: data.name,
              bio: data.bio,
              avatar: data.avatar || prev.avatar,
            }
          : prev
      );
      Alert.alert("Thành công", "Cập nhật hồ sơ artist thành công");
      setShowEditModal(false);
    } catch (err: any) {
      console.error("Update artist profile failed:", err);
      Alert.alert(
        "Lỗi",
        err?.response?.data?.message || "Không cập nhật được hồ sơ"
      );
    }
  };

  // ===== CHANGE PASSWORD =====
  const handleChangePassword = async () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ mật khẩu");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu mới không khớp");
      return;
    }

    try {
      setSavingPassword(true);
      await api.put("/me/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      Alert.alert("Thành công", "Đổi mật khẩu thành công");
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      console.error("Change password failed:", err);
      Alert.alert(
        "Lỗi",
        err?.response?.data?.message || "Không đổi được mật khẩu"
      );
    } finally {
      setSavingPassword(false);
    }
  };

  // ===== FOLLOW / UNFOLLOW =====
  const toggleFollow = async () => {
    const id = artist?._id;
    if (!id) return;

    if (!user) {
      Alert.alert("Thông báo", "Bạn cần đăng nhập để follow artist này");
      return;
    }
    if (followLoading) return;

    setFollowLoading(true);
    const prevFollowing = isFollowing;
    const prevFollowers = artist?.followersCount || 0;

    if (!prevFollowing) {
      // follow
      setIsFollowing(true);
      setArtist((prev: any) =>
        prev
          ? { ...prev, followersCount: (prev.followersCount || 0) + 1 }
          : prev
      );
      try {
        const { data } = await api.post(`/artists/${id}/follow`);
        const count =
          typeof data.followersCount === "number"
            ? data.followersCount
            : prevFollowers + 1;
        setArtist((prev: any) =>
          prev ? { ...prev, followersCount: count } : prev
        );
      } catch (err) {
        console.error("Follow failed:", err);
        setIsFollowing(prevFollowing);
        setArtist((prev: any) =>
          prev ? { ...prev, followersCount: prevFollowers } : prev
        );
      } finally {
        setFollowLoading(false);
      }
    } else {
      // unfollow
      setIsFollowing(false);
      setArtist((prev: any) =>
        prev
          ? {
              ...prev,
              followersCount: Math.max(0, (prev.followersCount || 0) - 1),
            }
          : prev
      );
      try {
        const { data } = await api.delete(`/artists/${id}/follow`);
        const count =
          typeof data.followersCount === "number"
            ? data.followersCount
            : prevFollowers - 1;
        setArtist((prev: any) =>
          prev ? { ...prev, followersCount: Math.max(0, count) } : prev
        );
      } catch (err) {
        console.error("Unfollow failed:", err);
        setIsFollowing(prevFollowing);
        setArtist((prev: any) =>
          prev ? { ...prev, followersCount: prevFollowers } : prev
        );
      } finally {
        setFollowLoading(false);
      }
    }
  };

  if (loading && !artist) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: "center" }]}>
          <ActivityIndicator color="#60a5fa" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (loading && !artist) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.center, { justifyContent: "center" }]}>
          <ActivityIndicator color="#60a5fa" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!artist) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={{ color: "#fff", marginBottom: 12 }}>
            Artist not found
          </Text>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={onLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const avatarSrc =
    artist.avatar ||
    artist.imageUrl ||
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          {onBack ? (
            <TouchableOpacity onPress={onBack}>
              <ArrowLeft color="#60a5fa" size={24} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 24 }} />
          )}
          <Text style={styles.headerTitle}>Artist Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* PROFILE HEADER */}
        <View style={styles.topBlock}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: avatarSrc }} style={styles.avatar} />
            {artist.isVerified && (
              <View style={styles.verifyBadge}>
                <BadgeCheck size={24} color="#0f172a" />
              </View>
            )}
            {isOwner && (
              <TouchableOpacity
                onPress={() => setShowEditModal(true)}
                style={styles.avatarOverlay}
                activeOpacity={0.8}
              >
                <Upload size={24} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.topInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{artist.name}</Text>
              {artist.isVerified && <BadgeCheck size={22} color="#60a5fa" />}
              {isOwner && (
                <TouchableOpacity
                  onPress={() => setShowEditModal(true)}
                  style={styles.iconButton}
                >
                  <Edit2 size={18} color="#cbd5e1" />
                </TouchableOpacity>
              )}
            </View>

            {!!artist.username && (
              <Text style={styles.username}>{artist.username}</Text>
            )}
            {artist.isVerified && (
              <Text style={styles.verifiedText}>Verified Artist</Text>
            )}
            {!!artist.bio && <Text style={styles.bio}>{artist.bio}</Text>}

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {artist.followersCount?.toLocaleString?.() ??
                    artist.followersCount ??
                    0}
                </Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {artist.followingCount || 0}
                </Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{artist.tracksCount || 0}</Text>
                <Text style={styles.statLabel}>Tracks</Text>
              </View>
            </View>

            <View style={styles.actionsRow}>
              {!isOwner && (
                <TouchableOpacity
                  style={styles.followBtn}
                  onPress={toggleFollow}
                  disabled={followLoading}
                >
                  <Text style={styles.followText}>
                    {isFollowing ? "Following" : "Follow"}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.roundBtn}>
                <Share2 size={18} color="#e5e7eb" />
              </TouchableOpacity>

              {isOwner && (
                <TouchableOpacity
                  style={styles.roundBtn}
                  onPress={() => setShowPasswordModal(true)}
                >
                  <Settings size={18} color="#e5e7eb" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* TOP TRACKS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Tracks</Text>
          {topTracks.length === 0 ? (
            <Text style={styles.sectionEmpty}>Chưa có bài hát nổi bật.</Text>
          ) : (
            topTracks.map((track, index) => (
              <TouchableOpacity
                key={track._id}
                style={styles.trackRow}
                activeOpacity={0.8}
                onPress={() => onOpenTrack?.(track._id)}
              >
                <Text style={styles.trackIndex}>{index + 1}</Text>
                <Image
                  source={{
                    uri:
                      track.imageUrl ||
                      artist.avatar ||
                      "https://cdn-icons-png.flaticon.com/512/847/847969.png",
                  }}
                  style={styles.trackImage}
                />
                <View style={styles.trackInfo}>
                  <Text style={styles.trackTitle} numberOfLines={1}>
                    {track.title}
                  </Text>
                  <Text style={styles.trackMeta}>
                    {track.likesCount || 0} likes
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* ALBUMS */}
        <View style={[styles.section, { paddingBottom: 16 }]}>
          <Text style={styles.sectionTitle}>Albums</Text>
          {albums.length === 0 ? (
            <Text style={styles.sectionEmpty}>Chưa có album nổi bật.</Text>
          ) : (
            <View style={styles.albumGrid}>
              {albums.map((al) => (
                <TouchableOpacity
                  key={al._id}
                  style={styles.albumCard}
                  activeOpacity={0.85}
                  onPress={() => onOpenAlbum?.(al)}
                >
                  <Image
                    source={{
                      uri:
                        al.imageUrl ||
                        "https://cdn-icons-png.flaticon.com/512/847/847969.png",
                    }}
                    style={styles.albumImage}
                  />
                  <Text style={styles.albumTitle} numberOfLines={1}>
                    {al.title}
                  </Text>
                  <Text style={styles.albumMeta} numberOfLines={1}>
                    {al.releaseYear
                      ? `${al.releaseYear} • ${al.likesCount || 0} likes`
                      : `${al.likesCount || 0} likes`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* EDIT ARTIST MODAL */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Artist Profile</Text>

            <Text style={styles.modalLabel}>Profile Picture</Text>
            <TouchableOpacity
              style={styles.modalImagePicker}
              onPress={handlePickImage}
              activeOpacity={0.8}
            >
              <Image
                source={{
                  uri:
                    imagePreview ||
                    avatarSrc ||
                    "https://cdn-icons-png.flaticon.com/512/847/847969.png",
                }}
                style={styles.modalAvatarPreview}
              />
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Upload size={18} color="#60a5fa" />
                <Text style={styles.modalImageText}>Chọn ảnh từ thư viện</Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.modalLabel}>Artist Name</Text>
            <TextInput
              value={editData.name}
              onChangeText={(t) =>
                setEditData((prev) => ({ ...prev, name: t }))
              }
              style={styles.modalInput}
              placeholder="Artist name"
              placeholderTextColor="#64748b"
            />

            <Text style={styles.modalLabel}>Bio</Text>
            <TextInput
              value={editData.bio}
              onChangeText={(t) => setEditData((prev) => ({ ...prev, bio: t }))}
              style={[styles.modalInput, { height: 80 }]}
              multiline
              placeholder="Tell your fans about yourself..."
              placeholderTextColor="#64748b"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalPrimary}
                onPress={handleSaveProfile}
              >
                <Text style={styles.modalPrimaryText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSecondary}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.modalSecondaryText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* CHANGE PASSWORD MODAL */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <Text style={styles.modalLabel}>Current Password</Text>
            <TextInput
              value={passwordForm.currentPassword}
              onChangeText={(t) =>
                setPasswordForm((p) => ({
                  ...p,
                  currentPassword: t,
                }))
              }
              style={styles.modalInput}
              secureTextEntry
            />

            <Text style={styles.modalLabel}>New Password</Text>
            <TextInput
              value={passwordForm.newPassword}
              onChangeText={(t) =>
                setPasswordForm((p) => ({ ...p, newPassword: t }))
              }
              style={styles.modalInput}
              secureTextEntry
            />

            <Text style={styles.modalLabel}>Confirm New Password</Text>
            <TextInput
              value={passwordForm.confirmPassword}
              onChangeText={(t) =>
                setPasswordForm((p) => ({
                  ...p,
                  confirmPassword: t,
                }))
              }
              style={styles.modalInput}
              secureTextEntry
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalPrimary}
                onPress={handleChangePassword}
                disabled={savingPassword}
              >
                <Text style={styles.modalPrimaryText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSecondary}
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={styles.modalSecondaryText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0f172a" },
  container: { flex: 1, backgroundColor: "#0f172a" },
  center: {
    flex: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#60a5fa",
  },
  logoutText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 14,
  },
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

  topBlock: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  avatarWrapper: { position: "relative" },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#1e293b",
  },
  verifyBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#60a5fa",
    borderRadius: 999,
    padding: 4,
  },
  avatarOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
  },
  topInfo: { flex: 1 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  name: { fontSize: 26, fontWeight: "800", color: "#fff" },
  username: { color: "#9ca3af", marginBottom: 4 },
  verifiedText: { color: "#60a5fa", fontSize: 12, marginBottom: 4 },
  bio: { color: "#e5e7eb", fontSize: 14, marginBottom: 12 },
  iconButton: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: "#111827",
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginBottom: 12,
  },
  statItem: {},
  statNumber: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
  statLabel: { color: "#9ca3af", fontSize: 12 },

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  followBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#60a5fa",
  },
  followText: { color: "#0b1120", fontWeight: "700", fontSize: 14 },
  roundBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },

  section: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  sectionEmpty: { color: "#9ca3af", fontSize: 13 },

  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#111827",
    marginBottom: 8,
  },
  trackIndex: {
    width: 22,
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 13,
  },
  trackImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 10,
  },
  trackInfo: { flex: 1 },
  trackTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  trackMeta: { color: "#9ca3af", fontSize: 12 },

  albumGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 4,
  },
  albumCard: {
    width: "47%",
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 8,
  },
  albumImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: "#020617",
  },
  albumTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  albumMeta: { color: "#9ca3af", fontSize: 11 },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 18,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  modalLabel: {
    color: "#cbd5e1",
    fontSize: 13,
    marginTop: 8,
    marginBottom: 4,
  },
  modalImagePicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 10,
    gap: 10,
  },
  modalAvatarPreview: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1e293b",
  },
  modalImageText: { color: "#e5e7eb", fontSize: 14 },
  modalInput: {
    backgroundColor: "#020617",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#1f2937",
    fontSize: 14,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  modalPrimary: {
    flex: 1,
    backgroundColor: "#60a5fa",
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
  },
  modalPrimaryText: {
    color: "#020617",
    fontWeight: "700",
  },
  modalSecondary: {
    flex: 1,
    backgroundColor: "transparent",
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  modalSecondaryText: { color: "#e5e7eb", fontWeight: "600" },
});

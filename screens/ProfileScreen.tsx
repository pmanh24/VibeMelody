// ProfileScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  ChevronRight,
  User,
  Mic2,
  Settings as SettingsIcon,
  Lock,
  LogOut,
  BadgePlus,
} from "lucide-react-native";
import { useUserStore } from "../store/useUserStore";

type Props = {
  onBack: () => void;
  onNavigate: (screen: string) => void; // bạn map sang screen thực tế ở App.tsx
};

export default function ProfileScreen({ onBack, onNavigate }: Props) {
  const items = [
    { label: "Account", onPress: () => onNavigate("account") },
    { label: "Profile", onPress: () => onNavigate("profile") },
    { label: "Artist Profile", onPress: () => onNavigate("artistProfile") },
    { label: "Settings", onPress: () => onNavigate("settings") },
    { label: "Change Password", onPress: () => onNavigate("changePassword") },
    {
      label: "Register as Artist",
      onPress: () => onNavigate("registerArtist"),
    },
  ];
  const {logout} = useUserStore();

  const onLogout = () => {
    Alert.alert("Xác nhận", "Bạn muốn đăng xuất?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => {logout() ,onNavigate("authLogin")},
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft color="#60a5fa" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.menuBlock}>
          {items.map((it) => (
            <TouchableOpacity
              key={it.label}
              onPress={it.onPress}
              style={styles.menuItem}
              activeOpacity={0.8}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconWrap}>
                  {/* đổi icon theo label nếu muốn */}
                  <User color="#60a5fa" size={18} />
                </View>
                <Text style={styles.menuText}>{it.label}</Text>
              </View>
              <ChevronRight color="#94a3b8" size={18} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.logoutItem}
          onPress={onLogout}
          activeOpacity={0.9}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.iconWrap, { backgroundColor: "#2a0e12" }]}>
              <LogOut color="#ef4444" size={18} />
            </View>
            <Text style={[styles.menuText, { color: "#ef4444" }]}>Logout</Text>
          </View>
          <ChevronRight color="#ef4444" size={18} />
        </TouchableOpacity>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  backButton: { padding: 4 },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "DancingScript_700Bold",
  },
  menuBlock: { marginTop: 16, marginHorizontal: 12 },
  menuItem: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 8,
  },
  menuLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#0b1220",
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: { color: "#e5e7eb", fontSize: 15, fontWeight: "600" },
  logoutItem: {
    margin: 12,
    backgroundColor: "#1b0f12",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3b0f14",
  },
});

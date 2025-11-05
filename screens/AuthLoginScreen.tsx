// screens/AuthLoginScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useUserStore } from "../store/useUserStore";

type Props = {
  onBack: () => void;
  onSignup: () => void;
  onSuccess: () => void;
};

export default function AuthLoginScreen({ onBack, onSignup, onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const loading = useUserStore((s) => s.loading);
  const login = useUserStore((s) => s.login);

  const handleLogin = async () => {
    await login(email.trim(), pw);
    const user = useUserStore.getState().user;
    if (user) onSuccess();
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Đăng nhập</Text>
      <TextInput style={styles.inp} placeholder="Email" placeholderTextColor="#64748b" value={email} onChangeText={setEmail} />
      <TextInput style={styles.inp} placeholder="Password" placeholderTextColor="#64748b" value={pw} onChangeText={setPw} secureTextEntry />
      <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator /> : <Text style={styles.btnTxt}>Tiếp tục</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={{ marginTop: 12 }} onPress={onSignup}>
        <Text style={{ color: "#60a5fa" }}>Tạo tài khoản mới</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{ marginTop: 12 }} onPress={onBack}>
        <Text style={{ color: "#94a3b8" }}>Quay lại</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#0f172a", padding: 16, justifyContent: "center" },
  title: { color: "#fff", fontSize: 22, fontWeight: "700", marginBottom: 16 },
  inp: {
    backgroundColor: "#111827",
    color: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  btn: { backgroundColor: "#22c55e", paddingVertical: 14, borderRadius: 12, alignItems: "center", marginTop: 8 },
  btnTxt: { color: "#052e16", fontWeight: "800" },
});

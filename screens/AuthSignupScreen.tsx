// screens/AuthSignupScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useUserStore } from "../store/useUserStore";

type Props = {
  onBack: () => void;
  onLogin: () => void;
  onSuccess: () => void;
};

export default function AuthSignupScreen({ onBack, onLogin, onSuccess }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const loading = useUserStore((s) => s.loading);
  const signup = useUserStore((s) => s.signup);

  const handleSignup = async () => {
    console.log('signup')
   const res = await signup({ fullName: fullName.trim(), email: email.trim(), password: pw, confirmPassword: pw2 });
   const user = useUserStore.getState().user;
    if (user) onSuccess();
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Tạo tài khoản</Text>
      <TextInput style={styles.inp} placeholder="Họ tên" placeholderTextColor="#64748b" value={fullName} onChangeText={setFullName} />
      <TextInput style={styles.inp} placeholder="Email" placeholderTextColor="#64748b" value={email} onChangeText={setEmail} />
      <TextInput style={styles.inp} placeholder="Password" placeholderTextColor="#64748b" value={pw} onChangeText={setPw} secureTextEntry />
      <TextInput style={styles.inp} placeholder="Confirm password" placeholderTextColor="#64748b" value={pw2} onChangeText={setPw2} secureTextEntry />
      <TouchableOpacity style={styles.btn} onPress={handleSignup} disabled={loading}>
        {loading ? <ActivityIndicator /> : <Text style={styles.btnTxt}>Đăng ký</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={{ marginTop: 12 }} onPress={onLogin}>
        <Text style={{ color: "#60a5fa" }}>Đã có tài khoản? Đăng nhập</Text>
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
  btn: { backgroundColor: "#60a5fa", paddingVertical: 14, borderRadius: 12, alignItems: "center", marginTop: 8 },
  btnTxt: { color: "#000", fontWeight: "800" },
});

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { useUserStore } from "../store/useUserStore";

type Props = {
  onBack: () => void;
  onSignup: () => void;
  onSuccess: () => void;
};

export default function AuthLoginScreen({
  onBack,
  onSignup,
  onSuccess,
}: Props) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const loading = useUserStore((s) => s.loading);
  const login = useUserStore((s) => s.login);

  const handleLogin = async () => {
    await login(email, pw);
    const user = useUserStore.getState().user;
    if (user) onSuccess();
  };

  return (
    <View style={styles.wrap}>
      {/* HEADER */}
      <Text style={styles.appName}>Vibe Melody</Text>
      <Text style={styles.subtitle}>Welcome back! Please login to continue.</Text>

      {/* FORM */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Login</Text>

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.inp}
          placeholder="Enter your email"
          placeholderTextColor="#64748b"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.passWrap}>
          <TextInput
            style={[styles.inp, { flex: 1, marginBottom: 0 }]}
            placeholder="Enter your password"
            placeholderTextColor="#64748b"
            value={pw}
            onChangeText={setPw}
            secureTextEntry={!showPw}
          />
          <TouchableOpacity
            onPress={() => setShowPw(!showPw)}
            style={styles.eyeBtn}
          >
            {showPw ? (
              <EyeOff color="#94a3b8" size={20} />
            ) : (
              <Eye color="#94a3b8" size={20} />
            )}
          </TouchableOpacity>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.8 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#052e16" />
          ) : (
            <Text style={styles.btnTxt}>Login</Text>
          )}
        </TouchableOpacity>

        {/* Signup link */}
        <TouchableOpacity style={{ marginTop: 16 }} onPress={onSignup}>
          <Text style={styles.linkPrimary}>Don’t have an account? Sign up</Text>
        </TouchableOpacity>

        {/* Back */}
        <TouchableOpacity style={{ marginTop: 10 }} onPress={onBack}>
          <Text style={styles.linkMuted}>Go back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 20,
    justifyContent: "center",
  },
  appName: {
    color: "#60a5fa",
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 30,
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },
  label: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 6,
  },
  inp: {
    backgroundColor: "#111827",
    color: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  passWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  eyeBtn: {
    paddingHorizontal: 10,
  },
  btn: {
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  btnTxt: {
    color: "#052e16",
    fontWeight: "800",
    fontSize: 16,
  },
  linkPrimary: {
    color: "#60a5fa",
    textAlign: "center",
    fontWeight: "600",
  },
  linkMuted: {
    color: "#94a3b8",
    textAlign: "center",
  },
});

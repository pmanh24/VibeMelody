import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { CheckCircle } from "lucide-react-native";
import { useUserStore } from "../store/useUserStore";
import { api } from "../lib/api";
import Toast from "react-native-toast-message";

export default function PaymentSuccessScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const orderCode = (route.params as { orderCode?: string })?.orderCode;
  const { logout} = useUserStore();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderCode) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/payos/status/${orderCode}`);
        if (cancelled) return;

        console.log("Payment status:", data);
      } catch (err) {
        console.error("Check payment status failed:", err);
        Toast.show({ type: "error", text1: `Không kiểm tra được trạng thái thanh toán` });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderCode]);

  const handleLogout = async () => {
    await logout();
    navigation.navigate("Login" as never);
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <CheckCircle size={96} color="#4f46e5" />
      </View>

      <Text style={styles.title}>Payment Successful!</Text>
      <Text style={styles.subtitle}>
        Your payment has been processed successfully. Thank you for your purchase.
      </Text>

      {orderCode && (
        <Text style={styles.orderCode}>
          Order code: <Text style={styles.mono}>{orderCode}</Text>
        </Text>
      )}

      {loading && <ActivityIndicator size="small" color="#666" />}

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("Home" as never)}>
          <Text style={styles.buttonText}>Go to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.outlineButton} onPress={handleLogout}>
          <Text style={styles.outlineButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", backgroundColor: "#fff" },
  iconContainer: { alignItems: "center", marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#666", textAlign: "center", marginBottom: 16 },
  orderCode: { fontSize: 12, color: "#666", textAlign: "center", marginBottom: 12 },
  mono: { fontFamily: "monospace" },
  buttonGroup: { marginTop: 16 },
  primaryButton: {
    backgroundColor: "#4f46e5",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#4f46e5",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  outlineButtonText: { color: "#4f46e5", fontWeight: "600" },
});

// screens/RegisterArtistScreen.tsx
"use client";

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Check } from "lucide-react-native";

// ✅ PayOS in-app WebView + API
import PayOSWebViewModal from "../components/PayOSWebViewModal";
import { payosCreatePayment, payosGetStatus } from "../api/payos.api";

type PlanKey = "1m" | "3m" | "6m";

type Plan = {
  key: PlanKey;
  title: string;
  price: string;     // hiển thị
  per: string;       // “/ 1 month”, “/ 3 months”, ...
  badge?: "Most Popular" | "Best Value";
  note?: string;     // “Save 0%”, …
  features: string[];
};

const PLANS: Plan[] = [
  {
    key: "1m",
    title: "1 Month",
    price: "60.000đ",
    per: "/ 1 month",
    features: [
      "Upload unlimited songs",
      "Create albums",
      "Analytics dashboard",
      "Artist verification badge",
    ],
  },
  {
    key: "3m",
    title: "3 Months",
    price: "180.000đ",
    per: "/ 3 months",
    badge: "Most Popular",
    note: "Save 0%",
    features: [
      "Upload unlimited songs",
      "Create albums",
      "Analytics dashboard",
      "Artist verification badge",
      "Priority support",
    ],
  },
  {
    key: "6m",
    title: "6 Months",
    price: "360.000đ",
    per: "/ 6 months",
    badge: "Best Value",
    features: [
      "Upload unlimited songs",
      "Create albums",
      "Analytics dashboard",
      "Artist verification badge",
      "Priority support",
      "Featured artist placement",
    ],
  },
];

type Props = {
  onBack: () => void;
  onSubscribe?: (plan: Plan) => void; // callback khi nhấn CTA (tuỳ chọn)
};

export default function RegisterArtistScreen({ onBack, onSubscribe }: Props) {
  const [selected, setSelected] = useState<PlanKey>("3m");

  // ===== PayOS in-app (WebView) =====
  const [payVisible, setPayVisible] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<number | null>(null);

  // Deep link scheme để PayOS redirect
  const RETURN_SCHEME = "myapp://payos/return";
  const CANCEL_SCHEME = "myapp://payos/cancel";

  // mapping giá trị số để gửi lên backend
  const priceByPlan: Record<PlanKey, number> = {
    "1m": 60000,
    "3m": 180000,
    "6m": 360000,
  };

  const handleSubscribe = async () => {
    const plan = PLANS.find((p) => p.key === selected)!;

    try {
      // orderCode duy nhất
      const orderCode = Date.now();
      setCurrentOrder(orderCode);

      // gọi backend để tạo link thanh toán
      const payload = {
        orderCode,
        amount: priceByPlan[selected],
        description: `Artist ${plan.title}`,
        returnUrl: RETURN_SCHEME,
        cancelUrl: CANCEL_SCHEME,
      };

      const res = await payosCreatePayment(payload);
      console.log('res', res);
      // Backend trả về { checkoutUrl, ... }
      
      if (!res?.data.checkoutUrl) {
        
        throw new Error("Thiếu checkoutUrl từ backend");
      }

      setCheckoutUrl(res.data.checkoutUrl);
      setPayVisible(true);

      // callback tuỳ chọn của bạn
      onSubscribe?.(plan);
    } catch (e: any) {
      Alert.alert("Lỗi", e?.message ?? "Không tạo được link thanh toán");
    }
  };

  // Khi PayOS redirect về returnUrl (đã bị intercept trong WebView)
  const handleReturn = async (_returnUrl: string) => {
    try {
      if (!currentOrder) return;
      const statusRes = await payosGetStatus(currentOrder);
      // tuỳ response backend, ví dụ { data: { status: "PAID" | "PENDING" | ... } }
      const s =
        statusRes?.data?.status ??
        statusRes?.status ??
        statusRes?.data?.payment?.status ??
        "UNKNOWN";

      const upper = String(s).toUpperCase();
      if (upper === "PAID" || upper === "SUCCESS") {
        Alert.alert("Thành công", "Thanh toán thành công. Bạn đã trở thành Artist!");
        // TODO: cập nhật quyền/role ở client hoặc refetch profile
      } else {
        Alert.alert("Trạng thái", `Kết quả: ${s}`);
      }
    } catch (e: any) {
      Alert.alert("Lỗi", e?.message ?? "Không kiểm tra được trạng thái thanh toán");
    } finally {
      setPayVisible(false);
    }
  };

  // Khi PayOS redirect về cancelUrl
  const handleCancel = (_cancelUrl: string) => {
    setPayVisible(false);
    Alert.alert("Đã huỷ", "Bạn đã huỷ thanh toán.");
  };

  // ===== UI =====
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft color="#60a5fa" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Become an Artist</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* SUBTITLE */}
        <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
          <Text style={styles.subtitle}>
            Choose your subscription plan and start sharing your music
          </Text>
        </View>

        {/* PLANS */}
        <View style={styles.cardsRow}>
          {PLANS.map((plan) => {
            const isActive = selected === plan.key;
            return (
              <TouchableOpacity
                key={plan.key}
                activeOpacity={0.9}
                onPress={() => setSelected(plan.key)}
                style={[styles.card, isActive && styles.cardActive]}
              >
                {/* Badge */}
                {!!plan.badge && (
                  <View
                    style={[
                      styles.badge,
                      plan.badge === "Most Popular"
                        ? styles.badgePopular
                        : styles.badgeValue,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        plan.badge === "Best Value" && { color: "#a7f3d0" },
                      ]}
                    >
                      {plan.badge}
                    </Text>
                  </View>
                )}

                <Text style={styles.cardTitle}>{plan.title}</Text>
                <Text style={styles.price}>
                  {plan.price}
                  <Text style={styles.per}> {plan.per}</Text>
                </Text>

                {!!plan.note && <Text style={styles.saving}>{plan.note}</Text>}

                {/* Feature list */}
                <View style={{ marginTop: 12, gap: 8 }}>
                  {plan.features.map((f, idx) => (
                    <View key={idx} style={styles.featureRow}>
                      <Check size={16} color="#22c55e" />
                      <Text style={styles.featureText}>{f}</Text>
                    </View>
                  ))}
                </View>

                {/* Radio */}
                <View style={styles.radioWrap}>
                  <View
                    style={[styles.radio, isActive && styles.radioActive]}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* WHAT YOU'LL GET */}
        <View style={styles.benefitBox}>
          <Text style={styles.benefitTitle}>What you'll get:</Text>
          <Text style={styles.benefitItem}>
            • Unlimited music uploads and album creation
          </Text>
          <Text style={styles.benefitItem}>
            • Artist verification badge on your profile
          </Text>
          <Text style={styles.benefitItem}>
            • Access to detailed analytics and insights
          </Text>
          <Text style={styles.benefitItem}>
            • Connect with fans and grow your audience
          </Text>
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.cta} onPress={handleSubscribe}>
          <Text style={styles.ctaText}>Subscribe & Become an Artist</Text>
        </TouchableOpacity>

        {/* Terms */}
        <View
          style={{ paddingHorizontal: 20, marginTop: 10, marginBottom: 30 }}
        >
          <Text style={styles.terms}>
            By subscribing, you agree to our Terms of Service and Artist
            Agreement
          </Text>
        </View>
      </ScrollView>

      {/* ✅ In-app PayOS WebView */}
      {checkoutUrl && (
        <PayOSWebViewModal
          visible={payVisible}
          checkoutUrl={checkoutUrl}
          returnScheme={RETURN_SCHEME}
          cancelScheme={CANCEL_SCHEME}
          onClose={() => setPayVisible(false)}
          onReturn={handleReturn}
          onCancel={handleCancel}
        />
      )}
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
  title: { fontSize: 22, fontWeight: "800", color: "#fff" },
  subtitle: { color: "#94a3b8", fontSize: 14 },

  cardsRow: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },

  card: {
    backgroundColor: "#111827",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  cardActive: {
    borderColor: "#22c55e",
    shadowColor: "#22c55e",
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  badgePopular: {
    backgroundColor: "rgba(34,197,94,0.15)",
    borderWidth: 1,
    borderColor: "#22c55e",
  },
  badgeValue: {
    backgroundColor: "rgba(34,197,94,0.06)",
    borderWidth: 1,
    borderColor: "#10b981",
  },
  badgeText: { fontSize: 12, color: "#22c55e", fontWeight: "700" },

  cardTitle: { color: "#e5e7eb", fontSize: 16, fontWeight: "700" },
  price: { color: "#fff", fontSize: 24, fontWeight: "800", marginTop: 6 },
  per: { color: "#9ca3af", fontSize: 13, fontWeight: "600" },
  saving: { color: "#22c55e", fontSize: 12, fontWeight: "700", marginTop: 4 },

  featureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureText: { color: "#cbd5e1", fontSize: 14 },

  radioWrap: { marginTop: 16, alignItems: "flex-end" },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#334155",
  },
  radioActive: { borderColor: "#22c55e", backgroundColor: "#22c55e" },

  benefitBox: {
    backgroundColor: "#0b1220",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
  },
  benefitTitle: {
    color: "#e5e7eb",
    fontWeight: "800",
    fontSize: 14,
    marginBottom: 6,
  },
  benefitItem: { color: "#94a3b8", fontSize: 13, marginVertical: 2 },

  cta: {
    backgroundColor: "#22c55e",
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  ctaText: { color: "#052e16", fontWeight: "800", fontSize: 16 },

  terms: { color: "#64748b", fontSize: 12, textAlign: "center" },
});

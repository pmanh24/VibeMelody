import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { XCircle } from "lucide-react-native";

export default function PaymentFailedScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const orderCode = (route.params as { orderCode?: string })?.orderCode;

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <XCircle size={96} color="red" />
      </View>

      <Text style={styles.title}>Payment Failed</Text>
      <Text style={styles.subtitle}>
        Unfortunately, your payment could not be processed. Please try again or contact support.
      </Text>

      {orderCode && (
        <Text style={styles.orderCode}>
          Order code: <Text style={styles.mono}>{orderCode}</Text>
        </Text>
      )}

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.outlineButton} onPress={() => navigation.navigate("Home" as never)}>
          <Text style={styles.outlineButtonText}>Go to Home</Text>
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

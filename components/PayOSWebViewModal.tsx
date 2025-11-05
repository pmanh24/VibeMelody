// src/components/PayOSWebViewModal.tsx
import React, { useCallback, useRef, useState } from "react";
import { Modal, View, ActivityIndicator, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

type Props = {
  visible: boolean;
  checkoutUrl: string;
  returnScheme: string;   // "myapp://payos/return"
  cancelScheme: string;   // "myapp://payos/cancel"
  onClose: () => void;
  onReturn: (returnUrl: string) => void;   // khi payment xong
  onCancel: (cancelUrl: string) => void;   // khi cancel
};

export default function PayOSWebViewModal({
  visible,
  checkoutUrl,
  returnScheme,
  cancelScheme,
  onClose,
  onReturn,
  onCancel,
}: Props) {
  const [loading, setLoading] = useState(true);
  const webviewRef = useRef<WebView>(null);

  // Chặn deep link ngay trong WebView để không bật browser
  const shouldStart = useCallback((req: any) => {
    const url = req?.url ?? "";
    if (url.startsWith(returnScheme)) {
      onReturn(url);
      onClose();
      return false;
    }
    if (url.startsWith(cancelScheme)) {
      onCancel(url);
      onClose();
      return false;
    }
    return true;
  }, [onReturn, onCancel, onClose, returnScheme, cancelScheme]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.wrap}>
        {loading && (
          <View style={styles.loading}>
            <ActivityIndicator />
          </View>
        )}
        <WebView
          ref={webviewRef}
          source={{ uri: checkoutUrl }}
          onLoadEnd={() => setLoading(false)}
          onShouldStartLoadWithRequest={shouldStart}
          startInLoadingState
          javaScriptEnabled
          domStorageEnabled
          // quan trọng cho Android để intercept deep link
          originWhitelist={["*"]}
          // nếu PayOS dùng redirect http→https, nên để mixedContentMode
          mixedContentMode="always"
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "black" },
  loading: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center", justifyContent: "center", zIndex: 10 },
});

// lib/socket.ts
import { io, Socket } from "socket.io-client";
import { Platform } from "react-native";

// ⚠️ Dùng đúng IP backend của bạn
const SERVER_URL =
  Platform.OS === "android"
    ? "http://192.168.0.100:5000" // Android emulator
    : "http://127.0.0.1:5000"; // iOS simulator

export const createSocket = (userId: string): Socket => {
  return io(SERVER_URL, {
    transports: ["websocket"],
    autoConnect: false,
    query: { userId },
  });
};

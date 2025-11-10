import axios from "axios";
import { Platform } from "react-native";

const baseURL =
  Platform.OS === "android"
    ? "http://192.168.0.100:5000/api"
    : "http://192.168.0.100:5000/api"; // nếu iPhone thật, vẫn dùng IP LAN

export const api = axios.create({
  baseURL,
  timeout: 10000,
});

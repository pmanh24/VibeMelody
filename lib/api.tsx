import axios from "axios";
import { Platform } from "react-native";

const baseURL =
  Platform.OS === "android"
    ? "http://10.0.2.2:5000/api"
    : "http://192.168.0.103:5000/api"; // nếu iPhone thật, vẫn dùng IP LAN
export const link = "http://192.168.0.103:5000/api"
export const api = axios.create({
  baseURL,
  timeout: 10000,
});

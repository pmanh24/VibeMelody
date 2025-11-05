import axios from "axios";
import { Platform } from "react-native";

const baseURL =
  Platform.OS === "android"
    ? "http://10.0.2.2:5000/api"
    : "http://10.33.64.38:5000/api"; // nếu iPhone thật, vẫn dùng IP LAN

export const api = axios.create({
  baseURL,
  timeout: 10000,
});

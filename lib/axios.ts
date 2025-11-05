// lib/axios.ts
import axios from "axios";
import { getAccessToken } from "../services/token";

const api = axios.create({
  baseURL: "http://192.168.0.103:5000/api", // ⚠️ Android emulator: 10.0.2.2; iOS simulator: http://localhost:3005
  headers: { Accept: "application/json", "Content-Type": "application/json" },
  timeout: 15000,
});

// Gắn token trước mỗi request
api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  console.log('Attaching token to request:', token);
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  } else if (config.headers && "Authorization" in config.headers) {
    delete (config.headers as any).Authorization;
  }
  return config;
});

export default api;

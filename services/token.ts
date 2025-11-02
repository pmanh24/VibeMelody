// services/token.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../lib/axios";

const ACCESS_KEY = "vm_access_token";
const REFRESH_KEY = "vm_refresh_token";

export async function setTokens(access: string, refresh?: string) {
  await AsyncStorage.multiSet([
    [ACCESS_KEY, access],
    [REFRESH_KEY, refresh ?? ""],
  ]);
  // cập nhật axios header ngay
  api.defaults.headers.common.Authorization = `Bearer ${access}`;
}

export async function getAccessToken(): Promise<string | null> {
  const v = await AsyncStorage.getItem(ACCESS_KEY);
  return v || null;
}

export async function clearTokens(): Promise<void> {
  await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY]);
  // xoá luôn header để không dùng token cũ trong memory
  delete api.defaults.headers.common.Authorization;
}

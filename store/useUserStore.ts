// store/useUserStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../lib/axios";
import { setTokens, clearTokens, getAccessToken } from "../services/token";
import { Alert } from "react-native";

type User = {
  id: string;
  fullName: string;
  email: string;
  imageUrl?: string | null;
  isArtist?: boolean;
};

type State = {
  user: User | null;
  loading: boolean;
  checkingAuth: boolean;
};

type Actions = {
  setUser: (u: User | null) => void;
  signup: (args: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forceLogout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  reset: () => Promise<void>;
};

export const useUserStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      checkingAuth: false, // tránh "màn đen" nếu backend chưa chạy

      setUser: (u) => set({ user: u }),

      signup: async ({ fullName, email, password, confirmPassword }) => {
        if (password !== confirmPassword) {
          Alert.alert("Lỗi", "Passwords do not match");
          return;
        }
        set({ loading: true });
        try {
          const { data } = await api.post("/auth/signup", {
            fullName,
            email,
            password,
          });
          await setTokens(data.accessToken, data.refreshToken);
          set({ user: data.user, loading: false });
        } catch (e: any) {
          set({ loading: false });
          Alert.alert("Lỗi", e?.response?.data?.message ?? "Signup failed");
        }
      },

      login: async (email, password) => {
        set({ loading: true });
        try {
          const { data } = await api.post("/auth/login", { email, password });
          await setTokens(data.accessToken, data.refreshToken);
          set({ user: data.user, loading: false });
        } catch (e: any) {
          set({ loading: false });
          Alert.alert("Lỗi", e?.response?.data?.message ?? "Login failed");
        }
      },

      logout: async () => {
        // 1) Xoá token + state ngay (không chờ server)
        await clearTokens();
        set({ user: null });

        // 2) Gọi API logout không block UI
        try {
          await api.post("/auth/logout");
        } catch (e: any) {
          console.warn("Logout API failed:", e?.response?.data ?? e.message);
        }
      },

      // ✅ đổi sang async và await clearTokens để chắc chắn header/AsyncStorage được xoá
      forceLogout: async () => {
        try {
          await clearTokens();
        } finally {
          set({ user: null });
        }
      },

      checkAuth: async () => {
        // Tránh gọi chồng nhau
        if (get().checkingAuth) return;

        set({ checkingAuth: true });
        try {
          const access = await getAccessToken();
          if (!access) {
            set({ user: null, checkingAuth: false });
            return;
          }

          const { data } = await api.get("/auth/profile");
          set({ user: data, checkingAuth: false });
        } catch (e) {
          // backend tắt/401/timeout → coi như chưa đăng nhập
          await clearTokens().catch(() => {});
          set({ user: null, checkingAuth: false });
        }
      },

      // tiện debug: xoá sạch cả token + user
      reset: async () => {
        await clearTokens().catch(() => {});
        set({ user: null, loading: false, checkingAuth: false });
      },
    }),
    {
      name: "vm-auth",
      storage: createJSONStorage(() => AsyncStorage),
      // chỉ persist user; không lưu các flag loading/checking
      partialize: (s) => ({ user: s.user }),
    }
  )
);

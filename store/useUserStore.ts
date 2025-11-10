// store/useUserStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {api} from "../lib/api";
import { setTokens, clearTokens, getAccessToken } from "../services/token";
import { Alert } from "react-native";

export type User = {
  id: string;
  _id?: string;          // phòng khi BE trả _id
  fullName: string;
  email: string;
  imageUrl?: string | null;
  isArtist?: boolean;
};

type State = {
  user: User | null;
  loading: boolean;
  checkingAuth: boolean;
  isArtist: boolean;
};

type SignupArgs = {
  name: string;              // từ form register
  email: string;
  password: string;
  confirmPassword: string;
};

type Actions = {
  setUser: (u: User | null) => void;
  signup: (args: SignupArgs) => Promise<void>;
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
      checkingAuth: false,
      isArtist: false,

      setUser: (u) =>
        set({
          user: u,
          isArtist: !!(u && u.isArtist === true),
        }),

      // ⚙️ SIGNUP
      signup: async ({ name, email, password, confirmPassword }) => {
        if (!name || !email || !password || !confirmPassword) {
          Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
          return;
        }
        if (password !== confirmPassword) {
          Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
          return;
        }

        set({ loading: true });

        try {
          // BE yêu cầu fullName
          const { data } = await api.post("/auth/signup", {
            fullName: name,
            email,
            password,
          });

          const { user, accessToken, refreshToken } = data || {};

          if (!user) {
            throw new Error("Signup response invalid");
          }

          if (accessToken) {
            await setTokens(accessToken, refreshToken);
            api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
          }

          set({
            user,
            loading: false,
            isArtist: !!(user && user.isArtist === true),
          });
        } catch (e: any) {
          console.error("Signup error:", e?.response?.data || e);
          set({ loading: false });
          Alert.alert(
            "Lỗi",
            e?.response?.data?.message || "Đăng ký thất bại"
          );
        }
      },

      // ⚙️ LOGIN
      login: async (email, password) => {
        if (!email || !password) {
          Alert.alert("Lỗi", "Vui lòng nhập email và mật khẩu");
          return;
        }

        set({ loading: true });
        try {
          const { data } = await api.post("/auth/login", { email, password });

          if (!data || !data.user) {
            throw new Error("Invalid login response");
          }

          const { user, accessToken, refreshToken } = data;

          if (accessToken) {
            await setTokens(accessToken, refreshToken);
            api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
          }

          set({
            user,
            loading: false,
            isArtist: !!(user && user.isArtist === true),
          });
        } catch (e: any) {
          console.error("Login error:", e?.response?.data || e);
          set({ loading: false });
          await clearTokens().catch(() => {});
          set({ user: null, isArtist: false });
          Alert.alert("Lỗi", e?.response?.data?.message || "Đăng nhập thất bại");
        }
      },

      // ⚙️ LOGOUT bình thường
      logout: async () => {
        try {
          await clearTokens();
          set({ user: null, isArtist: false });

          // gọi API logout (không block UI)
          try {
            await api.post("/auth/logout");
          } catch (e: any) {
            console.warn("Logout API failed:", e?.response?.data || e.message);
          }
        } catch (e: any) {
          Alert.alert(
            "Lỗi",
            e?.response?.data?.message || "Có lỗi khi đăng xuất"
          );
        }
      },

      // ⚙️ FORCE LOGOUT (khi 401, token hết hạn…)
      forceLogout: async () => {
        try {
          await clearTokens();
        } finally {
          set({ user: null, isArtist: false });
        }
      },

      // ⚙️ CHECK AUTH (gọi khi app start)
      checkAuth: async () => {
        if (get().checkingAuth) return;

        set({ checkingAuth: true });
        try {
          const access = await getAccessToken();
          if (!access) {
            set({ user: null, checkingAuth: false, isArtist: false });
            return;
          }

          api.defaults.headers.common.Authorization = `Bearer ${access}`;

          const { data } = await api.get("/auth/profile");
          // BE nên trả đúng kiểu User
          set({
            user: data,
            checkingAuth: false,
            isArtist: !!(data && data.isArtist === true),
          });
        } catch (e) {
          console.warn("checkAuth error:", e);
          await clearTokens().catch(() => {});
          set({ user: null, checkingAuth: false, isArtist: false });
        }
      },

      // ⚙️ RESET store (tiện debug)
      reset: async () => {
        await clearTokens().catch(() => {});
        set({
          user: null,
          loading: false,
          checkingAuth: false,
          isArtist: false,
        });
      },
    }),
    {
      name: "vm-auth",
      storage: createJSONStorage(() => AsyncStorage),
      // chỉ persist user & isArtist, không lưu flag loading/checkingAuth
      partialize: (state) => ({
        user: state.user,
        isArtist: state.isArtist,
      }),
    }
  )
);

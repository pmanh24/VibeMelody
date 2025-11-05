import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { api } from "../lib/api";

export type User = {
  id: string;
  fullName: string;
  email: string;
  imageUrl?: string | null;
  isArtist?: boolean;
};

interface SignupPayload {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface UserStoreState {
  user: User | null;
  loading: boolean;
  checkingAuth: boolean;
  token: string | null;
  isArtist: boolean;

  setUser: (userData: User | null) => void;
  setToken: (token: string | null) => void;
  initializeUser: () => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const USER_KEY = "user";
const TOKEN_KEY = "token";

export const useUserStore = create<UserStoreState>((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: false,
  token: null,
  isArtist: false,

  setUser: (userData) => {
    if (!userData) {
      AsyncStorage.removeItem(USER_KEY).catch(() => {});
      set({ user: null, isArtist: false });
      return;
    }

    AsyncStorage.setItem(USER_KEY, JSON.stringify(userData)).catch(() => {});
    set({
      user: userData,
      isArtist: !!userData.isArtist,
    });
  },

  setToken: (token) => {
    if (!token) {
      AsyncStorage.removeItem(TOKEN_KEY).catch(() => {});
      set({ token: null });
      return;
    }

    AsyncStorage.setItem(TOKEN_KEY, token).catch(() => {});
    set({ token });
  },

  initializeUser: async () => {
    try {
      const raw = await AsyncStorage.getItem(USER_KEY);

      if (!raw || raw === "undefined" || raw === "null") {
        if (raw === "undefined" || raw === "null") {
          await AsyncStorage.removeItem(USER_KEY);
        }
        set({ user: null, isArtist: false });
        return;
      }

      const parsed: User = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        await AsyncStorage.removeItem(USER_KEY);
        set({ user: null, isArtist: false });
        return;
      }

      const token = await AsyncStorage.getItem(TOKEN_KEY);
      set({
        user: parsed,
        token: token && token !== "undefined" && token !== "null" ? token : null,
        isArtist: !!parsed.isArtist,
      });
    } catch (err) {
      console.error("initializeUser error:", err);
      await AsyncStorage.removeItem(USER_KEY);
      await AsyncStorage.removeItem(TOKEN_KEY);
      set({ user: null, token: null, isArtist: false });
    }
  },

  signup: async ({ fullName, email, password, confirmPassword }) => {
    set({ loading: true });

    if (password !== confirmPassword) {
      set({ loading: false });
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      const res = await api.post("/auth/signup", { fullName, email, password });
      console.log(res);

      if (!res.data || !res.data.user) {
        throw new Error("Invalid signup response");
      }

      const user: User = res.data.user;
      get().setUser(user);
      set({ loading: false });

      Alert.alert("Success", "Sign up successfully");
    } catch (error: any) {
      set({ loading: false });
      const msg =
        error?.response?.data?.message || error?.message || "An error occurred";
      Alert.alert("Error", msg);
    }
  },

  login: async (email, password) => {
    set({ loading: true });

    try {
      const res = await api.post("/auth/login", { email, password });
      console.log(res);

      if (!res.data || !res.data.user) {
        throw new Error("Invalid login response");
      }

      const user: User = res.data.user;
      const token: string | null = res.data.token || null;

      get().setUser(user);
      get().setToken(token);

      set({
        loading: false,
        isArtist: !!user.isArtist,
      });

      Alert.alert("Success", "Logged in successfully");
    } catch (error: any) {
      set({ loading: false });
      await AsyncStorage.removeItem(USER_KEY);
      await AsyncStorage.removeItem(TOKEN_KEY);
      set({ user: null, token: null, isArtist: false });

      const msg =
        error?.response?.data?.message || error?.message || "An error occurred";
      Alert.alert("Error", msg);

      throw error; // để màn Login có thể catch nếu cần
    }
  },

  logout: async () => {
    try {

    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "An error occurred during logout";
      Alert.alert("Error", msg);
    } finally {
      await AsyncStorage.removeItem(USER_KEY);
      await AsyncStorage.removeItem(TOKEN_KEY);
      set({ user: null, token: null, isArtist: false });
    }
  },
}));
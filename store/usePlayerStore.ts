// store/usePlayerStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useChatStore } from "./useChatStore";

const formatTime = (sec: number): string => {
  const s = Math.max(0, Math.floor(sec || 0));
  const m = Math.floor(s / 60);
  const r = String(s % 60).padStart(2, "0");
  return `${m}:${r}`;
};

export type PlayerSong = {
  _id: string;
  title: string;
  artist: string;
  imageUrl?: string;
  audioUrl?: string;
  duration?: number;
  // nếu cần thêm field khác thì khai báo ở đây
  [key: string]: any;
};

type PlayerState = {
  currentSong: PlayerSong | null;
  isPlaying: boolean;
  queue: PlayerSong[];
  currentIndex: number;
  volume: number;      // 0–1
  currentTime: number; // seconds
  duration: number;    // seconds
};

type PlayerActions = {
  setVolume: (v: number) => void;
  setProgress: (sec: number) => void;
  setDuration: (sec: number) => void;
  getCurrentTimeLabel: () => string;
  initializeQueue: (songs: PlayerSong[]) => void;
  playAlbum: (songs: PlayerSong[], startIndex?: number) => void;
  setCurrentSong: (song: PlayerSong) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  resetPlayer: () => void;
};

export const usePlayerStore = create<PlayerState & PlayerActions>()(
  persist(
    (set, get) => ({
      currentSong: null,
      isPlaying: false,
      queue: [],
      currentIndex: -1,
      volume: 0.7,
      currentTime: 0,
      duration: 0,

      setVolume: (v: number) =>
        set({ volume: Math.max(0, Math.min(1, v)) }),

      setProgress: (sec: number) =>
        set({ currentTime: Math.max(0, sec) }),

      setDuration: (sec: number) =>
        set({ duration: Math.max(0, sec) }),

      getCurrentTimeLabel: () => formatTime(get().currentTime),

      initializeQueue: (songs: PlayerSong[]) => {
        if (!songs || songs.length === 0) return;
        set({
          queue: songs,
          currentSong: get().currentSong || songs[0],
          currentIndex: get().currentIndex === -1 ? 0 : get().currentIndex,
        });
      },

      playAlbum: (songs: PlayerSong[], startIndex: number = 0) => {
        if (!songs || songs.length === 0) return;

        const song = songs[startIndex];

        const socket: any = useChatStore.getState().socket;
        if (socket?.auth) {
          socket.emit("update_activity", {
            userId: socket.auth.userId,
            activity: `Playing ${song.title} by ${song.artist}`,
          });
        }

        set({
          queue: songs,
          currentSong: song,
          currentIndex: startIndex,
          isPlaying: true,
        });
      },

      setCurrentSong: (song: PlayerSong) => {
        if (!song) return;

        const socket: any = useChatStore.getState().socket;
        if (socket?.auth) {
          socket.emit("update_activity", {
            userId: socket.auth.userId,
            activity: `Playing ${song.title} by ${song.artist}`,
          });
        }

        const idx = get().queue.findIndex((s) => s._id === song._id);
        set({
          currentSong: song,
          isPlaying: true,
          currentIndex: idx !== -1 ? idx : get().currentIndex,
        });
      },

      togglePlay: () => {
        const willStartPlaying = !get().isPlaying;
        const currentSong = get().currentSong;

        const socket: any = useChatStore.getState().socket;
        if (socket?.auth) {
          socket.emit("update_activity", {
            userId: socket.auth.userId,
            activity:
              willStartPlaying && currentSong
                ? `Playing ${currentSong.title} by ${currentSong.artist}`
                : "Idle",
          });
        }

        set({ isPlaying: willStartPlaying });
      },

      playNext: () => {
        const { currentIndex, queue } = get();
        const nextIndex = currentIndex + 1;

        if (nextIndex < queue.length) {
          const nextSong = queue[nextIndex];

          const socket: any = useChatStore.getState().socket;
          if (socket?.auth) {
            socket.emit("update_activity", {
              userId: socket.auth.userId,
              activity: `Playing ${nextSong.title} by ${nextSong.artist}`,
            });
          }

          set({
            currentSong: nextSong,
            currentIndex: nextIndex,
            isPlaying: true,
            currentTime: 0,
            duration: 0,
          });
        } else {
          // hết queue
          set({ isPlaying: false });

          const socket: any = useChatStore.getState().socket;
          if (socket?.auth) {
            socket.emit("update_activity", {
              userId: socket.auth.userId,
              activity: "Idle",
            });
          }
        }
      },

      playPrevious: () => {
        const { currentIndex, queue } = get();
        const prevIndex = currentIndex - 1;

        if (prevIndex >= 0) {
          const prevSong = queue[prevIndex];

          const socket: any = useChatStore.getState().socket;
          if (socket?.auth) {
            socket.emit("update_activity", {
              userId: socket.auth.userId,
              activity: `Playing ${prevSong.title} by ${prevSong.artist}`,
            });
          }

          set({
            currentSong: prevSong,
            currentIndex: prevIndex,
            isPlaying: true,
            currentTime: 0,
            duration: 0,
          });
        } else {
          // không có bài trước
          set({ isPlaying: false });

          const socket: any = useChatStore.getState().socket;
          if (socket?.auth) {
            socket.emit("update_activity", {
              userId: socket.auth.userId,
              activity: "Idle",
            });
          }
        }
      },

      resetPlayer: () =>
        set({
          currentSong: null,
          isPlaying: false,
          queue: [],
          currentIndex: -1,
          currentTime: 0,
          duration: 0,
        }),
    }),
    {
      name: "vm-player",
      storage: createJSONStorage(() => AsyncStorage),
      // nếu muốn chỉ lưu một phần state thì chỉnh partialize ở đây
      // partialize: (state) => ({
      //   currentSong: state.currentSong,
      //   queue: state.queue,
      //   currentIndex: state.currentIndex,
      //   volume: state.volume,
      // }),
    }
  )
);

import { create } from "zustand";
import { createSocket } from "../lib/socket";
import { api } from "../lib/api";

type Message = {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
};

type ChatUser = {
  _id: string;
  fullName: string;
  imageUrl?: string;
};

type ChatState = {
  socket: any;
  users: ChatUser[];
  messages: Message[];
  selectedUser: ChatUser | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
  initSocket: (userId: string) => void;
  disconnectSocket: () => void;
  fetchUsers: () => Promise<void>;
  fetchMessages: (receiverId: string) => Promise<void>;
  sendMessage: (receiverId: string, senderId: string, content: string) => void;
  setSelectedUser: (user: ChatUser | null) => void;
};

export const useChatStore = create<ChatState>((set, get) => ({
  socket: null,
  users: [],
  messages: [],
  selectedUser: null,
  isConnected: false,
  onlineUsers: new Set(),

  initSocket: (userId: string) => {
    const socket = createSocket(userId);
    socket.connect();

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      set({ isConnected: true });
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      set({ isConnected: false });
    });

    socket.on("message", (msg: Message) => {
      console.log("📩 New message:", msg);
      set((state) => ({ messages: [...state.messages, msg] }));
    });

    // 🟢 Khi BE emit danh sách onlineUsers
    socket.on("onlineUsers", (users: string[]) => {
      set({ onlineUsers: new Set(users) });
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  fetchUsers: async () => {
    try {
      const { data } = await api.get("/chat/users");
      set({ users: data });
    } catch (e) {
      console.error("❌ Fetch users failed:", e);
    }
  },

  fetchMessages: async (receiverId: string) => {
    try {
      const { data } = await api.get(`/chat/messages/${receiverId}`);
      set({ messages: data });
    } catch (e) {
      console.error("❌ Fetch messages failed:", e);
    }
  },

  sendMessage: (receiverId: string, senderId: string, content: string) => {
    const socket = get().socket;
    if (!socket) return console.warn("⚠️ No socket connected");
    socket.emit("message", { receiverId, senderId, content });
  },

  setSelectedUser: (user: ChatUser | null) => set({ selectedUser: user }),
}));

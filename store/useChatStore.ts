// src/store/useChatStore.ts
import { create } from "zustand";
import { createSocket } from "../lib/socket";
import { api } from "../lib/api";

export type Message = {
  _id?: string;
  id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt?: string;
};

export type ChatUser = {
  _id: string;
  fullName: string;
  imageUrl?: string;
};

export type UserActivityMap = Map<string, string>;

export type Notification = {
  _id?: string;
  id?: string;
  type?: string;
  message?: string;
  isRead?: boolean;
  createdAt?: string;
  // tuỳ BE trả gì thêm thì bổ sung
  [key: string]: any;
};

type ChatState = {
  // socket & connection
  socket: any;
  isConnected: boolean;

  // data
  users: ChatUser[];
  messages: Message[];
  selectedUser: ChatUser | null;
  onlineUsers: Set<string>;
  userActivities: UserActivityMap;
  notifications: Notification[];
  unreadCount: number;

  // ui
  isLoading: boolean;
  error: string | null;

  // actions
  initSocket: (userId: string) => void;
  disconnectSocket: () => void;

  fetchUsers: () => Promise<void>;
  fetchMessages: (userId: string) => Promise<void>;
  fetchNotifications: () => Promise<void>;

  sendMessage: (receiverId: string, senderId: string, content: string) => Promise<void> | void;
  setSelectedUser: (user: ChatUser | null) => void;
};

export const useChatStore = create<ChatState>((set, get) => ({
  // --- STATE ---
  socket: null,
  isConnected: false,

  users: [],
  messages: [],
  selectedUser: null,
  onlineUsers: new Set(),
  userActivities: new Map(),
  notifications: [],
  unreadCount: 0,

  isLoading: false,
  error: null,

  // --- ACTIONS ---

  setSelectedUser: (user) => set({ selectedUser: user }),

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/chat/users");
      set({ users: res.data });
    } catch (error: any) {
      console.error("❌ fetchUsers error:", error);
      set({
        error: error?.response?.data?.message || "Error fetching users",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchNotifications: async () => {
    try {
      const res = await api.get("/chat/allnoti");
      const notis: Notification[] = res.data || [];
      set({
        notifications: notis,
        unreadCount: notis.filter((n) => !n.isRead).length || 0,
      });
      console.log("🔔 Notifications loaded:", notis.length);
    } catch (err) {
      console.error("❌ fetchNotifications error:", err);
    }
  },

  fetchMessages: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/chat/messages/${userId}`);
      set({ messages: res.data });
    } catch (error: any) {
      console.error("❌ fetchMessages error:", error);
      set({
        error: error?.response?.data?.message || "Error fetching messages",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  initSocket: (userId: string) => {
    const { isConnected } = get();
    if (isConnected) return; // tránh init nhiều lần

    // RN đã wrap config trong createSocket
    const socket = createSocket(userId);

    // nếu createSocket dùng autoConnect: false thì vẫn an toàn khi gọi connect()
    socket.connect();

    // set auth nếu BE cần, tuỳ implement createSocket
    try {
      socket.auth = { userId };
    } catch (e) {
      // nếu createSocket không dùng auth thì bỏ qua
    }

    // đánh dấu user đã connect trên BE
    socket.emit("user_connected", userId);

    // --- BASIC CONNECT EVENTS ---
    socket.on("connect", () => {
      console.log("🟢 Socket connected:", socket.id);
      set({ isConnected: true, socket });
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
      set({ isConnected: false });
    });

    // --- ONLINE USERS / ACTIVITY (giống bản JSX cũ) ---
    socket.on("users_online", (users: string[]) => {
      set({ onlineUsers: new Set(users) });
    });

    socket.on("activities", (activities: [string, string][]) => {
      // BE có thể gửi dạng [[userId, activity], ...]
      set({ userActivities: new Map(activities) });
    });

    socket.on("user_connected", (uid: string) => {
      set((state) => ({
        onlineUsers: new Set([...state.onlineUsers, uid]),
      }));
    });

    socket.on("user_disconnected", (uid: string) => {
      set((state) => {
        const newOnline = new Set(state.onlineUsers);
        newOnline.delete(uid);
        return { onlineUsers: newOnline };
      });
    });

    socket.on("activity_updated", ({ userId, activity }: { userId: string; activity: string }) => {
      set((state) => {
        const newMap = new Map(state.userActivities);
        newMap.set(userId, activity);
        return { userActivities: newMap };
      });
    });

    // --- MESSAGE EVENTS ---
    const appendMessageDedup = (msg: Message) => {
      set((state) => {
        const mid = msg._id || msg.id;
        if (!mid) {
          return { messages: [...state.messages, msg] };
        }
        if (state.messages.some((m) => (m._id || m.id) === mid)) {
          return state;
        }
        return { messages: [...state.messages, msg] };
      });
    };

    // khi nhận tin nhắn (BE emit cho receiver)
    socket.on("receive_message", (message: Message) => {
      console.log("📩 receive_message:", message);
      appendMessageDedup(message);
    });

    // khi BE confirm đã gửi (cho sender)
    socket.on("message_sent", (message: Message) => {
      console.log("📤 message_sent:", message);
      appendMessageDedup(message);
    });

    // nếu BE vẫn còn event "message" cũ thì hỗ trợ luôn cho an toàn
    socket.on("message", (message: Message) => {
      console.log("📨 (legacy) message:", message);
      appendMessageDedup(message);
    });

    // --- NOTIFICATION EVENTS ---
    socket.on("notification:new", (data: Notification) => {
      console.log("🔔 New notification:", data);
      set((state) => ({
        notifications: [data, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }));
    });

    set({ socket, isConnected: true });
    console.log("✅ Socket init for user:", userId);
  },

  disconnectSocket: () => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.disconnect();
    }
    set({
      socket: null,
      isConnected: false,
      onlineUsers: new Set(),
      userActivities: new Map(),
    });
    console.log("🔌 Socket disconnected manually");
  },

  sendMessage: async (receiverId: string, senderId: string, content: string) => {
    const s = get().socket;
    if (!s) {
      console.warn("⚠️ No socket connected");
      return;
    }
    // chuẩn với BE: "send_message"
    s.emit("send_message", { receiverId, senderId, content });
  },
}));

// screens/ChatScreen.tsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Send,
  Sparkles,
  ChevronLeft,
  MoreVertical,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useChatStore } from "../store/useChatStore";
import { useUserStore } from "../store/useUserStore";
import { api } from "../lib/api";

const presetQuestions = [
  "Cho mình vài mẹo khám phá nhạc hay trên VibeMelody?",
  "Gợi ý playlist nghe buổi tối nhẹ nhàng được không?",
  "Gợi ý 5 bài mới từ nghệ sĩ mình theo dõi",
  "Mình buồn, gợi ý vài bài hợp mood buồn",
  "Mình mệt, gợi ý vài bài dễ nghe thư giãn",
  "Cần vài bài giúp tập trung học bài",
];

export default function ChatScreen({ onBack }: { onBack: () => void }) {
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  const { user } = useUserStore();
  const {
    users,
    onlineUsers,
    userActivities,
    messages,
    fetchUsers,
    fetchMessages,
    sendMessage,
    initSocket,
    setSelectedUser,
    selectedUser,
  } = useChatStore();

  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [aiMessages, setAiMessages] = useState<any[]>([]);
  const [showChatList, setShowChatList] = useState(true);

  const currentUserId = user?._id || user?.id;
  const isArtist = !!user?.isArtist;

  // 1) socket init + load users
  useEffect(() => {
    if (!currentUserId) return;
    initSocket(currentUserId);
    fetchUsers();
  }, [currentUserId, initSocket, fetchUsers]);

  // 2) build chat list (AI + users)
  const chatItems = useMemo(() => {
    const list: any[] = [];

    if (isArtist) {
      list.push({
        id: "ai",
        type: "ai",
        name: "VibeMelody AI",
        avatar: require("../assets/i1.jpg"),
        lastMessage:
          aiMessages[aiMessages.length - 1]?.message ||
          "How can I help you today?",
        online: true,
        isAI: true,
      });
    }

    (users || []).forEach((u) => {
      const uid = u._id || u.id;
      if (!uid || String(uid) === String(currentUserId)) return;
      list.push({
        id: String(uid),
        type: "user",
        name: u.fullName || u.name || u.email,
        avatar: u.imageUrl ? { uri: u.imageUrl } : require("../assets/i1.jpg"),
        online: onlineUsers.has(String(uid)),
        activity: userActivities.get(String(uid)),
        raw: u,
      });
    });

    return list;
  }, [users, aiMessages, onlineUsers, userActivities, currentUserId, isArtist]);

  // 3) chọn AI (nếu có) hoặc user đầu tiên khi lần đầu có danh sách
  useEffect(() => {
    if (!selectedChat && chatItems.length > 0) {
      const first = chatItems[0];
      setSelectedChat(first);
      if (first.type === "user" && first.raw) {
        setSelectedUser(first.raw);
        // fetch ngay tin nhắn đầu vào
        const uid = first.raw._id || first.raw.id;
        if (uid) fetchMessages(uid);
      }
      if (first.type === "ai") {
        // load lịch sử AI
        (async () => {
          try {
            const res = await api.get("/ai/messages");
            const serverMessages = res.data?.data?.messages || [];
            const mapped = serverMessages.map((msg: any) => ({
              id: msg._id,
              message: msg.content,
              time: msg.createdAt
                ? new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "",
              isMe: msg.senderId !== "ai",
            }));
            setAiMessages(mapped);
          } catch {
            // optional: swallow
          }
        })();
      }
    }
  }, [chatItems, selectedChat, setSelectedUser, fetchMessages]);

  // 4) khi user chọn 1 chat trong list
  const handleSelectChat = (chat: any) => {
    setSelectedChat(chat);
    setShowChatList(false);

    if (chat.type === "user" && chat.raw) {
      setSelectedUser(chat.raw);
      const uid = chat.raw._id || chat.raw.id || chat.id;
      if (uid) fetchMessages(uid); // <-- LẤY TIN NHẮN THEO USER Ở ĐÂY
    }

    if (chat.type === "ai") {
      (async () => {
        try {
          const res = await api.get("/ai/messages");
          const serverMessages = res.data?.data?.messages || [];
          const mapped = serverMessages.map((msg: any) => ({
            id: msg._id,
            message: msg.content,
            time: msg.createdAt
              ? new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
            isMe: msg.senderId !== "ai",
          }));
          setAiMessages(mapped);
        } catch {
          // optional
        }
      })();
    }
  };

  // 5) đồng bộ với selectedUser từ store (nếu nơi khác set)
  useEffect(() => {
    if (!selectedUser) return;
    const uid = selectedUser._id || selectedUser.id;
    if (!uid) return;
    fetchMessages(uid); // <-- đảm bảo luôn fetch theo selectedUser hiện tại
  }, [selectedUser, fetchMessages]);

  // 6) scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [aiMessages, messages]);

  const displayMessages = useMemo(() => {
    if (!selectedChat) return [];

    if (selectedChat.type === "ai") {
      return aiMessages;
    }

    return (messages || []).map((m: any) => ({
      id: m._id || m.id,
      message: m.content || m.message,
      isMe:
        currentUserId &&
        (String(m.senderId) === String(currentUserId) ||
          String(m.sender?._id || m.sender) === String(currentUserId)),
      time: m.createdAt
        ? new Date(m.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
    }));
  }, [messages, aiMessages, selectedChat, currentUserId]);

  const handlePreset = (text: string) => {
    setMessage(text);
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const handleSend = async () => {
    if (!message.trim() || !selectedChat) return;
    const text = message.trim();
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setMessage("");

    // AI chat
    if (selectedChat.type === "ai") {
      const optimistic = {
        id: Date.now(),
        message: text,
        isMe: true,
        time: now,
      };
      setAiMessages((p) => [...p, optimistic]);
      try {
        const res = await api.post("/ai/chat", { message: text });
        const aiMsg = res.data?.data?.aiMessage;
        if (aiMsg) {
          setAiMessages((p) => [
            ...p,
            {
              id: aiMsg._id,
              message: aiMsg.content,
              isMe: false,
              time: aiMsg.createdAt
                ? new Date(aiMsg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : now,
            },
          ]);
        }
      } catch {
        setAiMessages((p) => [
          ...p,
          {
            id: Date.now() + 1,
            message: "AI đang bận, thử lại sau nhé 😅",
            isMe: false,
            time: now,
          },
        ]);
      }
      return;
    }

    // user ↔ user
    sendMessage(selectedChat.id, currentUserId, text);
  };

  const msgs = displayMessages;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <ChevronLeft color="#60a5fa" size={26} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
          <MoreVertical color="#94a3b8" size={22} />
        </View>

        {/* Chat list */}
        {showChatList ? (
          <ScrollView style={styles.chatList}>
            {chatItems.map((chat) => (
              <TouchableOpacity
                key={chat.id}
                style={[
                  styles.chatItem,
                  selectedChat?.id === chat.id && styles.chatItemActive,
                ]}
                onPress={() => handleSelectChat(chat)}
              >
                <View style={{ position: "relative" }}>
                  <Image source={chat.avatar} style={styles.avatar} />
                  {chat.online && <View style={styles.onlineDot} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.chatName}>{chat.name}</Text>
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {chat.activity || chat.lastMessage || "No message yet"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <>
            {/* Chat detail header */}
            <View style={styles.chatHeader}>
              <TouchableOpacity
                onPress={() => setShowChatList(true)}
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <ChevronLeft color="#94a3b8" size={20} />
                {selectedChat?.avatar && (
                  <Image
                    source={selectedChat?.avatar}
                    style={{ width: 36, height: 36, borderRadius: 18 }}
                  />
                )}
                <View>
                  <Text style={{ color: "#fff", fontWeight: "600" }}>
                    {selectedChat?.name}
                  </Text>
                  {selectedChat?.type === "user" ? (
                    <Text style={styles.activityText}>
                      {onlineUsers.has(selectedChat?.id)
                        ? "Online"
                        : userActivities.get(selectedChat?.id) || "Offline"}
                    </Text>
                  ) : (
                    <Text style={styles.activityText}>Online</Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <ScrollView
              ref={scrollRef}
              contentContainerStyle={{ padding: 14 }}
              showsVerticalScrollIndicator={false}
            >
              {selectedChat?.type === "ai" && aiMessages.length === 0 ? (
                <View style={styles.emptyAIChat}>
                  <View style={styles.aiWelcome}>
                    <Sparkles color="#60a5fa" size={40} />
                    <Text style={styles.aiTitle}>Chat with VibeMelody AI</Text>
                    <Text style={styles.aiDesc}>
                      Ask anything about music, playlists, or artists!
                    </Text>
                  </View>
                  <View style={styles.presetGrid}>
                    {presetQuestions.map((q, i) => (
                      <TouchableOpacity
                        key={i}
                        onPress={() => handlePreset(q)}
                        style={styles.presetBtn}
                      >
                        <Text style={styles.presetText}>{q}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : (
                msgs.map((m) => (
                  <View
                    key={m.id}
                    style={[
                      styles.msgWrap,
                      m.isMe ? styles.msgRight : styles.msgLeft,
                    ]}
                  >
                    <View
                      style={[
                        styles.msgBubble,
                        m.isMe ? styles.myBubble : styles.otherBubble,
                      ]}
                    >
                      <Text
                        style={[
                          styles.msgText,
                          m.isMe ? styles.myText : styles.otherText,
                        ]}
                      >
                        {m.message}
                      </Text>
                      {!!m.time && (
                        <Text
                          style={[
                            styles.msgTime,
                            m.isMe ? styles.myTime : styles.otherTime,
                          ]}
                        >
                          {m.time}
                        </Text>
                      )}
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            {/* Input */}
            <View style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                style={styles.textInput}
                placeholder="Type a message..."
                placeholderTextColor="#64748b"
                value={message}
                onChangeText={setMessage}
                onSubmitEditing={handleSend}
                multiline
              />
              <TouchableOpacity
                onPress={handleSend}
                style={[styles.sendBtn, !message.trim() && { opacity: 0.4 }]}
                disabled={!message.trim()}
              >
                <Send color="#000" size={22} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// === STYLES (same tone: #0f172a / #60a5fa)
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0f172a" },
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  chatList: { flex: 1, backgroundColor: "#0f172a" },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  chatItemActive: { backgroundColor: "#1e293b" },
  avatar: { width: 46, height: 46, borderRadius: 23, marginRight: 10 },
  onlineDot: {
    position: "absolute",
    right: 6,
    bottom: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#22c55e",
    borderWidth: 2,
    borderColor: "#0f172a",
  },
  chatName: { color: "#fff", fontWeight: "600", fontSize: 15 },
  lastMessage: { color: "#94a3b8", fontSize: 13 },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  activityText: { color: "#60a5fa", fontSize: 12 },
  msgWrap: { marginVertical: 6 },
  msgLeft: { alignSelf: "flex-start" },
  msgRight: { alignSelf: "flex-end" },
  msgBubble: { borderRadius: 20, padding: 12, maxWidth: "80%" },
  myBubble: { backgroundColor: "#60a5fa" },
  otherBubble: { backgroundColor: "#1e293b" },
  msgText: { fontSize: 15 },
  myText: { color: "#000" },
  otherText: { color: "#fff" },
  msgTime: { fontSize: 11, marginTop: 4, opacity: 0.75 },
  myTime: { color: "#000" },
  otherTime: { color: "#94a3b8" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    padding: 10,
    backgroundColor: "#0f172a",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#1e293b",
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    fontSize: 15,
  },
  sendBtn: {
    width: 46,
    height: 46,
    backgroundColor: "#60a5fa",
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  emptyAIChat: { flex: 1, alignItems: "center", paddingTop: 60 },
  aiWelcome: { alignItems: "center", marginBottom: 30 },
  aiTitle: { color: "#fff", fontWeight: "700", fontSize: 18, marginTop: 8 },
  aiDesc: { color: "#94a3b8", fontSize: 14, textAlign: "center" },
  presetGrid: { width: "100%", padding: 16, gap: 12 },
  presetBtn: {
    backgroundColor: "#1e293b",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  presetText: { color: "#e2e8f0", fontSize: 14.5 },
});

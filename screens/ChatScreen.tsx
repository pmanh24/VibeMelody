"use client"

import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native"
import {
  Send,
  Smile,
  Paperclip,
  Sparkles,
  ChevronLeft,
  MoreVertical,
} from "lucide-react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const { width } = Dimensions.get("window")

// === INTERFACES ===
interface Chat {
  id: number
  name: string
  avatar: any
  lastMessage: string
  time: string
  online: boolean
  isAI: boolean
}

interface Message {
  id: number
  sender: string
  message: string
  time: string
  isMe: boolean
}

const GEMINI_API_KEY = "AIzaSyALOm3FOOObguX5kHkJ8yOVldxonf2dLo4";


// === DỮ LIỆU ===
const mockChats: Chat[] = [
  {
    id: 0,
    name: "Gemini AI",
    avatar: require("../assets/i1.jpg"),
    lastMessage: "How can I help you today?",
    time: "now",
    online: true,
    isAI: true,
  },
  {
    id: 1,
    name: "As a Programmer",
    avatar: require("../assets/i1.jpg"),
    lastMessage: "Hey, check out this track!",
    time: "2m ago",
    online: true,
    isAI: false,
  },
  {
    id: 2,
    name: "Tania Star",
    avatar: require("../assets/i1.jpg"),
    lastMessage: "Love your new album!",
    time: "1h ago",
    online: true,
    isAI: false,
  },
  {
    id: 3,
    name: "Music Lover",
    avatar: require("../assets/i1.jpg"),
    lastMessage: "When is the next release?",
    time: "3h ago",
    online: false,
    isAI: false,
  },
]

const presetQuestions = [
  "What are the trending music genres right now?",
  "How can I promote my music on VibeMelody?",
  "Tips for creating a successful album",
  "How to grow my fanbase?",
]

const mockMessages: Message[] = [
  {
    id: 1,
    sender: "As a Programmer",
    message: "Hey! Have you heard the new track?",
    time: "10:30 AM",
    isMe: false,
  },
  {
    id: 2,
    sender: "Me",
    message: "Not yet! Is it good?",
    time: "10:32 AM",
    isMe: true,
  },
  {
    id: 3,
    sender: "As a Programmer",
    message: "Amazing! You should check it out",
    time: "10:33 AM",
    isMe: false,
  },
]

interface Props {
  onBack: () => void
}

export default function ChatScreen({ onBack }: Props) {
  const [message, setMessage] = useState("")
  const [selectedChat, setSelectedChat] = useState<Chat>(mockChats[0])
  const [aiMessages, setAiMessages] = useState<Message[]>([])
  const [showChatList, setShowChatList] = useState(true)
  const scrollViewRef = useRef<ScrollView>(null)
  const inputRef = useRef<TextInput>(null) // ĐÃ THÊM REF

  // Auto scroll to bottom
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true })
  }, [aiMessages, mockMessages])

  const handlePresetQuestion = (question: string) => {
    setMessage(question)
    // ĐÃ SỬA: DÙNG REF ĐỂ FOCUS
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleSendMessage = async () => {
  if (!message.trim()) return;

  const newMessage: Message = {
    id: Date.now(),
    sender: "Me",
    message: message,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    isMe: true,
  };

  setAiMessages(prev => [...prev, newMessage]);
  setMessage("");

  if (selectedChat.isAI) {
    try {
      console.log("[AI] sending:", message);

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: message }] }],
          }),
        }
      );

      const data = await res.json();
      console.log("[AI] response:", data);

      const aiText =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn’t get a response.";

      const aiResponse: Message = {
        id: Date.now() + 1,
        sender: "Gemini AI",
        message: aiText,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isMe: false,
      };

      setAiMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      console.error("[AI] error:", err);
      setAiMessages(prev => [
        ...prev,
        {
          id: Date.now() + 2,
          sender: "Gemini AI",
          message: "⚠️ Network error while contacting AI.",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isMe: false,
        },
      ]);
    }
  }
};


  const messages = selectedChat.isAI ? aiMessages : mockMessages

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <ChevronLeft color="#60a5fa" size={26} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.body}>
          {/* CHAT LIST – THU NHỎ, ẨN/HIỆN MƯỢT */}
          {showChatList && (
            <View style={styles.chatList}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {mockChats.map(chat => (
                  <TouchableOpacity
                    key={chat.id}
                    style={[
                      styles.chatItem,
                      selectedChat.id === chat.id && styles.chatItemActive,
                    ]}
                    onPress={() => {
                      setSelectedChat(chat)
                      setShowChatList(false)
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.avatarContainer}>
                      <Image
                        source={chat.avatar}
                        style={styles.avatar}
                        defaultSource={require("../assets/i1.jpg")}
                      />
                      {chat.online && <View style={styles.onlineDot} />}
                      {chat.isAI && (
                        <View style={styles.aiBadge}>
                          <Sparkles color="#000" size={12} />
                        </View>
                      )}
                    </View>
                    <View style={styles.chatInfo}>
                      <Text style={styles.chatName} numberOfLines={1}>
                        {chat.name}
                      </Text>
                      <Text style={styles.lastMessage} numberOfLines={1}>
                        {chat.lastMessage}
                      </Text>
                    </View>
                    <Text style={styles.chatTime}>{chat.time}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* CHAT DETAIL */}
          <View style={styles.chatDetail}>
            {/* Chat Header */}
            <View style={styles.chatHeader}>
              <TouchableOpacity
                onPress={() => setShowChatList(true)}
                style={styles.chatHeaderLeft}
                activeOpacity={0.7}
              >
                <ChevronLeft color="#94a3b8" size={20} />
                <View style={styles.avatarContainer}>
                  <Image
                    source={selectedChat.avatar}
                    style={styles.avatarSmall}
                    defaultSource={require("../assets/i1.jpg")}
                  />
                  {selectedChat.isAI && (
                    <View style={styles.aiBadgeSmall}>
                      <Sparkles color="#000" size={11} />
                    </View>
                  )}
                </View>
                <View style={styles.headerInfo}>
                  <Text style={styles.selectedName}>{selectedChat.name}</Text>
                  <Text style={styles.statusText}>
                    {selectedChat.online ? "Online" : "Offline"}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.moreBtn}>
                <MoreVertical color="#94a3b8" size={22} />
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
            >
              {selectedChat.isAI && aiMessages.length === 0 ? (
                <View style={styles.emptyAIChat}>
                  <View style={styles.aiWelcome}>
                    <View style={styles.aiIcon}>
                      <Sparkles color="#60a5fa" size={36} />
                    </View>
                    <Text style={styles.aiTitle}>Chat with Gemini AI</Text>
                    <Text style={styles.aiDesc}>
                      Ask me anything about music, VibeMelody, or get recommendations!
                    </Text>
                  </View>
                  <View style={styles.presetGrid}>
                    {presetQuestions.map((q, i) => (
                      <TouchableOpacity
                        key={i}
                        style={styles.presetBtn}
                        onPress={() => handlePresetQuestion(q)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.presetText} numberOfLines={2}>
                          {q}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : (
                <View style={styles.messagesList}>
                  {messages.map(msg => (
                    <View
                      key={msg.id}
                      style={[
                        styles.messageWrapper,
                        msg.isMe ? styles.messageRight : styles.messageLeft,
                      ]}
                    >
                      <View
                        style={[
                          styles.messageBubble,
                          msg.isMe ? styles.myBubble : styles.otherBubble,
                        ]}
                      >
                        <Text
                          style={[
                            styles.messageText,
                            msg.isMe ? styles.myText : styles.otherText,
                          ]}
                        >
                          {msg.message}
                        </Text>
                        <Text
                          style={[
                            styles.messageTime,
                            msg.isMe ? styles.myTime : styles.otherTime,
                          ]}
                        >
                          {msg.time}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            {/* Input */}
            <View style={styles.inputContainer}>
              <TouchableOpacity style={styles.inputIcon}>
                <Paperclip color="#94a3b8" size={22} />
              </TouchableOpacity>
              <TextInput
                ref={inputRef} // ĐÃ GẮN REF
                style={styles.textInput}
                placeholder="Type a message..."
                placeholderTextColor="#64748b"
                value={message}
                onChangeText={setMessage}
                onSubmitEditing={handleSendMessage}
                returnKeyType="send"
                multiline
                maxLength={500}
              />
              <TouchableOpacity style={styles.inputIcon}>
                <Smile color="#94a3b8" size={22} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  !message.trim() && styles.sendBtnDisabled,
                ]}
                onPress={handleSendMessage}
                disabled={!message.trim()}
                activeOpacity={0.8}
              >
                <Send color="#000" size={22} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

// === STYLES – DANH SÁCH CHAT THU NHỎ, ĐẸP ===
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0f172a" },
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    zIndex: 10,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 19, fontWeight: "bold", color: "#fff", fontFamily: "DancingScript_700Bold" },

  body: { flex: 1, flexDirection: "row" },

  // CHAT LIST – THU NHỎ, ẨN/HIỆN
  chatList: {
    width: width * 0.78, // ĐÃ GIẢM TỪ 85% → 78%
    backgroundColor: "#0f172a",
    borderRightWidth: 1,
    borderRightColor: "#1e293b",
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 100,
    paddingTop: 12,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  chatItemActive: { backgroundColor: "#1e293b" },
  avatarContainer: { position: "relative" },
  avatar: { width: 44, height: 44, borderRadius: 22 }, // ĐÃ GIẢM KÍCH THƯỚC
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    backgroundColor: "#10b981",
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#0f172a",
  },
  aiBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    backgroundColor: "#60a5fa",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  chatInfo: { flex: 1 },
  chatName: { color: "#fff", fontWeight: "600", fontSize: 14.5 }, // ĐÃ GIẢM FONT
  lastMessage: { color: "#94a3b8", fontSize: 12.5, marginTop: 1 },
  chatTime: { color: "#64748b", fontSize: 11.5 },

  // CHAT DETAIL
  chatDetail: { flex: 1, flexDirection: "column" },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    backgroundColor: "#0f172a",
  },
  chatHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  avatarSmall: { width: 40, height: 40, borderRadius: 20 },
  aiBadgeSmall: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    backgroundColor: "#60a5fa",
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: { flex: 1 },
  selectedName: { color: "#fff", fontWeight: "600", fontSize: 16 },
  statusText: { color: "#10b981", fontSize: 12, marginTop: 1 },
  moreBtn: { padding: 8 },

  messagesContainer: { flex: 1, paddingHorizontal: 14 },
  emptyAIChat: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  aiWelcome: { alignItems: "center", marginBottom: 36 },
  aiIcon: { width: 70, height: 70, backgroundColor: "#60a5fa20", borderRadius: 35, justifyContent: "center", alignItems: "center", marginBottom: 18 },
  aiTitle: { fontSize: 19, fontWeight: "bold", color: "#fff", marginBottom: 8 },
  aiDesc: { fontSize: 14.5, color: "#94a3b8", textAlign: "center", lineHeight: 22 },
  presetGrid: { width: "100%", gap: 12 },
  presetBtn: { backgroundColor: "#1e293b", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#334155" },
  presetText: { color: "#e2e8f0", fontSize: 14.5, lineHeight: 21 },

  messagesList: { paddingVertical: 10 },
  messageWrapper: { marginVertical: 6, flexDirection: "row", paddingHorizontal: 4 },
  messageLeft: { justifyContent: "flex-start" },
  messageRight: { justifyContent: "flex-end" },
  messageBubble: { maxWidth: "78%", paddingHorizontal: 16, paddingVertical: 11, borderRadius: 20 },
  myBubble: { backgroundColor: "#60a5fa", borderBottomRightRadius: 6 },
  otherBubble: { backgroundColor: "#1e293b", borderBottomLeftRadius: 6 },
  messageText: { fontSize: 15.5, lineHeight: 21 },
  myText: { color: "#000" },
  otherText: { color: "#fff" },
  messageTime: { fontSize: 11.5, marginTop: 4, opacity: 0.75 },
  myTime: { color: "#000" },
  otherTime: { color: "#94a3b8" },

  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    backgroundColor: "#0f172a",
    gap: 10,
  },
  inputIcon: { padding: 6 },
  textInput: {
    flex: 1,
    backgroundColor: "#1e293b",
    color: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    fontSize: 15.5,
    maxHeight: 100,
  },
  sendBtn: {
    width: 46,
    height: 46,
    backgroundColor: "#60a5fa",
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: { opacity: 0.5 },
})
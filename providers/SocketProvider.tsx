// src/providers/SocketProvider.tsx
import React, { useEffect, useRef, PropsWithChildren } from "react";
import { useChatStore } from "../store/useChatStore";
import { useUserStore } from "../store/useUserStore";

const SocketProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const initSocket = useChatStore((s) => s.initSocket);
  const disconnectSocket = useChatStore((s) => s.disconnectSocket);
  const fetchUsers = useChatStore((s) => s.fetchUsers);
  const fetchMessages = useChatStore((s) => s.fetchMessages);
  const fetchNotifications = useChatStore((s) => s.fetchNotifications);

  const selectedUserId = useChatStore((s) => {
    const u: any = s.selectedUser;
    return u?._id || u?.id || null;
  });

  const userId = useUserStore((s) => {
    const u: any = s.user;
    return u?._id || u?.id || null;
  });

  const initedForUserRef = useRef<string | null>(null);

  // init socket khi có user đăng nhập
  useEffect(() => {
    if (!userId) return;

    if (initedForUserRef.current === userId) return;

    initedForUserRef.current = userId;
    initSocket(userId);
    fetchUsers();
    fetchNotifications();

    return () => {
      disconnectSocket();
      initedForUserRef.current = null;
    };
  }, [userId, initSocket, disconnectSocket, fetchUsers, fetchNotifications]);

  // load messages khi chọn user chat
  useEffect(() => {
    if (!selectedUserId) return;
    fetchMessages(selectedUserId);
  }, [selectedUserId, fetchMessages]);

  return <>{children}</>;
};

export default SocketProvider;

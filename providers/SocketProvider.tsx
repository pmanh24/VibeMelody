// src/providers/SocketProvider.tsx
import React, { useEffect, useRef, PropsWithChildren } from "react";
import { useChatStore } from "../store/useChatStore";
import { useUserStore } from "../store/useUserStore";

const SocketProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const initSocket = useChatStore((s) => s.initSocket);
  const disconnectSocket = useChatStore((s) => s.disconnectSocket);
  const fetchUsers = useChatStore((s) => s.fetchUsers);
  const fetchMessages = useChatStore((s) => s.fetchMessages);

  const selectedUserId = useChatStore((s) => {
    const u = s.selectedUser as any;
    return u?._id || u?.id || null;
  });

  const userId = useUserStore((s) => {
    const u = s.user as any;
    return u?._id || u?.id || null;
  });

  const initedForUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    if (initedForUserRef.current === userId) return;

    initedForUserRef.current = userId;
    initSocket(userId);
    fetchUsers();

    return () => {
      disconnectSocket();
      initedForUserRef.current = null;
    };
  }, [userId, initSocket, disconnectSocket, fetchUsers]);

  useEffect(() => {
    if (!selectedUserId) return;
    fetchMessages(selectedUserId);
  }, [selectedUserId, fetchMessages]);

  return <>{children}</>;
};

export default SocketProvider;

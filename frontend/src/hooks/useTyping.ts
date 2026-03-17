"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { getSocket } from "@/lib/socket";

interface TypingUser {
  userId: string;
  username: string;
}

export function useTyping(channelId: string | null) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTyping = useRef(false);

  useEffect(() => {
    if (!channelId) return;
    const socket = getSocket();

    const onTyping = ({ userId, username, channelId: cId }: TypingUser & { channelId: string }) => {
      if (cId !== channelId) return;
      setTypingUsers((prev) => {
        if (prev.find((u) => u.userId === userId)) return prev;
        return [...prev, { userId, username }];
      });
    };

    const onStopTyping = ({ userId, channelId: cId }: { userId: string; channelId: string }) => {
      if (cId !== channelId) return;
      setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
    };

    socket.on("user_typing", onTyping);
    socket.on("user_stop_typing", onStopTyping);

    return () => {
      socket.off("user_typing", onTyping);
      socket.off("user_stop_typing", onStopTyping);
    };
  }, [channelId]);

  const emitTypingStart = useCallback(() => {
    if (!channelId) return;
    const socket = getSocket();

    if (!isTyping.current) {
      isTyping.current = true;
      socket.emit("typing_start", { channelId });
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      isTyping.current = false;
      socket.emit("typing_stop", { channelId });
    }, 3000);
  }, [channelId]);

  const emitTypingStop = useCallback(() => {
    if (!channelId) return;
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    if (isTyping.current) {
      isTyping.current = false;
      getSocket().emit("typing_stop", { channelId });
    }
  }, [channelId]);

  return { typingUsers, emitTypingStart, emitTypingStop };
}

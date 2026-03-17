"use client";
import { useEffect, useRef } from "react";
import { getSocket } from "@/lib/socket";
import { useMessageStore } from "@/lib/stores/messageStore";
import type { Message } from "@/types";

export function useSocket(channelId: string | null) {
  const addMessage = useMessageStore((s) => s.addMessage);
  const updateMessage = useMessageStore((s) => s.updateMessage);
  const removeMessage = useMessageStore((s) => s.removeMessage);
  const prevChannelId = useRef<string | null>(null);

  useEffect(() => {
    if (!channelId) return;

    const socket = getSocket();

    // Leave previous channel
    if (prevChannelId.current && prevChannelId.current !== channelId) {
      socket.emit("leave_channel", { channelId: prevChannelId.current });
    }

    // Join new channel
    socket.emit("join_channel", { channelId });
    prevChannelId.current = channelId;

    const onNewMessage = (message: Message) => addMessage(message);
    const onMessageUpdated = (message: Message) => updateMessage(message);
    const onMessageDeleted = ({ messageId, channelId: cId }: { messageId: string; channelId: string }) =>
      removeMessage(cId, messageId);

    socket.on("new_message", onNewMessage);
    socket.on("message_updated", onMessageUpdated);
    socket.on("message_deleted", onMessageDeleted);

    return () => {
      socket.off("new_message", onNewMessage);
      socket.off("message_updated", onMessageUpdated);
      socket.off("message_deleted", onMessageDeleted);
    };
  }, [channelId, addMessage, updateMessage, removeMessage]);
}

"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useChannelStore } from "@/lib/stores/channelStore";
import { useServerStore } from "@/lib/stores/serverStore";
import { useMessageStore } from "@/lib/stores/messageStore";
import { useSocket } from "@/hooks/useSocket";
import ChatArea from "@/components/chat/ChatArea";
import MessageInput from "@/components/chat/MessageInput";
import TypingIndicator from "@/components/chat/TypingIndicator";
import { useTyping } from "@/hooks/useTyping";

export default function ChannelPage() {
  const params = useParams<{ channelId: string }>();
  const channelId = params.channelId;

  const { channels, activeChannel, setActiveChannel } = useChannelStore();
  const { fetchMessages } = useMessageStore();
  const { typingUsers, emitTypingStart, emitTypingStop } = useTyping(channelId);

  // Activate socket listener
  useSocket(channelId);

  // Sync active channel from URL
  useEffect(() => {
    const found = channels.find((c) => c.id === channelId);
    if (found) setActiveChannel(found);
  }, [channelId, channels, setActiveChannel]);

  // Load initial messages
  useEffect(() => {
    if (channelId) {
      fetchMessages(channelId);
    }
  }, [channelId, fetchMessages]);

  if (!activeChannel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-discord-bg-tertiary">
        <p className="text-discord-text-muted text-sm">Loading channel...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-discord-bg-tertiary min-h-0">
      {/* Channel header */}
      <div className="h-12 flex items-center px-4 shadow-sm border-b border-discord-separator flex-shrink-0">
        <span className="text-discord-text-muted mr-2 text-lg font-light">#</span>
        <span className="font-semibold text-discord-text-primary">{activeChannel.name}</span>
        {activeChannel.type === "ANNOUNCEMENT" && (
          <span className="ml-2 text-xs bg-discord-yellow/20 text-discord-yellow px-1.5 py-0.5 rounded">
            announcement
          </span>
        )}
      </div>

      {/* Messages */}
      <ChatArea channelId={channelId} />

      {/* Typing + Input */}
      <div className="flex-shrink-0 px-4 pb-4">
        <TypingIndicator typingUsers={typingUsers} />
        <MessageInput
          channelId={channelId}
          channelName={activeChannel.name}
          onTypingStart={emitTypingStart}
          onTypingStop={emitTypingStop}
        />
      </div>
    </div>
  );
}

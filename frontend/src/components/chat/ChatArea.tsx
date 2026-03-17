"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useMessageStore } from "@/lib/stores/messageStore";
import { useAuthStore } from "@/lib/stores/authStore";
import MessageBubble from "./MessageBubble";
import { format, isToday, isYesterday } from "date-fns";

function DateDivider({ date }: { date: string }) {
  const d = new Date(date);
  let label = format(d, "MMMM d, yyyy");
  if (isToday(d)) label = "Today";
  else if (isYesterday(d)) label = "Yesterday";

  return (
    <div className="flex items-center gap-3 my-4 px-4">
      <div className="flex-1 h-px bg-discord-separator" />
      <span className="text-discord-text-muted text-xs font-semibold whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-discord-separator" />
    </div>
  );
}

export default function ChatArea({ channelId }: { channelId: string }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const messages = useMessageStore((s) => s.messages[channelId] || []);
  const hasMore = useMessageStore((s) => s.hasMore[channelId] ?? false);
  const fetchMessages = useMessageStore((s) => s.fetchMessages);
  const { user } = useAuthStore();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, autoScroll]);

  // Detect if user is near bottom
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setAutoScroll(nearBottom);

    // Load more when scrolled to top
    if (el.scrollTop < 80 && hasMore && !loadingMore) {
      loadMore();
    }
  }, [hasMore, loadingMore]);

  const loadMore = async () => {
    if (!hasMore || loadingMore || messages.length === 0) return;
    setLoadingMore(true);
    const cursor = messages[0]?.createdAt;
    const prevHeight = containerRef.current?.scrollHeight || 0;
    await fetchMessages(channelId, cursor);
    // Maintain scroll position after prepend
    requestAnimationFrame(() => {
      if (containerRef.current) {
        const newHeight = containerRef.current.scrollHeight;
        containerRef.current.scrollTop = newHeight - prevHeight;
      }
      setLoadingMore(false);
    });
  };

  // Group messages by date
  const grouped = messages.reduce<{ date: string; messages: typeof messages }[]>((acc, msg) => {
    const dateKey = format(new Date(msg.createdAt), "yyyy-MM-dd");
    const last = acc[acc.length - 1];
    if (last?.date === dateKey) {
      last.messages.push(msg);
    } else {
      acc.push({ date: dateKey, messages: [msg] });
    }
    return acc;
  }, []);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-end pb-6 px-4 overflow-y-auto">
        <div className="text-center">
          <div className="text-5xl mb-3"># </div>
          <h3 className="text-xl font-bold text-discord-text-primary mb-1">
            Welcome to this channel!
          </h3>
          <p className="text-discord-text-secondary text-sm">
            This is the beginning of the conversation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto flex flex-col"
    >
      {/* Load more trigger */}
      <div ref={topRef} className="py-2 text-center">
        {loadingMore && (
          <div className="flex items-center justify-center gap-2 text-discord-text-muted text-xs py-2">
            <span className="animate-spin">⟳</span> Loading older messages...
          </div>
        )}
        {!hasMore && messages.length > 0 && (
          <p className="text-discord-text-muted text-xs py-2">
            You&apos;ve reached the beginning of the channel.
          </p>
        )}
      </div>

      {/* Messages grouped by date */}
      <div className="flex flex-col">
        {grouped.map((group) => (
          <div key={group.date}>
            <DateDivider date={group.messages[0].createdAt} />
            {group.messages.map((msg, i) => {
              const prevMsg = group.messages[i - 1];
              const isGrouped =
                prevMsg &&
                prevMsg.user.id === msg.user.id &&
                new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() < 5 * 60 * 1000;

              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={msg.user.id === user?.id}
                  isGrouped={!!isGrouped}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div ref={bottomRef} className="h-4" />
    </div>
  );
}

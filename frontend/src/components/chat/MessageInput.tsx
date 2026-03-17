"use client";
import { useState, useRef, useCallback } from "react";
import { getSocket } from "@/lib/socket";
import { Send } from "lucide-react";

interface Props {
  channelId: string;
  channelName: string;
  onTypingStart: () => void;
  onTypingStop: () => void;
}

export default function MessageInput({ channelId, channelName, onTypingStart, onTypingStop }: Props) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  const sendMessage = useCallback(() => {
    const trimmed = content.trim();
    if (!trimmed) return;
    getSocket().emit("send_message", { channelId, content: trimmed });
    setContent("");
    onTypingStop();
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.focus();
      }
    });
  }, [content, channelId, onTypingStop]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    adjustHeight();
    if (e.target.value.length > 0) {
      onTypingStart();
    } else {
      onTypingStop();
    }
  };

  return (
    <div className="flex items-end gap-2 bg-discord-bg-hover rounded-lg px-4 py-2">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={`Message #${channelName}`}
        rows={1}
        maxLength={4000}
        className="flex-1 bg-transparent text-discord-text-primary placeholder-discord-text-muted
          text-sm resize-none focus:outline-none py-1 leading-5"
        style={{ minHeight: 22, maxHeight: 200 }}
      />
      <button
        onClick={sendMessage}
        disabled={!content.trim()}
        title="Send message"
        className="flex-shrink-0 p-1.5 rounded text-discord-text-muted
          hover:text-discord-blurple disabled:opacity-30 disabled:cursor-not-allowed
          transition-colors duration-150 mb-0.5"
      >
        <Send size={18} />
      </button>
    </div>
  );
}

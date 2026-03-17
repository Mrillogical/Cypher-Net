"use client";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { getSocket } from "@/lib/socket";
import type { Message } from "@/types";
import { Pencil, Trash2, X, Check } from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useServerStore } from "@/lib/stores/serverStore";

interface Props {
  message: Message;
  isOwn: boolean;
  isGrouped: boolean;
}

export default function MessageBubble({ message, isOwn, isGrouped }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuthStore();
  const { activeServer } = useServerStore();

  const isServerOwner = activeServer?.ownerId === user?.id;
  const canDelete = isOwn || isServerOwner;
  const canEdit = isOwn && !message.deleted;

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      const len = editContent.length;
      inputRef.current?.setSelectionRange(len, len);
    }
  }, [isEditing]);

  const handleEdit = () => {
    if (!editContent.trim() || editContent === message.content) {
      setIsEditing(false);
      return;
    }
    getSocket().emit("edit_message", {
      channelId: message.channelId,
      messageId: message.id,
      content: editContent.trim(),
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    getSocket().emit("delete_message", {
      channelId: message.channelId,
      messageId: message.id,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEdit();
    }
    if (e.key === "Escape") {
      setEditContent(message.content);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`relative flex items-start gap-4 px-4 py-0.5 hover:bg-discord-bg-hover/40 group
        ${isGrouped ? "mt-0" : "mt-4"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar or spacer */}
      <div className="w-10 flex-shrink-0 mt-0.5">
        {!isGrouped ? (
          <div className="w-10 h-10 rounded-full bg-discord-blurple flex items-center justify-center select-none">
            <span className="text-white text-sm font-bold">
              {message.user.username[0].toUpperCase()}
            </span>
          </div>
        ) : (
          <span className="text-[10px] text-discord-text-muted opacity-0 group-hover:opacity-100 leading-none pt-1 block text-right select-none">
            {format(new Date(message.createdAt), "HH:mm")}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {!isGrouped && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="font-semibold text-discord-text-primary text-sm hover:underline cursor-pointer">
              {message.user.username}
            </span>
            <span className="text-discord-text-muted text-xs">
              {format(new Date(message.createdAt), "MM/dd/yyyy HH:mm")}
            </span>
            {message.updatedAt !== message.createdAt && !message.deleted && (
              <span className="text-discord-text-muted text-[10px]">(edited)</span>
            )}
          </div>
        )}

        {isEditing ? (
          <div>
            <textarea
              ref={inputRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              className="w-full bg-discord-input-bg text-discord-text-primary rounded px-3 py-2 text-sm
                border border-discord-blurple focus:outline-none resize-none"
              style={{ minHeight: 36, maxHeight: 200 }}
            />
            <div className="flex items-center gap-2 mt-1">
              <span className="text-discord-text-muted text-xs">
                escape to{" "}
                <button
                  onClick={() => { setEditContent(message.content); setIsEditing(false); }}
                  className="text-discord-blurple hover:underline"
                >
                  cancel
                </button>{" "}
                · enter to{" "}
                <button onClick={handleEdit} className="text-discord-blurple hover:underline">
                  save
                </button>
              </span>
            </div>
          </div>
        ) : (
          <p className={`text-sm leading-relaxed break-words whitespace-pre-wrap
            ${message.deleted ? "text-discord-text-muted italic" : "text-discord-text-primary"}`}>
            {message.content}
          </p>
        )}
      </div>

      {/* Action buttons (on hover) */}
      {!isEditing && !message.deleted && hovered && (canEdit || canDelete) && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1
          bg-discord-bg-secondary border border-discord-separator rounded shadow-lg px-1 py-1">
          {canEdit && (
            <button
              onClick={() => setIsEditing(true)}
              title="Edit message"
              className="p-1.5 rounded text-discord-text-muted hover:text-discord-text-primary
                hover:bg-discord-bg-hover transition-colors"
            >
              <Pencil size={14} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              title="Delete message"
              className="p-1.5 rounded text-discord-text-muted hover:text-discord-red
                hover:bg-discord-bg-hover transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

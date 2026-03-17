"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChannelStore } from "@/lib/stores/channelStore";
import { useServerStore } from "@/lib/stores/serverStore";
import { useAuthStore } from "@/lib/stores/authStore";
import api from "@/lib/api";
import type { Channel } from "@/types";
import CreateChannelModal from "@/components/server/CreateChannelModal";
import { Hash, Volume2, Plus, Mic, Headphones, ChevronDown, LogOut, Trash2, X } from "lucide-react";

const ChannelIcon = ({ type }: { type: Channel["type"] }) => {
  if (type === "ANNOUNCEMENT") return <Volume2 size={16} className="flex-shrink-0" />;
  return <Hash size={16} className="flex-shrink-0" />;
};

function ConfirmModal({
  title,
  description,
  confirmLabel,
  danger,
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <h2 className="text-xl font-bold text-discord-text-primary">{title}</h2>
            <button onClick={onClose} className="text-discord-text-muted hover:text-discord-text-primary mt-0.5">
              <X size={20} />
            </button>
          </div>
          <p className="text-discord-text-secondary text-sm">{description}</p>
          <div className="flex gap-3 justify-end">
            <button onClick={onClose} className="btn-ghost text-sm">Cancel</button>
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className={danger ? "btn-danger text-sm" : "btn-primary text-sm"}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChannelSidebar() {
  const router = useRouter();
  const { channels, activeChannel, setActiveChannel } = useChannelStore();
  const { activeServer, removeServer } = useServerStore();
  const { user } = useAuthStore();
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"leave" | "delete" | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isOwner = activeServer?.ownerId === user?.id;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelectChannel = (channel: Channel) => {
    setActiveChannel(channel);
    router.push(`/app/channels/${channel.id}`);
  };

  const handleLeave = async () => {
    if (!activeServer) return;
    try {
      await api.delete(`/api/servers/${activeServer.id}/leave`);
      removeServer(activeServer.id);
      router.push("/app");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to leave server");
    }
  };

  const handleDelete = async () => {
    if (!activeServer) return;
    try {
      await api.delete(`/api/servers/${activeServer.id}`);
      removeServer(activeServer.id);
      router.push("/app");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete server");
    }
  };

  if (!activeServer) {
    return (
      <div className="w-60 bg-discord-bg-secondary flex flex-col flex-shrink-0">
        <div className="h-12 flex items-center px-4 border-b border-discord-bg">
          <p className="text-discord-text-muted text-sm">No server selected</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-60 bg-discord-bg-secondary flex flex-col flex-shrink-0">
        {/* Server header with dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setShowDropdown((v) => !v)}
            className="w-full h-12 flex items-center px-4 border-b border-discord-bg shadow-sm
              hover:bg-discord-bg-hover transition-colors cursor-pointer"
          >
            <h2 className="font-semibold text-discord-text-primary truncate flex-1 text-left">
              {activeServer.name}
            </h2>
            <ChevronDown
              size={16}
              className={`text-discord-text-secondary transition-transform duration-150 flex-shrink-0
                ${showDropdown ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown menu */}
          {showDropdown && (
            <div className="absolute top-12 left-0 right-0 z-20 bg-discord-bg border border-discord-separator
              rounded-b-lg shadow-xl py-1.5 mx-2 animate-fade-in">
              {!isOwner && (
                <button
                  onClick={() => { setConfirmAction("leave"); setShowDropdown(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-discord-red
                    hover:bg-discord-red hover:text-white transition-colors rounded mx-0"
                >
                  <LogOut size={14} />
                  Leave Server
                </button>
              )}
              {isOwner && (
                <button
                  onClick={() => { setConfirmAction("delete"); setShowDropdown(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-discord-red
                    hover:bg-discord-red hover:text-white transition-colors rounded"
                >
                  <Trash2 size={14} />
                  Delete Server
                </button>
              )}
            </div>
          )}
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          <div className="flex items-center justify-between px-2 mb-1 group">
            <span className="text-xs font-semibold uppercase tracking-wide text-discord-text-muted">
              Text Channels
            </span>
            {isOwner && (
              <button
                onClick={() => setShowCreateChannel(true)}
                className="text-discord-text-muted hover:text-discord-text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                title="Create channel"
              >
                <Plus size={14} />
              </button>
            )}
          </div>

          {channels.length === 0 && (
            <p className="text-discord-text-muted text-xs px-2 py-1">No channels yet.</p>
          )}

          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => handleSelectChannel(channel)}
              className={`channel-item w-full text-left ${activeChannel?.id === channel.id ? "active" : ""}`}
            >
              <ChannelIcon type={channel.type} />
              <span className="truncate">{channel.name}</span>
            </button>
          ))}
        </div>

        {/* User panel */}
        <div className="h-14 bg-discord-bg flex items-center px-2 gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-discord-blurple flex items-center justify-center flex-shrink-0 relative">
            <span className="text-white text-xs font-bold">
              {user?.username?.[0]?.toUpperCase()}
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-discord-green border-2 border-discord-bg" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-discord-text-primary text-sm font-medium truncate leading-tight">
              {user?.username}
            </p>
            <p className="text-discord-text-muted text-xs truncate leading-tight">Online</p>
          </div>
          <div className="flex gap-0.5">
            <button className="text-discord-text-muted hover:text-discord-text-primary p-1.5 rounded hover:bg-discord-bg-hover transition-colors" title="Mute">
              <Mic size={16} />
            </button>
            <button className="text-discord-text-muted hover:text-discord-text-primary p-1.5 rounded hover:bg-discord-bg-hover transition-colors" title="Deafen">
              <Headphones size={16} />
            </button>
          </div>
        </div>
      </div>

      {showCreateChannel && activeServer && (
        <CreateChannelModal serverId={activeServer.id} onClose={() => setShowCreateChannel(false)} />
      )}

      {confirmAction === "leave" && (
        <ConfirmModal
          title={`Leave '${activeServer.name}'`}
          description="Are you sure you want to leave this server? You won't be able to rejoin unless you're re-invited or join again."
          confirmLabel="Leave Server"
          danger
          onConfirm={handleLeave}
          onClose={() => setConfirmAction(null)}
        />
      )}

      {confirmAction === "delete" && (
        <ConfirmModal
          title={`Delete '${activeServer.name}'`}
          description="Are you sure you want to permanently delete this server? All channels and messages will be lost. This action cannot be undone."
          confirmLabel="Delete Server"
          danger
          onConfirm={handleDelete}
          onClose={() => setConfirmAction(null)}
        />
      )}
    </>
  );
}

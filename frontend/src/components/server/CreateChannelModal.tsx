"use client";
import { useState } from "react";
import api from "@/lib/api";
import { useChannelStore } from "@/lib/stores/channelStore";
import { X, Hash } from "lucide-react";

interface Props {
  serverId: string;
  onClose: () => void;
}

export default function CreateChannelModal({ serverId, onClose }: Props) {
  const { addChannel } = useChannelStore();
  const [name, setName] = useState("");
  const [type, setType] = useState<"TEXT" | "ANNOUNCEMENT">("TEXT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post(`/api/servers/${serverId}/channels`, {
        name: name.trim(),
        type,
      });
      addChannel(data.data.channel);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create channel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-discord-text-primary">Create Channel</h2>
            <button onClick={onClose} className="text-discord-text-muted hover:text-discord-text-primary">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Channel type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-discord-text-secondary mb-2">
                Channel Type
              </label>
              <div className="space-y-2">
                {(["TEXT", "ANNOUNCEMENT"] as const).map((t) => (
                  <label
                    key={t}
                    className={`flex items-center gap-3 p-3 rounded cursor-pointer border transition-colors
                      ${type === t
                        ? "bg-discord-bg-hover border-discord-blurple"
                        : "bg-discord-bg border-discord-separator hover:bg-discord-bg-hover"
                      }`}
                  >
                    <input
                      type="radio"
                      name="channelType"
                      value={t}
                      checked={type === t}
                      onChange={() => setType(t)}
                      className="hidden"
                    />
                    <Hash size={18} className="text-discord-text-muted" />
                    <div>
                      <p className="text-discord-text-primary text-sm font-medium">{t === "TEXT" ? "Text Channel" : "Announcement"}</p>
                      <p className="text-discord-text-muted text-xs">
                        {t === "TEXT" ? "Send messages and files" : "Post important updates"}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-discord-text-secondary mb-1.5">
                Channel Name
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-discord-text-muted">
                  <Hash size={14} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  placeholder="new-channel"
                  className="input-field pl-8"
                  maxLength={100}
                  autoFocus
                />
              </div>
            </div>

            {error && <p className="text-discord-red text-sm">{error}</p>}

            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
              <button type="submit" disabled={loading || !name.trim()} className="btn-primary">
                {loading ? "Creating..." : "Create Channel"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

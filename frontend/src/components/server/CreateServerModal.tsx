"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useServerStore } from "@/lib/stores/serverStore";
import { useChannelStore } from "@/lib/stores/channelStore";
import { X } from "lucide-react";

export default function CreateServerModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { addServer, setActiveServer } = useServerStore();
  const { fetchChannels, setActiveChannel } = useChannelStore();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/api/servers", { name: name.trim() });
      const server = data.data.server;
      addServer(server);
      setActiveServer(server);
      await fetchChannels(server.id);
      const firstCh = server.channels?.[0];
      if (firstCh) {
        setActiveChannel(firstCh);
        router.push(`/app/channels/${firstCh.id}`);
      }
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-discord-text-primary">Create a server</h2>
            <button onClick={onClose} className="text-discord-text-muted hover:text-discord-text-primary">
              <X size={20} />
            </button>
          </div>
          <p className="text-discord-text-secondary text-sm mb-6">
            Give your server a personality with a name. You can always change it later.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-discord-text-secondary mb-1.5">
                Server Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome Server"
                className="input-field"
                maxLength={100}
                autoFocus
              />
            </div>
            {error && <p className="text-discord-red text-sm">{error}</p>}
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={onClose} className="btn-ghost">
                Back
              </button>
              <button type="submit" disabled={loading || !name.trim()} className="btn-primary">
                {loading ? "Creating..." : "Create Server"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

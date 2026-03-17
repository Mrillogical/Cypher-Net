"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useServerStore } from "@/lib/stores/serverStore";
import { useChannelStore } from "@/lib/stores/channelStore";
import type { Server } from "@/types";
import { X, Users, LogIn } from "lucide-react";

export default function DiscoverModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { addServer, setActiveServer, servers: joinedServers } = useServerStore();
  const { fetchChannels, setActiveChannel } = useChannelStore();
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    api.get("/api/servers/discover")
      .then(({ data }) => setServers(data.data.servers))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleJoin = async (server: Server) => {
    setJoining(server.id);
    try {
      const { data } = await api.post(`/api/servers/${server.id}/join`);
      const joined = data.data.server;
      addServer(joined);
      setActiveServer(joined);
      await fetchChannels(joined.id);
      const firstCh = joined.channels?.[0];
      if (firstCh) {
        setActiveChannel(firstCh);
        router.push(`/app/channels/${firstCh.id}`);
      }
      onClose();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to join server");
    } finally {
      setJoining(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-discord-text-primary">Discover Servers</h2>
            <button onClick={onClose} className="text-discord-text-muted hover:text-discord-text-primary">
              <X size={20} />
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-discord-text-muted text-sm">Loading servers...</div>
          ) : servers.length === 0 ? (
            <div className="py-12 text-center text-discord-text-muted text-sm">
              No new servers to discover yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {servers.map((server) => {
                const memberCount = server._count?.members ?? 0;
                return (
                  <div
                    key={server.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-discord-bg hover:bg-discord-bg-hover transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-discord-blurple flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {server.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-discord-text-primary font-semibold text-sm truncate">{server.name}</p>
                      <div className="flex items-center gap-1 text-discord-text-muted text-xs">
                        <Users size={11} />
                        <span>{memberCount} member{memberCount !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleJoin(server)}
                      disabled={joining === server.id}
                      className="btn-primary text-sm py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <LogIn size={14} />
                      {joining === server.id ? "Joining..." : "Join"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

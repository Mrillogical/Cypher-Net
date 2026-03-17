"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useServerStore } from "@/lib/stores/serverStore";
import { useChannelStore } from "@/lib/stores/channelStore";
import { useAuthStore } from "@/lib/stores/authStore";
import type { Server } from "@/types";
import CreateServerModal from "@/components/server/CreateServerModal";
import DiscoverModal from "@/components/server/DiscoverModal";
import { Plus, Compass, LogOut } from "lucide-react";

const ServerIcon = ({
  server,
  isActive,
  onClick,
}: {
  server: Server;
  isActive: boolean;
  onClick: () => void;
}) => {
  const initials = server.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative flex items-center group" onClick={onClick}>
      {/* Active pill */}
      <div
        className={`absolute -left-3 w-1 rounded-r-full bg-discord-text-primary transition-all duration-200
          ${isActive ? "h-10" : "h-0 group-hover:h-5"}`}
      />
      <button
        title={server.name}
        className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold
          transition-all duration-200 cursor-pointer select-none overflow-hidden
          ${isActive
            ? "rounded-2xl bg-discord-blurple text-white"
            : "bg-discord-bg-secondary hover:rounded-2xl hover:bg-discord-blurple text-discord-text-secondary hover:text-white"
          }`}
      >
        {initials}
      </button>
    </div>
  );
};

export default function ServerSidebar() {
  const router = useRouter();
  const { servers, activeServer, setActiveServer } = useServerStore();
  const { fetchChannels, setActiveChannel } = useChannelStore();
  const { logout } = useAuthStore();
  const [showCreate, setShowCreate] = useState(false);
  const [showDiscover, setShowDiscover] = useState(false);

  const handleSelectServer = async (server: Server) => {
    setActiveServer(server);
    setActiveChannel(server.channels?.[0] ?? null);
    await fetchChannels(server.id);
    const firstChannel = server.channels?.[0];
    if (firstChannel) {
      router.push(`/app/channels/${firstChannel.id}`);
    } else {
      router.push("/app");
    }
  };

  return (
    <>
      <nav className="w-[72px] bg-discord-bg flex flex-col items-center py-3 gap-2 overflow-y-auto flex-shrink-0">
        {/* Home / DMs placeholder */}
        <button
          onClick={() => router.push("/app")}
          className="w-12 h-12 rounded-full bg-discord-bg-secondary hover:rounded-2xl hover:bg-discord-blurple
            flex items-center justify-center transition-all duration-200 text-discord-text-secondary hover:text-white mb-1"
          title="Cypher-Net Home"
        >
          <span className="text-xl">🏠</span>
        </button>

        <div className="w-8 h-px bg-discord-separator" />

        {/* Server list */}
        {servers.map((server) => (
          <ServerIcon
            key={server.id}
            server={server}
            isActive={activeServer?.id === server.id}
            onClick={() => handleSelectServer(server)}
          />
        ))}

        <div className="w-8 h-px bg-discord-separator" />

        {/* Add server */}
        <button
          onClick={() => setShowCreate(true)}
          title="Create a server"
          className="w-12 h-12 rounded-full bg-discord-bg-secondary hover:rounded-2xl hover:bg-discord-green
            flex items-center justify-center transition-all duration-200 text-discord-green hover:text-white"
        >
          <Plus size={20} />
        </button>

        {/* Discover */}
        <button
          onClick={() => setShowDiscover(true)}
          title="Discover servers"
          className="w-12 h-12 rounded-full bg-discord-bg-secondary hover:rounded-2xl hover:bg-discord-blurple
            flex items-center justify-center transition-all duration-200 text-discord-text-secondary hover:text-white"
        >
          <Compass size={20} />
        </button>

        <div className="flex-1" />

        {/* Logout */}
        <button
          onClick={logout}
          title="Log out"
          className="w-12 h-12 rounded-full bg-discord-bg-secondary hover:rounded-2xl hover:bg-discord-red
            flex items-center justify-center transition-all duration-200 text-discord-text-muted hover:text-white"
        >
          <LogOut size={18} />
        </button>
      </nav>

      {showCreate && <CreateServerModal onClose={() => setShowCreate(false)} />}
      {showDiscover && <DiscoverModal onClose={() => setShowDiscover(false)} />}
    </>
  );
}

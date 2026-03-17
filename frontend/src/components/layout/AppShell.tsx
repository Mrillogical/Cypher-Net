"use client";
import { useEffect } from "react";
import ServerSidebar from "./ServerSidebar";
import ChannelSidebar from "./ChannelSidebar";
import MembersSidebar from "./MembersSidebar";
import { useServerStore } from "@/lib/stores/serverStore";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { fetchServers } = useServerStore();

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  return (
    <div className="flex h-screen overflow-hidden bg-discord-bg">
      {/* Col 1 — Server list (72px pill sidebar) */}
      <ServerSidebar />

      {/* Col 2 — Channel list (240px) */}
      <ChannelSidebar />

      {/* Col 3 — Main content area */}
      <main className="flex flex-1 min-w-0">
        {children}
      </main>

      {/* Col 4 — Members list (240px) */}
      <MembersSidebar />
    </div>
  );
}

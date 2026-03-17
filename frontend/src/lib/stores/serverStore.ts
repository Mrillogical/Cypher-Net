import { create } from "zustand";
import api from "@/lib/api";
import type { ServerState } from "@/types";

export const useServerStore = create<ServerState>((set) => ({
  servers: [],
  activeServer: null,
  isLoading: false,

  fetchServers: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get("/api/servers");
      set({ servers: data.data.servers, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setActiveServer: (server) => set({ activeServer: server }),

  addServer: (server) =>
    set((state) => ({ servers: [...state.servers, server] })),

  removeServer: (serverId) =>
    set((state) => ({
      servers: state.servers.filter((s) => s.id !== serverId),
      activeServer: state.activeServer?.id === serverId ? null : state.activeServer,
    })),
}));

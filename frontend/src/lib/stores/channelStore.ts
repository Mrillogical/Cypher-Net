import { create } from "zustand";
import api from "@/lib/api";
import type { ChannelState } from "@/types";

export const useChannelStore = create<ChannelState>((set) => ({
  channels: [],
  activeChannel: null,
  isLoading: false,

  fetchChannels: async (serverId) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get(`/api/servers/${serverId}/channels`);
      set({ channels: data.data.channels, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setActiveChannel: (channel) => set({ activeChannel: channel }),

  addChannel: (channel) =>
    set((state) => ({ channels: [...state.channels, channel] })),

  removeChannel: (channelId) =>
    set((state) => ({
      channels: state.channels.filter((c) => c.id !== channelId),
      activeChannel:
        state.activeChannel?.id === channelId ? null : state.activeChannel,
    })),
}));

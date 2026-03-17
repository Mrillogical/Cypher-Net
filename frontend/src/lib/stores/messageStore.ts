import { create } from "zustand";
import api from "@/lib/api";
import type { Message, MessageState } from "@/types";

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: {},
  hasMore: {},
  isLoading: false,

  fetchMessages: async (channelId, cursor) => {
    set({ isLoading: true });
    try {
      const params = cursor ? `?cursor=${cursor}` : "";
      const { data } = await api.get(`/api/channels/${channelId}/messages${params}`);
      const incoming: Message[] = data.data.messages;
      const hasMore: boolean = data.data.hasMore;

      set((state) => ({
        messages: {
          ...state.messages,
          [channelId]: cursor
            ? [...incoming, ...(state.messages[channelId] || [])]
            : incoming,
        },
        hasMore: { ...state.hasMore, [channelId]: hasMore },
        isLoading: false,
      }));
    } catch {
      set({ isLoading: false });
    }
  },

  addMessage: (message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [message.channelId]: [
          ...(state.messages[message.channelId] || []),
          message,
        ],
      },
    })),

  updateMessage: (message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [message.channelId]: (state.messages[message.channelId] || []).map(
          (m) => (m.id === message.id ? message : m)
        ),
      },
    })),

  removeMessage: (channelId, messageId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: (state.messages[channelId] || []).map((m) =>
          m.id === messageId
            ? { ...m, deleted: true, content: "[Message deleted]" }
            : m
        ),
      },
    })),

  clearChannel: (channelId) =>
    set((state) => {
      const messages = { ...state.messages };
      const hasMore = { ...state.hasMore };
      delete messages[channelId];
      delete hasMore[channelId];
      return { messages, hasMore };
    }),
}));

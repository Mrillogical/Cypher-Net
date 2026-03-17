import { create } from "zustand";
import api from "@/lib/api";
import { disconnectSocket, reconnectSocket } from "@/lib/socket";
import type { AuthState } from "@/types";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  initAuth: async () => {
    set({ isLoading: true });
    const token = localStorage.getItem("token");
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const { data } = await api.get("/api/auth/me");
      set({ user: data.data.user, token, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem("token");
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    const { user, token } = data.data;
    localStorage.setItem("token", token);
    set({ user, token, isAuthenticated: true });
    reconnectSocket();
  },

  register: async (username, email, password) => {
    const { data } = await api.post("/api/auth/register", { username, email, password });
    const { user, token } = data.data;
    localStorage.setItem("token", token);
    set({ user, token, isAuthenticated: true });
    reconnectSocket();
  },

  logout: () => {
    localStorage.removeItem("token");
    disconnectSocket();
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

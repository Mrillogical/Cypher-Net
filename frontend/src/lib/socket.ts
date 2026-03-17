import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000", {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("[Socket] Connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err.message);
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const reconnectSocket = () => {
  disconnectSocket();
  return getSocket();
};

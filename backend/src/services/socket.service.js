const { Server } = require("socket.io");
const { verifyToken } = require("../utils/jwt");
const prisma = require("../utils/prisma");

/**
 * Socket events:
 *  Client → Server:
 *    join_channel     { channelId }
 *    leave_channel    { channelId }
 *    send_message     { channelId, content }
 *    typing_start     { channelId }
 *    typing_stop      { channelId }
 *    delete_message   { channelId, messageId }
 *    edit_message     { channelId, messageId, content }
 *
 *  Server → Client:
 *    new_message      Message object
 *    message_deleted  { messageId, channelId }
 *    message_updated  Message object
 *    user_typing      { userId, username, channelId }
 *    user_stop_typing { userId, channelId }
 *    error            { message }
 */

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // ─── Auth middleware ────────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) return next(new Error("Authentication token required"));

      const decoded = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, username: true },
      });

      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  // ─── Connection handler ─────────────────────────────────────────────────────
  io.on("connection", (socket) => {
    console.log(`[Socket] Connected: ${socket.user.username} (${socket.id})`);

    // ── join_channel ────────────────────────────────────────────────────────
    socket.on("join_channel", async ({ channelId }) => {
      try {
        const access = await hasChannelAccess(socket.user.id, channelId);
        if (!access) return socket.emit("error", { message: "Access denied" });

        socket.join(`channel:${channelId}`);
        console.log(`[Socket] ${socket.user.username} joined channel:${channelId}`);
      } catch (err) {
        console.error("[Socket] join_channel error:", err);
        socket.emit("error", { message: "Failed to join channel" });
      }
    });

    // ── leave_channel ────────────────────────────────────────────────────────
    socket.on("leave_channel", ({ channelId }) => {
      socket.leave(`channel:${channelId}`);
    });

    // ── send_message ─────────────────────────────────────────────────────────
    socket.on("send_message", async ({ channelId, content }) => {
      try {
        if (!content || typeof content !== "string" || !content.trim()) {
          return socket.emit("error", { message: "Message content is required" });
        }
        if (content.trim().length > 4000) {
          return socket.emit("error", { message: "Message too long (max 4000 chars)" });
        }

        const access = await hasChannelAccess(socket.user.id, channelId);
        if (!access) return socket.emit("error", { message: "Access denied" });

        const message = await prisma.message.create({
          data: { channelId, userId: socket.user.id, content: content.trim() },
          include: { user: { select: { id: true, username: true } } },
        });

        // Broadcast to everyone in the channel room (including sender)
        io.to(`channel:${channelId}`).emit("new_message", message);
      } catch (err) {
        console.error("[Socket] send_message error:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // ── edit_message ─────────────────────────────────────────────────────────
    socket.on("edit_message", async ({ channelId, messageId, content }) => {
      try {
        if (!content?.trim()) return socket.emit("error", { message: "Content required" });

        const existing = await prisma.message.findUnique({ where: { id: messageId } });
        if (!existing || existing.channelId !== channelId) {
          return socket.emit("error", { message: "Message not found" });
        }
        if (existing.userId !== socket.user.id) {
          return socket.emit("error", { message: "Cannot edit others' messages" });
        }
        if (existing.deleted) {
          return socket.emit("error", { message: "Cannot edit a deleted message" });
        }

        const updated = await prisma.message.update({
          where: { id: messageId },
          data: { content: content.trim() },
          include: { user: { select: { id: true, username: true } } },
        });

        io.to(`channel:${channelId}`).emit("message_updated", updated);
      } catch (err) {
        console.error("[Socket] edit_message error:", err);
        socket.emit("error", { message: "Failed to edit message" });
      }
    });

    // ── delete_message ────────────────────────────────────────────────────────
    socket.on("delete_message", async ({ channelId, messageId }) => {
      try {
        const existing = await prisma.message.findUnique({
          where: { id: messageId },
          include: { channel: { include: { server: true } } },
        });

        if (!existing || existing.channelId !== channelId) {
          return socket.emit("error", { message: "Message not found" });
        }

        const isAuthor = existing.userId === socket.user.id;
        const isServerOwner = existing.channel.server.ownerId === socket.user.id;

        if (!isAuthor && !isServerOwner) {
          return socket.emit("error", { message: "Not authorized" });
        }

        await prisma.message.update({
          where: { id: messageId },
          data: { deleted: true, content: "[Message deleted]" },
        });

        io.to(`channel:${channelId}`).emit("message_deleted", { messageId, channelId });
      } catch (err) {
        console.error("[Socket] delete_message error:", err);
        socket.emit("error", { message: "Failed to delete message" });
      }
    });

    // ── typing indicators ────────────────────────────────────────────────────
    socket.on("typing_start", ({ channelId }) => {
      socket.to(`channel:${channelId}`).emit("user_typing", {
        userId: socket.user.id,
        username: socket.user.username,
        channelId,
      });
    });

    socket.on("typing_stop", ({ channelId }) => {
      socket.to(`channel:${channelId}`).emit("user_stop_typing", {
        userId: socket.user.id,
        channelId,
      });
    });

    // ── disconnect ────────────────────────────────────────────────────────────
    socket.on("disconnect", (reason) => {
      console.log(`[Socket] Disconnected: ${socket.user.username} — ${reason}`);
    });
  });

  return io;
};

/** Helper: check if a user can access a channel (must be server member) */
async function hasChannelAccess(userId, channelId) {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    select: { serverId: true },
  });
  if (!channel) return false;

  const member = await prisma.serverMember.findUnique({
    where: { serverId_userId: { serverId: channel.serverId, userId } },
  });
  return !!member;
}

module.exports = { initSocket };

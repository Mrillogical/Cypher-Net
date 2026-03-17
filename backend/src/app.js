const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const serverRoutes = require("./routes/server.routes");
const channelRoutes = require("./routes/channel.routes");
const messageRoutes = require("./routes/message.routes");
const memberRoutes = require("./routes/member.routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

// ─── Core middleware ───────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── API routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/servers", serverRoutes);
app.use("/api/servers/:serverId/channels", channelRoutes);
app.use("/api/channels/:channelId/messages", messageRoutes);
app.use("/api/servers/:serverId/members", memberRoutes);

// ─── Error handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;

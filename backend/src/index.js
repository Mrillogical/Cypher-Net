const http = require("http");
require("dotenv").config();

const app = require("./app");
const { initSocket } = require("./services/socket.service");
const prisma = require("./utils/prisma");

const PORT = process.env.PORT || 4000;

const httpServer = http.createServer(app);

// Attach Socket.io
const io = initSocket(httpServer);

// Make io accessible in controllers if needed via app.locals
app.locals.io = io;

// ─── Start ─────────────────────────────────────────────────────────────────────
const start = async () => {
  try {
    // Verify DB connection
    await prisma.$connect();
    console.log("[DB] PostgreSQL connected via Prisma");

    httpServer.listen(PORT, () => {
      console.log(`[Server] Running on http://localhost:${PORT}`);
      console.log(`[Socket] WebSocket server ready`);
    });
  } catch (err) {
    console.error("[Server] Failed to start:", err);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("[Server] SIGTERM received, shutting down...");
  await prisma.$disconnect();
  httpServer.close(() => process.exit(0));
});

start();

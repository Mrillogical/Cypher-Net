const prisma = require("../utils/prisma");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * GET /api/servers  — servers the authenticated user belongs to
 */
const getServers = async (req, res, next) => {
  try {
    const members = await prisma.serverMember.findMany({
      where: { userId: req.user.id },
      include: {
        server: {
          include: {
            channels: { orderBy: { name: "asc" } },
            _count: { select: { members: true } },
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    });

    const servers = members.map((m) => m.server);
    return sendSuccess(res, { servers });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/servers  — create a server and auto-join as owner
 */
const createServer = async (req, res, next) => {
  try {
    const { name } = req.body;

    const server = await prisma.$transaction(async (tx) => {
      const newServer = await tx.server.create({
        data: {
          name,
          ownerId: req.user.id,
          channels: {
            create: { name: "general", type: "TEXT" },
          },
        },
        include: { channels: true },
      });

      await tx.serverMember.create({
        data: { serverId: newServer.id, userId: req.user.id },
      });

      return newServer;
    });

    return sendSuccess(res, { server }, "Server created", 201);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/servers/:serverId/join
 */
const joinServer = async (req, res, next) => {
  try {
    const { serverId } = req.params;

    const server = await prisma.server.findUnique({
      where: { id: serverId },
      include: { channels: true },
    });

    if (!server) return sendError(res, "Server not found", 404);

    const existing = await prisma.serverMember.findUnique({
      where: { serverId_userId: { serverId, userId: req.user.id } },
    });

    if (existing) return sendError(res, "Already a member of this server", 409);

    await prisma.serverMember.create({
      data: { serverId, userId: req.user.id },
    });

    return sendSuccess(res, { server }, "Joined server successfully");
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/servers/:serverId/leave
 */
const leaveServer = async (req, res, next) => {
  try {
    const { serverId } = req.params;

    const server = await prisma.server.findUnique({ where: { id: serverId } });
    if (!server) return sendError(res, "Server not found", 404);

    if (server.ownerId === req.user.id) {
      return sendError(res, "Owner cannot leave. Transfer ownership or delete the server.", 400);
    }

    await prisma.serverMember.delete({
      where: { serverId_userId: { serverId, userId: req.user.id } },
    });

    return sendSuccess(res, null, "Left server");
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/servers/:serverId  — only the owner can delete
 */
const deleteServer = async (req, res, next) => {
  try {
    const { serverId } = req.params;

    const server = await prisma.server.findUnique({ where: { id: serverId } });
    if (!server) return sendError(res, "Server not found", 404);
    if (server.ownerId !== req.user.id) return sendError(res, "Forbidden", 403);

    await prisma.server.delete({ where: { id: serverId } });

    return sendSuccess(res, null, "Server deleted");
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/servers/discover  — all public servers (not joined)
 */
const discoverServers = async (req, res, next) => {
  try {
    const joinedIds = (
      await prisma.serverMember.findMany({
        where: { userId: req.user.id },
        select: { serverId: true },
      })
    ).map((m) => m.serverId);

    const servers = await prisma.server.findMany({
      where: { id: { notIn: joinedIds } },
      include: { _count: { select: { members: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return sendSuccess(res, { servers });
  } catch (err) {
    next(err);
  }
};

module.exports = { getServers, createServer, joinServer, leaveServer, deleteServer, discoverServers };

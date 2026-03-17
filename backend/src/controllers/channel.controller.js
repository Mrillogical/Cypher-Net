const prisma = require("../utils/prisma");
const { sendSuccess, sendError } = require("../utils/response");

/** Verify the requesting user is a member of the server */
const assertMember = async (userId, serverId) => {
  const member = await prisma.serverMember.findUnique({
    where: { serverId_userId: { serverId, userId } },
  });
  return !!member;
};

/** Verify the requesting user owns the server */
const assertOwner = async (userId, serverId) => {
  const server = await prisma.server.findUnique({ where: { id: serverId } });
  return server?.ownerId === userId;
};

/**
 * GET /api/servers/:serverId/channels
 */
const getChannels = async (req, res, next) => {
  try {
    const { serverId } = req.params;

    if (!(await assertMember(req.user.id, serverId))) {
      return sendError(res, "You are not a member of this server", 403);
    }

    const channels = await prisma.channel.findMany({
      where: { serverId },
      orderBy: { name: "asc" },
    });

    return sendSuccess(res, { channels });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/servers/:serverId/channels
 */
const createChannel = async (req, res, next) => {
  try {
    const { serverId } = req.params;
    const { name, type = "TEXT" } = req.body;

    if (!(await assertOwner(req.user.id, serverId))) {
      return sendError(res, "Only the server owner can create channels", 403);
    }

    const channel = await prisma.channel.create({
      data: { serverId, name: name.toLowerCase().replace(/\s+/g, "-"), type },
    });

    return sendSuccess(res, { channel }, "Channel created", 201);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/servers/:serverId/channels/:channelId
 */
const deleteChannel = async (req, res, next) => {
  try {
    const { serverId, channelId } = req.params;

    if (!(await assertOwner(req.user.id, serverId))) {
      return sendError(res, "Only the server owner can delete channels", 403);
    }

    const channel = await prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel || channel.serverId !== serverId) {
      return sendError(res, "Channel not found", 404);
    }

    // Prevent deleting the last channel
    const count = await prisma.channel.count({ where: { serverId } });
    if (count <= 1) {
      return sendError(res, "Cannot delete the last channel in a server", 400);
    }

    await prisma.channel.delete({ where: { id: channelId } });
    return sendSuccess(res, null, "Channel deleted");
  } catch (err) {
    next(err);
  }
};

module.exports = { getChannels, createChannel, deleteChannel };

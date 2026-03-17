const prisma = require("../utils/prisma");
const { sendSuccess, sendError } = require("../utils/response");

const MESSAGE_LIMIT = 50;

/** Verify the requesting user is a member of the server owning the channel */
const assertChannelAccess = async (userId, channelId) => {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    include: { server: { include: { members: { where: { userId } } } } },
  });

  if (!channel) return { error: "Channel not found", status: 404 };
  if (channel.server.members.length === 0) return { error: "Access denied", status: 403 };
  return { channel };
};

/**
 * GET /api/channels/:channelId/messages?cursor=<messageId>&limit=50
 */
const getMessages = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { cursor, limit = MESSAGE_LIMIT } = req.query;

    const { error, status } = await assertChannelAccess(req.user.id, channelId);
    if (error) return sendError(res, error, status);

    const queryLimit = Math.min(Number(limit), 100);

    const messages = await prisma.message.findMany({
      where: {
        channelId,
        deleted: false,
        ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
      },
      include: {
        user: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: "desc" },
      take: queryLimit,
    });

    // Return in chronological order
    const sorted = messages.reverse();
    const hasMore = messages.length === queryLimit;

    return sendSuccess(res, { messages: sorted, hasMore });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/channels/:channelId/messages
 */
const createMessage = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { content } = req.body;

    const { error, status } = await assertChannelAccess(req.user.id, channelId);
    if (error) return sendError(res, error, status);

    const message = await prisma.message.create({
      data: { channelId, userId: req.user.id, content },
      include: { user: { select: { id: true, username: true } } },
    });

    return sendSuccess(res, { message }, "Message sent", 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/channels/:channelId/messages/:messageId
 */
const updateMessage = async (req, res, next) => {
  try {
    const { channelId, messageId } = req.params;
    const { content } = req.body;

    const existing = await prisma.message.findUnique({ where: { id: messageId } });
    if (!existing || existing.channelId !== channelId) {
      return sendError(res, "Message not found", 404);
    }
    if (existing.userId !== req.user.id) {
      return sendError(res, "You can only edit your own messages", 403);
    }
    if (existing.deleted) return sendError(res, "Cannot edit a deleted message", 400);

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: { content },
      include: { user: { select: { id: true, username: true } } },
    });

    return sendSuccess(res, { message: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/channels/:channelId/messages/:messageId
 */
const deleteMessage = async (req, res, next) => {
  try {
    const { channelId, messageId } = req.params;

    const existing = await prisma.message.findUnique({
      where: { id: messageId },
      include: { channel: { include: { server: true } } },
    });

    if (!existing || existing.channelId !== channelId) {
      return sendError(res, "Message not found", 404);
    }

    const isOwner = existing.userId === req.user.id;
    const isServerOwner = existing.channel.server.ownerId === req.user.id;

    if (!isOwner && !isServerOwner) {
      return sendError(res, "Not authorized to delete this message", 403);
    }

    // Soft delete
    const updated = await prisma.message.update({
      where: { id: messageId },
      data: { deleted: true, content: "[Message deleted]" },
      include: { user: { select: { id: true, username: true } } },
    });

    return sendSuccess(res, { message: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMessages, createMessage, updateMessage, deleteMessage };

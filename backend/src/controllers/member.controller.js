const prisma = require("../utils/prisma");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * GET /api/servers/:serverId/members
 */
const getMembers = async (req, res, next) => {
  try {
    const { serverId } = req.params;

    // Must be a member yourself
    const self = await prisma.serverMember.findUnique({
      where: { serverId_userId: { serverId, userId: req.user.id } },
    });
    if (!self) return sendError(res, "Access denied", 403);

    const members = await prisma.serverMember.findMany({
      where: { serverId },
      include: { user: { select: { id: true, username: true } } },
      orderBy: { joinedAt: "asc" },
    });

    return sendSuccess(res, { members });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMembers };

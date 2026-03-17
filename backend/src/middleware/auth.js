const { verifyToken } = require("../utils/jwt");
const { sendError } = require("../utils/response");
const prisma = require("../utils/prisma");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, "Authorization token required", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, email: true, createdAt: true },
    });

    if (!user) {
      return sendError(res, "User not found", 401);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return sendError(res, "Invalid token", 401);
    }
    if (err.name === "TokenExpiredError") {
      return sendError(res, "Token expired", 401);
    }
    return sendError(res, "Authentication failed", 500);
  }
};

module.exports = { authenticate };

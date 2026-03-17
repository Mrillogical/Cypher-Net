const bcrypt = require("bcryptjs");
const prisma = require("../utils/prisma");
const { generateToken } = require("../utils/jwt");
const { sendSuccess, sendError } = require("../utils/response");

const SALT_ROUNDS = 12;

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existing) {
      const field = existing.email === email ? "email" : "username";
      return sendError(res, `This ${field} is already in use`, 409);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { username, email, passwordHash },
      select: { id: true, username: true, email: true, createdAt: true },
    });

    const token = generateToken({ userId: user.id });

    return sendSuccess(res, { user, token }, "Account created successfully", 201);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return sendError(res, "Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, "Invalid email or password", 401);
    }

    const token = generateToken({ userId: user.id });

    const { passwordHash, ...safeUser } = user;

    return sendSuccess(res, { user: safeUser, token }, "Logged in successfully");
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  return sendSuccess(res, { user: req.user });
};

module.exports = { register, login, getMe };

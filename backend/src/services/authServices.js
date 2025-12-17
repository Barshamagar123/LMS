import prisma from "../config/prisma.js";
import { hashPassword, verifyPassword } from "../utils/hashing.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";

export const registerUser = async (name, email, password, role) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email already registered");

  const hashed = await hashPassword(password);
  const isApproved = role === "INSTRUCTOR" ? false : true; // Student auto-approved

  const user = await prisma.user.create({
    data: { name, email, password: hashed, role, isApproved },
  });

  return user;
};

export const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const valid = await verifyPassword(password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  if (!user.isActive) throw new Error("User account deactivated");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { user, accessToken, refreshToken };
};

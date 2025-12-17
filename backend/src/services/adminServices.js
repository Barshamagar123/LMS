import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";
import { generateOTP } from "../utils/otp.js";
import { sendOTPEmail } from "../utils/email.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";

// -------------------- ADMIN OTP --------------------
export const sendAdminOTP = async (email) => {
  const admin = await prisma.user.findUnique({ where: { email } });

  if (!admin || admin.role !== "ADMIN") {
    throw new Error("Admin not found");
  }

  const otp = generateOTP();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

  await prisma.adminOtp.create({
    data: {
      userId: admin.id,
      otpHash,
      expiresAt,
    },
  });

  await sendOTPEmail(email, otp);

  return { message: "OTP sent to admin email" };
};

export const verifyAdminOTP = async (email, otp) => {
  const admin = await prisma.user.findUnique({ where: { email } });

  if (!admin || admin.role !== "ADMIN") {
    throw new Error("Admin not found");
  }

  const record = await prisma.adminOtp.findFirst({
    where: {
      userId: admin.id,
      used: false,
      expiresAt: { gt: new Date() }, // still valid
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) throw new Error("OTP expired or not found");

  const isValid = await bcrypt.compare(otp, record.otpHash);
  if (!isValid) throw new Error("Invalid OTP");

  await prisma.adminOtp.update({
    where: { id: record.id },
    data: { used: true },
  });

  const accessToken = generateAccessToken(admin);
  const refreshToken = generateRefreshToken(admin);

  return {
    message: "Admin login successful",
    admin,
    accessToken,
    refreshToken,
  };
};

// -------------------- INSTRUCTOR APPROVAL --------------------
export const getPendingInstructors = async () => {
  return prisma.user.findMany({
    where: { role: "INSTRUCTOR", isApproved: false },
    select: { id: true, name: true, email: true, role: true, isApproved: true },
  });
};

export const approveInstructor = async (userId) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isApproved: true },
  });

  return user;
};

export const rejectInstructor = async (userId) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isApproved: false },
  });

  return user;
};

// -------------------- DASHBOARD STATS --------------------
export const getDashboardStats = async () => {
  // Total users
  const totalUsers = await prisma.user.count();

  // Total courses
  const totalCourses = await prisma.course.count();

  // Total revenue (sum of successful payments)
  const revenueAgg = await prisma.payment.aggregate({
    where: { status: "SUCCESS" },
    _sum: { amount: true },
  });
  const totalRevenue = revenueAgg._sum.amount || 0;

  return { totalUsers, totalCourses, totalRevenue };
};
export const getPendingCourses = async () => {
  const courses = await prisma.course.findMany({
    where: { status: "DRAFT" }, // or "PENDING" depending on your design
    include: {
      instructor: { select: { id: true, name: true, email: true } },
      category: { select: { id: true, name: true } },
    },
  });

  return courses;
};
export const changeCourseStatus = async (courseId, status) => {
  const course = await prisma.course.update({
    where: { id: courseId },
    data: { status },
    include: {
      instructor: { select: { id: true, name: true, email: true } },
      category: { select: { id: true, name: true } },
    },
  });

  return course;
};
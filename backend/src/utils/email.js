import nodemailer from "nodemailer";

export const sendOTPEmail = async (to, otp) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true", // <-- FIX
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"EduVerse Admin" <${process.env.SMTP_USER}>`,
    to,
    subject: "Admin Login OTP",
    text: `Your OTP for admin login is ${otp}. It is valid for 5 minutes.`,
  });
};

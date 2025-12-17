// services/instructorService.js
import prisma from "../config/prisma.js";

// Complete instructor profile
export const completeProfile = async (userId, profileData) => {
  const updatedUser = await prisma.user.update({
    where: { id: Number(userId) },
    data: profileData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      title: true,
      bio: true,
      profilePicture: true,
      company: true,
      experience: true,
      website: true,
      linkedin: true,
      github: true,
      twitter: true,
      profileCompleted: true,
      createdAt: true,
      updatedAt: true
    }
  });
  
  return updatedUser;
};

// Get instructor profile
export const getProfile = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      title: true,
      bio: true,
      profilePicture: true,
      company: true,
      experience: true,
      website: true,
      linkedin: true,
      github: true,
      twitter: true,
      profileCompleted: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          courses: true
        }
      }
    }
  });
};

// Update instructor profile
export const updateProfile = async (userId, updates) => {
  return await prisma.user.update({
    where: { id: Number(userId) },
    data: updates,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      title: true,
      bio: true,
      profilePicture: true,
      company: true,
      experience: true,
      website: true,
      linkedin: true,
      github: true,
      twitter: true,
      profileCompleted: true
    }
  });
};
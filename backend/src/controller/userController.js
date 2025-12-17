import * as userService from "../services/userService.js";

// GET /users/me - Get current user profile
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await userService.getUserById(userId);
    res.json(user);
  } catch (err) {
    if (err.message.includes('User not found')) {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

// Existing functions...
export const getAllUsers = async (req, res) => {
  try {
    const users = await userService.fetchAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: "isActive must be a boolean value" });
    }

    const updatedUser = await userService.changeUserStatus(id, isActive);
    res.json(updatedUser);
  } catch (err) {
    if (err.message.includes('Invalid user ID') || err.message.includes('User ID is required')) {
      return res.status(400).json({ message: err.message });
    }
    
    if (err.code === 'P2025') {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(500).json({ message: err.message });
  }
};
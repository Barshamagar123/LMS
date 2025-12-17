import * as adminService from "../services/adminServices.js";


export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await adminService.sendAdminOTP(email);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const data = await adminService.verifyAdminOTP(email, otp);
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
export const getPendingInstructors = async (req, res) => {
  try {
    const instructors = await adminService.getPendingInstructors();
    res.status(200).json(instructors);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


export const approveInstructor = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await adminService.approveInstructor(parseInt(userId));
    res.status(200).json({ message: "Instructor approved", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const rejectInstructor = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await adminService.rejectInstructor(parseInt(userId));
    res.status(200).json({ message: "Instructor rejected", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ---------------- DASHBOARD STATS ----------------
export const getDashboardStats = async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.status(200).json(stats);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ---------------- USER MANAGEMENT ----------------
export const getAllUsers = async (req, res) => {
  try {
    const users = await adminService.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    const user = await adminService.updateUserStatus(parseInt(id), active);
    res.status(200).json({ message: "User status updated", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ---------------- COURSE APPROVAL ----------------
export const getPendingCourses = async (req, res) => {
  try {
    const courses = await adminService.getPendingCourses();
    res.status(200).json(courses);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const approveCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await adminService.changeCourseStatus(parseInt(id), "PUBLISHED");
    res.status(200).json({ message: "Course approved", course });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const rejectCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await adminService.changeCourseStatus(parseInt(id), "REJECTED");
    res.status(200).json({ message: "Course rejected", course });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


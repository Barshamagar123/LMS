import * as authService from "../services/authServices.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await authService.registerUser(name, email, password, role);
    res.status(201).json({ message: "User registered", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.loginUser(email, password);
    res.status(200).json({ user, accessToken, refreshToken });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// src/api/axios.js
import axios from "axios";

// Create an Axios instance
const API = axios.create({
  baseURL: "http://localhost:3000/api", // Your backend API base URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach token automatically
API.interceptors.request.use(
  (config) => {
    // Get token from localStorage (stored separately by AuthContext)
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;

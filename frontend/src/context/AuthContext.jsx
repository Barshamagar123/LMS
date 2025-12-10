// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // UPDATED: Accept both userData and token separately
  const login = (userData, authToken = null) => {
    console.log("AuthContext login called with:", { userData, authToken });
    
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    
    // Use the provided token OR the token from userData
    const actualToken = authToken || userData?.token;
    
    if (actualToken) {
      setToken(actualToken);
      localStorage.setItem("token", actualToken);
      API.defaults.headers.common['Authorization'] = `Bearer ${actualToken}`;
      console.log("Token set in axios headers");
    } else {
      console.warn("No token provided in login!");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete API.defaults.headers.common['Authorization'];
  };

  const updateUser = (newUserData) => {
    setUser(prev => {
      if (!prev) return null;
      
      const updatedUser = {
        ...prev,
        ...newUserData
      };
      
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const isAuthenticated = () => {
    const hasToken = !!(token || user?.token);
    console.log("isAuthenticated check:", { 
      hasToken, 
      token, 
      userToken: user?.token,
      user 
    });
    return hasToken;
  };

  const isAdmin = () => user?.role === "ADMIN";

  const isInstructor = () => user?.role === "INSTRUCTOR";

  const getToken = () => token || user?.token;

  // Initialize axios headers on mount
  useEffect(() => {
    console.log("Initializing axios headers, token:", token);
    if (token) {
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else if (user?.token) {
      API.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    }
  }, [token, user]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      token: token || user?.token,
      login, 
      logout, 
      updateUser,
      isAdmin, 
      isInstructor,
      isAuthenticated,
      getToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export { AuthContext };
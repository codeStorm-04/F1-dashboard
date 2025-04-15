import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const API_URL = "http://localhost:5000/api/auth";

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("AuthProvider mounted, token exists:", !!token);
    if (token) {
      setIsLoggedIn(true);
      fetchUserData();
    }
  }, []);

  const fetchUserData = async () => {
    try {
      console.log("Fetching user data...");
      const response = await axios.get(`${API_URL}/profile`);
      if (response.data.status === "success") {
        console.log("User data fetched successfully:", response.data.data.user);
        setUser(response.data.data.user);
      }
    } catch (error) {
      console.error("Error fetching user data:", error.response || error);
      handleLogout();
    }
  };

  const handleLogin = async (token, userData) => {
    console.log(
      "handleLogin called with token:",
      !!token,
      "userData:",
      userData
    );
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
    setIsLoggedIn(true);
    console.log("Login state updated, isLoggedIn:", true);
  };

  const handleLogout = async () => {
    try {
      console.log("handleLogout called");
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(`${API_URL}/logout`);
      }
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
      setIsLoggedIn(false);
      console.log("Logout completed, isLoggedIn:", false);
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  const value = {
    isLoggedIn,
    user,
    handleLogin,
    handleLogout,
    fetchUserData,
  };

  console.log("AuthContext value updated:", { isLoggedIn, user: !!user });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

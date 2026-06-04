import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check expiry
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          setUser(null);
        } else {
          setUser(decoded);
          // Optionally fetch full user data
        }
      } catch (error) {
        localStorage.removeItem("token");
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/auth/login`,
      { email, password }
    );
    const { token, user } = res.data;
    localStorage.setItem("token", token);

    // Store the full user object including isAdmin
    const userWithToken = {
      ...user,
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
    };
    setUser(userWithToken);

    console.log("User logged in:", userWithToken);
    return userWithToken;
  };

  const register = async (username, email, password) => {
    await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
      username,
      email,
      password,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

import { createContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../services/api";

export const AuthContext = createContext(null);

// ── Helpers ──
const decodeToken = (token) => {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(
      decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      ),
    );
  } catch {
    return null;
  }
};

const isTokenValid = (token) => {
  const decoded = decodeToken(token);
  if (!decoded) return false;
  return decoded.exp * 1000 > Date.now();
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Bootstrap auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem("fa_token");
    const savedUser = localStorage.getItem("fa_user");

    if (token && isTokenValid(token) && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("fa_token");
        localStorage.removeItem("fa_user");
      }
    } else {
      localStorage.removeItem("fa_token");
      localStorage.removeItem("fa_user");
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem("fa_token", token);
    localStorage.setItem("fa_user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authAPI.register(data);
    const { token, user: userData } = res.data;
    localStorage.setItem("fa_token", token);
    localStorage.setItem("fa_user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("fa_token");
    localStorage.removeItem("fa_user");
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

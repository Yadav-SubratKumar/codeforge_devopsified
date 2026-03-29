import React, { createContext, useContext, useState, useCallback } from "react";
import api from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cf_user")); } catch { return null; }
  });

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("cf_token", data.token);
    localStorage.setItem("cf_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (username, email, password) => {
    const { data } = await api.post("/auth/register", { username, email, password });
    localStorage.setItem("cf_token", data.token);
    localStorage.setItem("cf_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try { await api.post("/auth/logout"); } catch {}
    localStorage.removeItem("cf_token");
    localStorage.removeItem("cf_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuth: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

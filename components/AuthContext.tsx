"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  mobile: string;
  profileImage?: string;
  role: "user" | "admin";
  credits?: number;
  total_rentals?: number;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (mobile: string, password: string) => Promise<boolean>;
  register: (userData: {
    mobile: string;
    email: string;
    password: string;
    name: string;
  }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: {
    name?: string;
    email?: string;
    mobile?: string;
    profileImage?: string;
  }) => Promise<boolean>;
  changePassword: (
    oldPassword: string,
    newPassword: string,
  ) => Promise<boolean>;
  updateActivity: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    console.log("AuthContext - Loading user from localStorage...");

    const storedUser = localStorage.getItem("pedalnepal_current_user");
    console.log("AuthContext - Stored user data:", storedUser);

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("AuthContext - Parsed user:", parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("pedalnepal_current_user");
      }
    } else {
      console.log("AuthContext - No stored user found");
    }

    // Always set loading to false after attempting to load
    setLoading(false);
  }, []);

  const saveUser = (userObj: User) => {
    console.log("AuthContext - Saving user:", userObj);
    setUser(userObj);
    localStorage.setItem("pedalnepal_current_user", JSON.stringify(userObj));
    console.log("AuthContext - User saved to localStorage");

    // Track user session for real-time active user monitoring
    updateUserSession(userObj.id);
  };

  const updateUserSession = (userId: string) => {
    const activeSessions = JSON.parse(
      localStorage.getItem("pedalnepal_active_sessions") || "[]",
    );
    const now = new Date().toISOString();

    // Remove old session for this user if exists
    const filteredSessions = activeSessions.filter(
      (session: any) => session.userId !== userId,
    );

    // Add new session
    const newSession = {
      userId,
      lastActivity: now,
      sessionId: `${userId}_${Date.now()}`,
    };

    localStorage.setItem(
      "pedalnepal_active_sessions",
      JSON.stringify([...filteredSessions, newSession]),
    );
  };

  // Login with mobile number and password
  const login = async (mobile: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await api.auth.login(mobile, password);
      if (response.success && response.user) {
        saveUser(response.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register new user
  const register = async (userData: {
    mobile: string;
    email: string;
    password: string;
    name: string;
  }): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await api.auth.signup(userData);
      if (response.success && response.user) {
        saveUser(response.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (user) {
      // Remove user session when logging out and mark as immediately inactive
      const activeSessions = JSON.parse(
        localStorage.getItem("pedalnepal_active_sessions") || "[]",
      );
      const filteredSessions = activeSessions.filter(
        (session: any) => session.userId !== user.id,
      );
      localStorage.setItem(
        "pedalnepal_active_sessions",
        JSON.stringify(filteredSessions),
      );

      // Add to inactive sessions to ensure they show as inactive immediately
      const inactiveSessions = JSON.parse(
        localStorage.getItem("pedalnepal_inactive_sessions") || "[]",
      );
      const now = new Date().toISOString();
      const inactiveSession = {
        userId: user.id,
        loggedOutAt: now,
        sessionId: `${user.id}_${Date.now()}`,
      };
      localStorage.setItem(
        "pedalnepal_inactive_sessions",
        JSON.stringify([...inactiveSessions, inactiveSession]),
      );
    }

    setUser(null);
    localStorage.removeItem("pedalnepal_current_user");
  };

  const updateProfile = async (profile: {
    name?: string;
    email?: string;
    mobile?: string;
    profileImage?: string;
  }): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      const response = await api.user.updateProfile(user.id, profile);
      if (response.success && response.user) {
        saveUser(response.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Update profile error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (
    oldPassword: string,
    newPassword: string,
  ): Promise<boolean> => {
    if (!user) return false;
    try {
      setLoading(true);
      // Call a backend endpoint for password change (to be implemented)
      const response = await api.user.updateProfile(user.id, {
        name: user.name,
        email: user.email,
        mobile: user.mobile,
      });
      if (response.success) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Change password error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateActivity = () => {
    if (user) {
      updateUserSession(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        updateActivity,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

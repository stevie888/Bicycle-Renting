"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authAPI, userAPI } from "@/lib/api";

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

  // Load user from localStorage or external API on mount
  useEffect(() => {
    console.log("AuthContext - Loading user...");
    
    // Try to get current user from localStorage first
    const loadCurrentUser = async () => {
      try {
        // Check localStorage first
        const localUser = localStorage.getItem('user');
        if (localUser) {
          const userData = JSON.parse(localUser);
          console.log("AuthContext - User found in localStorage:", userData);
          setUser(userData);
          setLoading(false);
          return;
        }

        // If no local user, try external API
        const response = await userAPI.getCurrent();
        if (response && response.id) {
          console.log("AuthContext - Current user from API:", response);
          setUser(response);
        } else {
          console.log("AuthContext - No current user found");
        }
      } catch (error) {
        console.log("AuthContext - No current user or API not available:", error);
      }
    };

    loadCurrentUser();
    setLoading(false);
  }, []);

  const saveUser = (userObj: User) => {
    console.log("AuthContext - Saving user:", userObj);
    setUser(userObj);
    
    // Save to localStorage for persistence
    localStorage.setItem('user', JSON.stringify(userObj));
    console.log("AuthContext - User saved to localStorage");

    // Track user session for real-time active user monitoring
    updateUserSession(userObj.id);
  };

  const updateUserSession = (userId: string) => {
    // Session tracking removed - using external API only
    console.log("AuthContext - Session tracking disabled (external API only)");
  };

  // Login with mobile number and password
  const login = async (mobile: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authAPI.login(mobile, password);
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
      const response = await authAPI.signup(userData);
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
    console.log("AuthContext - Logging out user");
    setUser(null);
    
    // Clear localStorage
    localStorage.removeItem('user');
    console.log("AuthContext - User logged out and cleared from localStorage");
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
      const response = await userAPI.update(user.id, profile);
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
      // Call a backend endpoint for password change
      const response = await userAPI.changePassword(user.id, oldPassword, newPassword);
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

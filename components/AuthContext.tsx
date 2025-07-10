"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  name: string;
  email: string;
  mobile: string;
  password: string;
}

interface AuthContextType {
  user: Omit<User, 'password'> | null;
  login: (mobile: string, password: string) => boolean;
  register: (name: string, email: string, mobile: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (profile: { name: string; email: string; mobile: string }) => void;
  changePassword: (oldPassword: string, newPassword: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Persisted user store
let users: User[] = [];

function loadUsers() {
  const stored = localStorage.getItem("popup_users");
  if (stored) {
    users = JSON.parse(stored);
  }
}

function saveUsers() {
  localStorage.setItem("popup_users", JSON.stringify(users));
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [currentPassword, setCurrentPassword] = useState<string>("");

  // Load user and users from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("popup_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    loadUsers();
  }, []);

  const saveUser = (userObj: Omit<User, 'password'>) => {
    setUser(userObj);
    localStorage.setItem("popup_user", JSON.stringify(userObj));
  };

  // Login with mobile number and password
  const login = (mobile: string, password: string) => {
    loadUsers();
    const found = users.find(u => u.mobile === mobile && u.password === password);
    if (found) {
      const userObj = { name: found.name, email: found.email, mobile: found.mobile };
      saveUser(userObj);
      setCurrentPassword(found.password);
      return true;
    }
    return false;
  };

  // Register with unique mobile number
  const register = (name: string, email: string, mobile: string, password: string) => {
    loadUsers();
    if (users.find(u => u.mobile === mobile)) return false;
    users.push({ name, email, mobile, password });
    saveUsers();
    const userObj = { name, email, mobile };
    saveUser(userObj);
    setCurrentPassword(password);
    return true;
  };

  const logout = () => {
    setUser(null);
    setCurrentPassword("");
    localStorage.removeItem("popup_user");
  };

  const updateProfile = (profile: { name: string; email: string; mobile: string }) => {
    if (!user) return;
    loadUsers();
    
    // Find user by current mobile number
    const idx = users.findIndex(u => u.mobile === user.mobile);
    if (idx !== -1) {
      // Update the user in the users array
      users[idx] = { ...users[idx], ...profile };
      saveUsers();
      
      // Update the current user state
      saveUser(profile);
    }
  };

  const changePassword = (oldPassword: string, newPassword: string) => {
    if (!user) return false;
    loadUsers();
    const idx = users.findIndex(u => u.mobile === user.mobile);
    if (idx !== -1 && users[idx].password === oldPassword) {
      users[idx].password = newPassword;
      saveUsers();
      setCurrentPassword(newPassword);
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}; 
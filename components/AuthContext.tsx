"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  mobile: string;
  profileImage?: string;
  role: 'user' | 'admin';
  credits?: number;
  total_rentals?: number;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    name: string;
    mobile: string;
  }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: { 
    name?: string; 
    email?: string; 
    mobile?: string; 
    profileImage?: string;
  }) => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("popup_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem("popup_user");
      }
    }
    setLoading(false);
  }, []);

  const saveUser = (userObj: User) => {
    setUser(userObj);
    localStorage.setItem("popup_user", JSON.stringify(userObj));
  };

  // Login with username/email and password
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await api.auth.login(username, password);
      if (response.success && response.user) {
        saveUser(response.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register new user
  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    name: string;
    mobile: string;
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
      console.error('Registration error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("popup_user");
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
      console.error('Update profile error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;
    try {
      setLoading(true);
      // Call a backend endpoint for password change (to be implemented)
      const response = await api.user.updateProfile(user.id, { 
        name: user.name, 
        email: user.email, 
        mobile: user.mobile
      });
      if (response.success) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Change password error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      updateProfile, 
      changePassword,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}; 
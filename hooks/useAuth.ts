import { useState } from "react";
import { TokenData } from "@/types/api";
import { LoginCredentials } from "@/types/auth";
import { saveTokensToStorage } from "@/utils/token";
import { apiCall } from "@/lib/useFetch";
import  {toast} from "react-hot-toast";
import { getErrorMessage } from "@/utils/axios-error";

export const useAuth = () => {
  const [data, setData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // Try external API first
      console.log("🔐 Attempting external login...");
      const {data: result} = await apiCall<TokenData>("POST", "/auth/login", { body: credentials });
      
      if (result) {
        saveTokensToStorage({
          access_token: result.access_token,
          refresh_token: result.refresh_token,
        });
        toast.success("Login successful");
        setData(result);
        return true;
      }
    } catch (err) {
      console.log("🌐 External API unavailable, trying localStorage...");
    }

    // Fallback to localStorage
    try {
      let users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Create a test user if no users exist
      if (users.length === 0) {
        const testUser = {
          id: "test-user-1",
          full_name: "Test User",
          email: "test@example.com",
          phone: "9841234567",
          password: "123456",
          role: "USER",
          fileKey: "default-profile",
          createdAt: new Date().toISOString(),
        };
        users = [testUser];
        localStorage.setItem('users', JSON.stringify(users));
        console.log("📝 Created test user for demo");
      }
      
      console.log("🔍 Searching for user with email:", credentials.email);
      console.log("🔍 Available users:", users);
      
      // Try to find user by email or phone
      const user = users.find((u: any) => 
        (u.email === credentials.email || u.phone === credentials.email) && 
        u.password === credentials.password
      );
      
      if (user) {
        console.log("✅ User found:", user);
        const tokenData = {
          access_token: `local_${Date.now()}`,
          refresh_token: `refresh_${Date.now()}`,
        };
        saveTokensToStorage(tokenData);
        localStorage.setItem('user', JSON.stringify(user));
        toast.success("Login successful (local)");
        setData(tokenData);
        return true;
      } else {
        console.log("❌ No user found with these credentials");
        toast.error("Invalid credentials");
        return false;
      }
    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message);
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    console.log("📝 Registration started with data:", userData);
    
    try {
      // Prepare payload according to API documentation
      const registerPayload = {
        full_name: userData.name,
        email: userData.email,
        phone: userData.mobile,
        fileKey: "default-profile", // Default profile picture
        password: userData.password,
        role: "USER"
      };

      console.log("📝 Attempting external registration with payload:", registerPayload);
      const {data: result} = await apiCall<TokenData>("POST", "/auth/register", { body: registerPayload });
      
      if (result) {
        saveTokensToStorage({
          access_token: result.access_token,
          refresh_token: result.refresh_token,
        });
        toast.success("Registration successful");
        setData(result);
        return true;
      }
    } catch (err) {
      console.log("🌐 External API unavailable, using localStorage...");
    }

    // Fallback to localStorage
    try {
      console.log("💾 Using localStorage fallback for registration");
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      console.log("💾 Current users in localStorage:", users);
      
      // Check if user already exists
      const existingUser = users.find((u: any) => u.email === userData.email || u.phone === userData.mobile);
      if (existingUser) {
        console.log("❌ User already exists:", existingUser);
        toast.error("User already exists");
        return false;
      }

      // Create new user with API-compatible structure
      const newUser = {
        id: Date.now().toString(),
        full_name: userData.name,
        email: userData.email,
        phone: userData.mobile,
        password: userData.password,
        role: 'USER',
        fileKey: "default-profile",
        createdAt: new Date().toISOString(),
      };

      console.log("✅ Creating new user:", newUser);
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('user', JSON.stringify(newUser));

      const tokenData = {
        access_token: `local_${Date.now()}`,
        refresh_token: `refresh_${Date.now()}`,
      };
      saveTokensToStorage(tokenData);
      
      console.log("🎉 Registration completed successfully");
      toast.success("Registration successful (local)");
      setData(tokenData);
      return true;
    } catch (err) {
      console.error("❌ Registration failed:", err);
      const message = getErrorMessage(err);
      toast.error(message);
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    login,
    register,
  };
};

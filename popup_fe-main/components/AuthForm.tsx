"use client";
import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Link from "next/link";
import { FaGoogle, FaFacebook, FaApple } from "react-icons/fa";

interface AuthFormProps {
  mode: "login" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const { login, register, loading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      let success = false;
      
      if (mode === "login") {
        success = await login(mobile, password);
        if (!success) setError("Invalid mobile or password");
      } else {
        if (!name) {
          setError("Name is required");
          return;
        }
        if (!email) {
          setError("Email is required");
          return;
        }
        if (!mobile) {
          setError("Mobile number is required");
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          return;
        }
        success = await register({
          username: mobile, // Use mobile as username for legacy compatibility
          email,
          password,
          name,
          mobile
        });
        if (!success) setError("Mobile or email already exists");
      }
      
      if (success) {
        setError("");
        router.push("/");
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSent(true);
  };

  if (mode === "login" && showForgot) {
    return (
      <form onSubmit={handleForgot} className="flex flex-col gap-4 max-w-xs mx-auto mt-10 bg-white p-6 rounded-2xl shadow-xl relative">
        <div className="absolute -top-10 left-0 w-full flex justify-center">
          <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60 Q60 0 120 60" fill="#FFD600" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-center mb-2 mt-8">Forgot Password</h1>
        <Input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        {resetSent && <div className="text-green-600 text-center">If this email exists, a reset link has been sent.</div>}
        <Button type="submit" className="mt-2 w-full bg-[#FFD600] text-black">Send reset link</Button>
        <div className="text-center mt-2 text-sm">
          <button type="button" className="text-yellow-600 font-semibold" onClick={() => { setShowForgot(false); setResetSent(false); }}>Back to login</button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen justify-center bg-gray-50 py-8">
      <div className="relative w-full max-w-md">
        {/* Yellow curved header */}
        <div className="absolute -top-16 left-0 w-full flex justify-center z-10">
          <svg width="340" height="100" viewBox="0 0 340 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 100 Q170 0 340 100" fill="#FFD600" />
          </svg>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-8 rounded-2xl shadow-xl relative z-20 mt-12">
          <h1 className="text-2xl font-bold text-center mb-2 mt-8">{mode === "login" ? "Log In" : "Sign Up"}</h1>
          
          {mode === "signup" && (
            <Input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          )}
          
          {mode === "signup" && (
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          )}
          
          <Input
            type="tel"
            placeholder="Mobile Number"
            value={mobile}
            onChange={e => setMobile(e.target.value)}
            required
          />
          
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          
          {mode === "signup" && (
            <Input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          )}
          
          {error && <div className="text-red-500 text-center">{error}</div>}
          
          <Button 
            type="submit" 
            className="mt-2 w-full bg-[#FFD600] text-black rounded-xl shadow-md hover:bg-yellow-400 transition-colors"
            disabled={isSubmitting || loading}
          >
            {isSubmitting ? "Loading..." : mode === "login" ? "Log In" : "Sign Up"}
          </Button>
          
          {mode === "login" && (
            <div className="text-right mt-1 text-sm">
              <button type="button" className="text-yellow-600 font-semibold" onClick={() => setShowForgot(true)}>
                Forgot your password?
              </button>
            </div>
          )}
          
          {/* Social login icons */}
          <div className="flex justify-center gap-4 mt-2">
            <button type="button" className="bg-gray-100 p-2 rounded-full shadow hover:bg-gray-200"><FaGoogle size={20} /></button>
            <button type="button" className="bg-gray-100 p-2 rounded-full shadow hover:bg-gray-200"><FaFacebook size={20} /></button>
            <button type="button" className="bg-gray-100 p-2 rounded-full shadow hover:bg-gray-200"><FaApple size={20} /></button>
          </div>
          
          <div className="text-center mt-2 text-sm">
            {mode === "login" ? (
              <>Do not have an account? <Link href="/signup" className="text-yellow-600 font-semibold">Sign up</Link></>
            ) : (
              <>Already have an account? <Link href="/login" className="text-yellow-600 font-semibold">Log in</Link></>
            )}
          </div>
        </form>
      </div>
    </div>
  );
} 
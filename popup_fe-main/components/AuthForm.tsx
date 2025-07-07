"use client";
import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Link from "next/link";

interface AuthFormProps {
  mode: "login" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const { login, register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let success = false;
    if (mode === "login") {
      success = login(email, password);
      if (!success) setError("Invalid credentials");
    } else {
      if (!name) {
        setError("Name is required");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      success = register(email, password);
      if (!success) setError("Email already registered");
    }
    if (success) {
      setError("");
      router.push("/");
    }
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSent(true);
  };

  if (mode === "login" && showForgot) {
    return (
      <form onSubmit={handleForgot} className="flex flex-col gap-4 max-w-xs mx-auto mt-10 bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-center mb-2">Forgot Password</h1>
        <Input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        {resetSent && <div className="text-green-600 text-center">If this email exists, a reset link has been sent.</div>}
        <Button type="submit" className="mt-2 w-full">Send reset link</Button>
        <div className="text-center mt-2 text-sm">
          <button type="button" className="text-teal-600 font-semibold" onClick={() => { setShowForgot(false); setResetSent(false); }}>Back to login</button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xs mx-auto mt-10 bg-white p-6 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-center mb-2">{mode === "login" ? "Login" : "Signup"}</h1>
      {mode === "signup" && (
        <Input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      )}
      <Input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={e => setEmail(e.target.value)}
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
      <Button type="submit" className="mt-2 w-full">{mode === "login" ? "Login" : "Sign up"}</Button>
      {mode === "login" && (
        <div className="text-right mt-1 text-sm">
          <button type="button" className="text-teal-600 font-semibold" onClick={() => setShowForgot(true)}>
            Forgot password?
          </button>
        </div>
      )}
      <div className="text-center mt-2 text-sm">
        {mode === "login" ? (
          <>Don't have an account? <Link href="/signup" className="text-teal-600 font-semibold">Sign up</Link></>
        ) : (
          <>Alreadys have an account? <Link href="/login" className="text-teal-600 font-semibold">Sign in</Link></>
        )}
      </div>
    </form>
  );
} 
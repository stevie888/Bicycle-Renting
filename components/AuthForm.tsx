"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon, MailIcon, LockIcon, UserIcon, PhoneIcon, UploadIcon, FileIcon, CheckIcon, ArrowRightIcon, UserPlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "./AuthContext";

interface AuthFormProps {
  mode: "login" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    mobile: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [idType, setIdType] = useState("citizenship");

  const { login, register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (mode === "login") {
        await login(formData.mobile, formData.password);
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => router.push("/"), 1000);
      } else {
        // Check if ID is uploaded for signup
        if (!selectedFile) {
          setError("Please upload your ID document for verification");
          setIsLoading(false);
          return;
        }

        await register({
          mobile: formData.mobile,
          email: formData.email,
          password: formData.password,
          name: formData.name,
        });
        setSuccess("Account created successfully! Your ID will be verified within 24 hours.");
        setTimeout(() => router.push("/"), 2000);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a valid file (JPEG, PNG, or PDF)");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      setSelectedFile(file);
      setFileUploaded(true);
      setError("");
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileUploaded(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-neutral-600">
          {mode === "login" 
            ? "Sign in to continue your adventure" 
            : "Join thousands of cyclists exploring Nepal"
          }
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="pl-10 bg-white/50 border-neutral-200 focus:border-primary-500 focus:ring-primary-500 transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <Input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="Enter your mobile number"
                  className="pl-10 bg-white/50 border-neutral-200 focus:border-primary-500 focus:ring-primary-500 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* ID Upload Section */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                ID Verification *
              </label>
              
              {/* ID Type Selection */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "citizenship", label: "Citizenship" },
                  { value: "driving_license", label: "Driving License" },
                  { value: "other", label: "Other ID" }
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setIdType(type.value)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${
                      idType === type.value
                        ? "bg-primary-100 border-primary-300 text-primary-700"
                        : "bg-white/50 border-neutral-200 text-neutral-600 hover:bg-primary-50"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {/* File Upload Area */}
              <div className="relative">
                {!fileUploaded ? (
                  <div className="border-2 border-dashed border-neutral-200 rounded-xl p-6 text-center hover:border-primary-300 transition-colors">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <UploadIcon className="w-8 h-8 text-primary-400 mx-auto mb-3" />
                    <p className="text-sm text-neutral-600 mb-1">
                      <span className="text-primary-600 font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-neutral-500">
                      JPEG, PNG, or PDF (max 5MB)
                    </p>
                  </div>
                ) : (
                  <div className="border border-primary-200 bg-primary-50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <CheckIcon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-primary-700">
                          {selectedFile?.name}
                        </p>
                        <p className="text-xs text-primary-600">
                          {selectedFile?.size ? (selectedFile.size / 1024 / 1024).toFixed(2) : '0'} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="text-warning-500 hover:text-warning-700 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ID Upload Info */}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                <p className="text-xs text-primary-700">
                  <strong>Why we need your ID:</strong> For security and verification purposes. 
                  Your ID will be securely stored and verified within 24 hours.
                </p>
              </div>
            </div>
          </div>
        )}

        {mode === "login" ? (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Mobile Number
            </label>
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                placeholder="Enter your mobile number"
                className="pl-10 bg-white/50 border-neutral-200 focus:border-primary-500 focus:ring-primary-500 transition-all duration-200"
                required
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="pl-10 bg-white/50 border-neutral-200 focus:border-primary-500 focus:ring-primary-500 transition-all duration-200"
                required
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Password
          </label>
          <div className="relative">
            <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              className="pl-10 pr-10 bg-white/50 border-neutral-200 focus:border-primary-500 focus:ring-primary-500 transition-all duration-200"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              {showPassword ? (
                <EyeOffIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {mode === "login" && (
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-neutral-600">Remember me</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-warning-50 border border-warning-200 text-warning-700 px-4 py-3 rounded-lg text-sm animate-slide-up">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-primary-50 border border-primary-200 text-primary-700 px-4 py-3 rounded-lg text-sm animate-slide-up">
            {success}
          </div>
        )}

        {/* Enhanced Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 hover:from-primary-700 hover:via-primary-600 hover:to-secondary-700 text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
          >
            {/* Background Animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-400/20 to-secondary-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Button Content */}
            <div className="relative flex items-center justify-center gap-3">
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{mode === "login" ? "Signing In..." : "Creating Account..."}</span>
                </>
              ) : (
                <>
                  {mode === "login" ? (
                    <>
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                        <ArrowRightIcon className="w-4 h-4 text-white" />
                      </div>
                      <span>Sign In to Continue</span>
                    </>
                  ) : (
                    <>
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                        <UserPlusIcon className="w-4 h-4 text-white" />
                      </div>
                      <span>Create My Account</span>
                    </>
                  )}
                </>
              )}
            </div>
            
            {/* Shine Effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </button>
        </div>
      </form>

      {/* Social Login */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-neutral-500">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="bordered"
          className="bg-white/50 border-neutral-200 hover:bg-primary-50 hover:border-primary-300 transition-all duration-200"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </Button>
        <Button
          variant="bordered"
          className="bg-white/50 border-neutral-200 hover:bg-primary-50 hover:border-primary-300 transition-all duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
          </svg>
          Twitter
        </Button>
      </div>

      {/* Navigation Links */}
      <div className="text-center pt-4 border-t border-neutral-200">
        <p className="text-neutral-600 text-sm">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors underline decoration-2 underline-offset-2">
                Sign up here
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors underline decoration-2 underline-offset-2">
                Sign in here
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
} 
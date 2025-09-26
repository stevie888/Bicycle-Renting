"use client";
import { BikeIcon } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  const { t } = useLanguage();
  // const { login, logout } = useAuth();
  // const handleLogin = (phoneNumber: string, password: string) => {
  //   login(phoneNumber, password);
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse-slow"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-100 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Valley Tour Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white h-full">
            {/* Logo Section - Reduced gap */}
            <div className="mb-8 animate-slide-up">
              <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 mb-6">
                <BikeIcon className="w-8 h-8 text-white" />
                <span className="text-2xl font-bold">pedalNepal</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t("auth.welcomeBack")}
                <br />
                <span className="bg-gradient-to-r from-white to-accent-200 bg-clip-text text-transparent">
                  Valley Tours
                </span>
              </h1>
              <p className="text-xl text-white/90 leading-relaxed">
                Ready to explore the beautiful valleys of Nepal? Sign in to
                continue your adventure.
              </p>
            </div>

            {/* Aesthetic Valley Tour Features - Reduced spacing */}
            <div
              className="space-y-4 animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              {/* Scenic Valley Views */}
              <div className="relative">
                <div className="w-full h-28 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-600 to-primary-500"></div>

                  {/* Valley Hills */}
                  <div className="absolute bottom-0 left-0 w-full h-14">
                    <div className="absolute bottom-0 left-0 w-20 h-12 bg-primary-700 rounded-t-full"></div>
                    <div className="absolute bottom-0 left-16 w-16 h-10 bg-primary-600 rounded-t-full"></div>
                    <div className="absolute bottom-0 left-28 w-24 h-14 bg-primary-700 rounded-t-full"></div>
                    <div className="absolute bottom-0 right-8 w-18 h-11 bg-primary-600 rounded-t-full"></div>
                  </div>

                  {/* Simple Bicycle Icon */}
                  <div className="absolute top-3 right-4">
                    <div className="w-10 h-7 relative">
                      <div className="w-10 h-1.5 bg-white rounded-full"></div>
                      <div className="w-1.5 h-7 bg-white rounded-full absolute top-0 left-2"></div>
                      <div className="w-1.5 h-7 bg-white rounded-full absolute top-0 right-2"></div>
                      <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 left-1 border border-primary-600"></div>
                      <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 right-1 border border-primary-600"></div>
                    </div>
                  </div>

                  <div className="absolute bottom-2 left-4">
                    <h3 className="font-semibold text-lg text-white">
                      Scenic Valley Views
                    </h3>
                    <p className="text-white/80 text-sm">
                      Breathtaking landscapes
                    </p>
                  </div>
                </div>
              </div>

              {/* Cultural Heritage */}
              <div className="relative">
                <div className="w-full h-28 bg-gradient-to-br from-warning-500 to-warning-600 rounded-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-warning-600 to-warning-500"></div>

                  {/* Temple Silhouette */}
                  <div className="absolute bottom-0 left-4 w-8 h-12 bg-warning-700 rounded-t-lg">
                    <div className="w-6 h-2 bg-warning-800 absolute top-0 left-1"></div>
                    <div className="w-2 h-2 bg-warning-800 absolute top-2 left-3"></div>
                  </div>

                  {/* Prayer Flags */}
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                    <div className="flex gap-1">
                      <div className="w-1 h-6 bg-white rounded-full"></div>
                      <div className="w-1 h-8 bg-white rounded-full"></div>
                      <div className="w-1 h-7 bg-white rounded-full"></div>
                      <div className="w-1 h-9 bg-white rounded-full"></div>
                      <div className="w-1 h-6 bg-white rounded-full"></div>
                    </div>
                  </div>

                  <div className="absolute bottom-2 left-4">
                    <h3 className="font-semibold text-lg text-white">
                      Cultural Heritage
                    </h3>
                    <p className="text-white/80 text-sm">
                      Ancient temples & traditions
                    </p>
                  </div>
                </div>
              </div>

              {/* Adventure Trails */}
              <div className="relative">
                <div className="w-full h-28 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary-600 to-secondary-500"></div>

                  {/* Mountain Peaks */}
                  <div className="absolute bottom-0 left-0 w-full h-14">
                    <div className="absolute bottom-0 left-2 w-6 h-10 bg-secondary-700 transform rotate-12"></div>
                    <div className="absolute bottom-0 left-8 w-8 h-12 bg-secondary-600 transform -rotate-6"></div>
                    <div className="absolute bottom-0 left-16 w-7 h-11 bg-secondary-700 transform rotate-8"></div>
                    <div className="absolute bottom-0 right-4 w-5 h-9 bg-secondary-600 transform -rotate-12"></div>
                  </div>

                  {/* Trail Path */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-white/60 rounded-full"></div>

                  <div className="absolute bottom-2 left-4">
                    <h3 className="font-semibold text-lg text-white">
                      Adventure Trails
                    </h3>
                    <p className="text-white/80 text-sm">
                      Explore hidden pathways
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8 animate-slide-up">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-3 rounded-2xl mb-4">
                <BikeIcon className="w-6 h-6" />
                <span className="text-xl font-bold">pedalNepal</span>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                Welcome Back
              </h2>
              <p className="text-neutral-600">
                Sign in to continue your valley adventure
              </p>
            </div>

            {/* Login Form */}
            <div
              className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-strong border border-neutral-200 animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <AuthForm mode="login" />
            </div>

            {/* Additional Info */}
            <div
              className="text-center mt-8 animate-slide-up"
              style={{ animationDelay: "0.3s" }}
            >
              <p className="text-sm text-neutral-600">
                By signing in, you agree to our{" "}
                <a
                  href="#"
                  className="text-primary-600 hover:text-primary-700 font-semibold underline decoration-2 underline-offset-2"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-primary-600 hover:text-primary-700 font-semibold underline decoration-2 underline-offset-2"
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

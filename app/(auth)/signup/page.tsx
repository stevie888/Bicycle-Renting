"use client";
import { BikeIcon } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import AuthForm from "@/components/AuthForm";

export default function SignupPage() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-100 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse-slow" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Valley Tour Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex flex-col justify-start px-12 pt-20 text-white h-full">
            {/* Logo Section - Positioned higher */}
            <div className="mb-8 animate-slide-up">
              <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 mb-6">
                <BikeIcon className="w-8 h-8 text-white" />
                <span className="text-2xl font-bold">pedalNepal</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t('auth.joinThe')}
                <br />
                <span className="bg-gradient-to-r from-white to-accent-200 bg-clip-text text-transparent">
                  {t('auth.valleyAdventure')}
                </span>
              </h1>
              <p className="text-xl text-white/90 leading-relaxed mb-8">
                {t('auth.createAccountMessage')}
              </p>
            </div>

            {/* Bicycle Image - Positioned higher */}
            <div className="animate-slide-up" style={{animationDelay: '0.2s'}}>
              <div className="relative w-full h-64 bg-white/10 rounded-2xl overflow-hidden backdrop-blur-sm border border-white/20">
                {/* Placeholder for bicycle image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3zm5.5-12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                        <path d="M19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z"/>
                        <path d="M12 10.5l-1.5-1.5h-3v-1.5h3l1.5-1.5v3z"/>
                      </svg>
                    </div>
                    <p className="text-white/80 text-sm">{t('auth.bicycleAdventureImage')}</p>
                    <p className="text-white/60 text-xs mt-1">{t('auth.exploringValleys')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8 animate-slide-up">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-3 rounded-2xl mb-4">
                <BikeIcon className="w-6 h-6" />
                <span className="text-xl font-bold">pedalNepal</span>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">{t('auth.joinValleyAdventure')}</h2>
              <p className="text-neutral-600">{t('auth.createAccountToStart')}</p>
            </div>

            {/* Signup Form */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-strong border border-neutral-200 animate-slide-up" style={{animationDelay: '0.1s'}}>
              <AuthForm mode="signup" />
            </div>

            {/* Additional Info */}
            <div className="text-center mt-8 animate-slide-up" style={{animationDelay: '0.3s'}}>
              <p className="text-sm text-neutral-600">
                {t('auth.byCreatingAccount')}{" "}
                <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold underline decoration-2 underline-offset-2">
                  {t('auth.termsOfService')}
                </a>{" "}
                {t('auth.and')}{" "}
                <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold underline decoration-2 underline-offset-2">
                  {t('auth.privacyPolicy')}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
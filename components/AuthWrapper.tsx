"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

interface AuthWrapperProps {
  children: React.ReactNode;
  navbar: React.ReactNode;
  footer: React.ReactNode;
}

export default function AuthWrapper({ children, navbar, footer }: AuthWrapperProps) {
  const pathname = usePathname();
  const { user, updateActivity } = useAuth();
  const [isAuthPage, setIsAuthPage] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsAuthPage(pathname?.startsWith('/login') || pathname?.startsWith('/signup'));
  }, [pathname]);

  // Track user activity when they interact with the app
  useEffect(() => {
    if (!user) return;

    const handleUserActivity = () => {
      updateActivity();
    };

    // Track various user interactions
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Update activity every 5 minutes even if no interaction
    const activityInterval = setInterval(updateActivity, 5 * 60 * 1000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      clearInterval(activityInterval);
    };
  }, [user, updateActivity]);

  // During SSR, render the full layout to avoid hydration mismatch
  if (!isClient) {
    return (
      <div className="relative flex flex-col h-screen">
        {navbar}
        <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
          {children}
        </main>
        {footer}
      </div>
    );
  }

  if (isAuthPage) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="relative flex flex-col h-screen">
      {navbar}
      <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
        {children}
      </main>
      {footer}
    </div>
  );
} 
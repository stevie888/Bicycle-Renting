"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface AuthWrapperProps {
  children: React.ReactNode;
  navbar: React.ReactNode;
  footer: React.ReactNode;
}

export default function AuthWrapper({ children, navbar, footer }: AuthWrapperProps) {
  const pathname = usePathname();
  const [isAuthPage, setIsAuthPage] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsAuthPage(pathname?.startsWith('/login') || pathname?.startsWith('/signup'));
  }, [pathname]);

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
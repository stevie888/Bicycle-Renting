"use client";

import { useAuth } from "./AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requireAdmin = false,
  redirectTo,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || loading) return;

    // Define public routes that don't require authentication
    const publicRoutes = ["/login", "/signup", "/", "/bicycles"];
    const isPublicRoute = publicRoutes.includes(pathname);

    // If route requires authentication and user is not logged in
    if (requireAuth && !user && !isPublicRoute) {
      const redirectPath = redirectTo || "/login";
      console.log(
        "ProtectedRoute: Redirecting to",
        redirectPath,
        "from",
        pathname,
      );
      router.push(redirectPath);
      return;
    }

    // If user is logged in and trying to access auth pages, redirect to home
    if (user && (pathname === "/login" || pathname === "/signup")) {
      console.log(
        "ProtectedRoute: User already logged in, redirecting to home",
      );
      router.push("/");
      return;
    }

    // If route requires admin access and user is not admin
    if (requireAdmin && user && user.role !== "admin") {
      console.log("ProtectedRoute: Admin access required, redirecting to home");
      router.push("/");
      return;
    }
  }, [
    user,
    loading,
    pathname,
    requireAuth,
    requireAdmin,
    redirectTo,
    router,
    isClient,
  ]);

  // Show loading spinner while checking authentication
  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Define public routes that don't require authentication
  const publicRoutes = ["/login", "/signup", "/", "/bicycles"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // If route requires authentication and user is not logged in, don't render children
  if (requireAuth && !user && !isPublicRoute) {
    return null;
  }

  // If user is logged in and trying to access auth pages, don't render children
  if (user && (pathname === "/login" || pathname === "/signup")) {
    return null;
  }

  // If route requires admin access and user is not admin, don't render children
  if (requireAdmin && user && user.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}

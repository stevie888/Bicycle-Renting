"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
} from "@heroui/navbar";
import NextLink from "next/link";
import { useRouter } from "next/navigation";

import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useAuth } from "./AuthContext";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  // More robust role checking
  const isAdmin = user && user.role === 'admin';

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <HeroUINavbar 
      maxWidth="xl" 
      position="sticky"
      className="bg-gradient-to-r from-primary-50 to-accent-50 border-b border-primary-100 shadow-soft"
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-2 max-w-fit">
          <NextLink className="flex flex-col items-center gap-1 pt-8 group" href="/">
            <div className="relative">
              <Logo size={60} />
              <div className="absolute inset-0 bg-primary-500/10 rounded-full scale-110 group-hover:scale-125 transition-transform duration-300"></div>
            </div>
            <div className="flex flex-col items-center -mt-1">
              <p className="font-bold text-primary-700 freestyle-script text-xl group-hover:text-primary-800 transition-colors">
                PaddleNepal
              </p>
              {user && (
                <span className="text-xs text-secondary-600 font-medium">
                  Hello, {user.name}
                </span>
              )}
            </div>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        {!user && (
          <>
            <NavbarItem>
              <NextLink href="/login">
                <Button 
                  variant="ghost" 
                  className="text-secondary-700 hover:text-primary-700 hover:bg-primary-50 transition-colors"
                >
                  Login
                </Button>
              </NextLink>
            </NavbarItem>
            <NavbarItem>
              <NextLink href="/signup">
                <Button 
                  className="bg-primary-600 hover:bg-primary-700 text-white shadow-medium hover:shadow-strong transition-all"
                >
                  Sign Up
                </Button>
              </NextLink>
            </NavbarItem>
          </>
        )}
        {user && (
          <>
            {!isAdmin && (
              <NavbarItem>
                <NextLink href="/bicycles">
                  <Button 
                    variant="ghost" 
                    className="text-secondary-700 hover:text-primary-700 hover:bg-primary-50 transition-colors"
                  >
                    🚴‍♂️ Bicycles
                  </Button>
                </NextLink>
              </NavbarItem>
            )}
            {isAdmin && (
              <NavbarItem>
                <NextLink href="/admin">
                  <Button 
                    variant="ghost" 
                    className="bg-warning-100 text-warning-700 hover:bg-warning-200 hover:text-warning-800 transition-colors"
                  >
                    👨‍💼 Admin
                  </Button>
                </NextLink>
              </NavbarItem>
            )}
            <NavbarItem>
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="text-secondary-700 hover:text-danger-600 hover:bg-danger-50 transition-colors"
              >
                Logout
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>
    </HeroUINavbar>
  );
};

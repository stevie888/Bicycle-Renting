"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
} from "@heroui/navbar";
import { Kbd } from "@heroui/kbd";
import { Input } from "@heroui/input";
import NextLink from "next/link";
import { useRouter } from "next/navigation";

import { SearchIcon, Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useAuth } from "./AuthContext";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  // More robust role checking
  const isAdmin = user && user.role === 'admin';
  
  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex flex-col items-center gap-0" href="/">
            <div className="flex items-center gap-2">
            <Logo />
              <p className="font-bold text-inherit freestyle-script text-2xl mt-2">PopUp</p>
            </div>
            {user && (
              <span className="text-xs text-gray-700 font-semibold mt-1">Hello, {user.name}</span>
            )}
          </NextLink>
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem>
        {!user && (
          <>
            <NavbarItem>
              <NextLink href="/login">
                <Button variant="ghost">Login</Button>
              </NextLink>
            </NavbarItem>
            <NavbarItem>
              <NextLink href="/signup">
                <Button variant="ghost">Sign Up</Button>
              </NextLink>
            </NavbarItem>
          </>
        )}
        {user && (
          <>
            {!isAdmin && (
              <NavbarItem>
                <NextLink href="/umbrellas">
                  <Button variant="ghost">Umbrellas</Button>
                </NextLink>
              </NavbarItem>
            )}
            {isAdmin && (
              <NavbarItem>
                <NextLink href="/admin">
                  <Button variant="ghost" className="bg-red-100 text-red-700 hover:bg-red-200">
                    Admin
                  </Button>
                </NextLink>
              </NavbarItem>
            )}
            <NavbarItem>
              <Button variant="ghost" onClick={handleLogout}>Logout</Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>
    </HeroUINavbar>
  );
};

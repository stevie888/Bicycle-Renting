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

import { SearchIcon, Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useAuth } from "./AuthContext";

export const Navbar = () => {
  const { user, logout } = useAuth();
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

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit freestyle-script text-2xl">PopUp</p>
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
          <NavbarItem>
            <Button variant="ghost" onClick={logout}>Logout</Button>
          </NavbarItem>
        )}
      </NavbarContent>
    </HeroUINavbar>
  );
};

"use client";
import { Home, Wallet, Scan, History, User, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "./AuthContext";
import { useRouter } from "next/navigation";

export default function Footer() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <footer className="w-full gap-4 shadow-lg border-t-1 flex items-center justify-center py-3 px-4">
      <Link href={"/"}>
        <Button isIconOnly radius="full">
          <Home />
        </Button>
      </Link>
      <Link href={"/wallet"}>
        <Button isIconOnly radius="full" size="md">
          <Wallet />
        </Button>
      </Link>
      <Button isIconOnly radius="full" size="lg">
        <Scan />
      </Button>
      <Link href="/history">
        <Button isIconOnly radius="full">
          <History />
        </Button>
      </Link>
      <Link href="/profile">
        <Button isIconOnly radius="full">
          <User />
        </Button>
      </Link>
      {user && (
        <Button 
          isIconOnly 
          radius="full"
          onClick={handleLogout}
          className="text-danger-600 hover:text-danger-700 hover:bg-danger-50 transition-colors"
        >
          <LogOut />
        </Button>
      )}
    </footer>
  );
} 
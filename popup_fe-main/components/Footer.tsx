"use client";
import { Home, Wallet, Scan, History, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Footer() {
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
    </footer>
  );
} 
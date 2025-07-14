"use client";
import { Home, Wallet, Scan, History, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Modal from "@/components/ui/modal";
import ProfilePage from "@/app/profile/page";
import HistoryPage from "@/app/history/page";

export default function Footer() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
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
      <Button isIconOnly radius="full" onClick={() => setHistoryOpen(true)}>
        <History />
      </Button>
      <Button isIconOnly radius="full" onClick={() => setProfileOpen(true)}>
        <User />
      </Button>
      {profileOpen && (
        <Modal isOpen={profileOpen} onClose={() => setProfileOpen(false)} title="My Profile">
          <ProfilePage />
        </Modal>
      )}
      {historyOpen && (
        <Modal isOpen={historyOpen} onClose={() => setHistoryOpen(false)} title="Rental History">
          <HistoryPage />
        </Modal>
      )}
    </footer>
  );
} 
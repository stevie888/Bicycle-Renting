"use client";
import { Home, Wallet, Scan, History, User, LogOut } from "lucide-react";
import Link from "next/link";
import { useAuth } from "./AuthContext";
import { useRouter } from "next/navigation";

export default function Footer() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Only show footer when user is logged in
  if (!loading && !user) {
    return null;
  }

  return (
    <footer className="w-full gap-4 shadow-lg border-t-1 flex items-center justify-center py-3 px-4 bg-white">
      <Link href={"/"}>
        <button 
          type="button"
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Home className="h-5 w-5" />
        </button>
      </Link>
      <Link href={"/wallet"}>
        <button 
          type="button"
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Wallet className="h-5 w-5" />
        </button>
      </Link>
      <button 
        type="button"
        className="p-2 rounded-full hover:bg-gray-100 transition-colors bg-primary-50"
        onClick={() => alert('QR Scanner functionality coming soon!')}
      >
        <Scan className="h-5 w-5" />
      </button>
      <Link href="/history">
        <button 
          type="button"
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <History className="h-5 w-5" />
        </button>
      </Link>
      <Link href="/profile">
        <button 
          type="button"
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <User className="h-5 w-5" />
        </button>
      </Link>
      {!loading && user && (
        <button 
          type="button"
          className="p-2 rounded-full hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
        </button>
      )}
    </footer>
  );
} 
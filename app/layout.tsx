import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import { History, Home, Scan, User, Wallet } from "lucide-react";

import { Providers } from "./providers";
import { AuthProvider } from "@/components/AuthContext";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
  popup,
}: {
  children: React.ReactNode;
  popup: React.ReactNode;
} & any) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers
          popup={popup}
          themeProps={{ attribute: "class", defaultTheme: "light" }}
        >
          <AuthProvider>
          <div className="relative flex flex-col h-screen">
            <Navbar />
            <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
              {children}
            </main>
            <Footer />
          </div>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}

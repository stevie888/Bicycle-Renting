import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import { Providers } from "./providers";
import { AuthProvider } from "@/components/AuthContext";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/Footer";
import AuthWrapper from "@/components/AuthWrapper";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";

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
        suppressHydrationWarning
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
            <AuthWrapper navbar={<Navbar />} footer={<Footer />}>
              {children}
            </AuthWrapper>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}

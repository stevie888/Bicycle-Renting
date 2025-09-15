import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import { Providers } from "./providers";
import { AuthProvider } from "@/components/AuthContext";
import { LanguageProvider } from "@/components/LanguageContext";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/Footer";
import AuthWrapper from "@/components/AuthWrapper";
import TestUtils from "@/components/TestUtils";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";

// Test utilities will be loaded client-side

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
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        suppressHydrationWarning
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers
          themeProps={{ attribute: "class", defaultTheme: "light" }}
        >
          <LanguageProvider>
            <AuthProvider>
              <TestUtils />
              <AuthWrapper navbar={<Navbar />} footer={<Footer />}>
                {children}
              </AuthWrapper>
            </AuthProvider>
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}

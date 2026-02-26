"use client";

import { AuthProvider } from "@/contexts/auth-context";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased bg-[#101012] text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}

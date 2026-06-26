import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import BackgroundParticles from "@/components/BackgroundParticles";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "XIPHOS - Institutional AI Trading Cockpit",
  description: "Advanced AI-powered trading command center for the Xiphos autonomous quantitative trading framework.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative">
        <BackgroundParticles />
        <div className="relative z-10 flex-1 flex flex-col h-full min-h-0">
          {children}
        </div>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";

const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "🏴☠️ THOUSAND SUNNY // SYSTEM_V.5",
  description: "Tactical Operations Dashboard",
  robots: "noindex, nofollow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#030305",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${jetbrains.variable} ${inter.variable} font-mono bg-void text-gray-300 antialiased overflow-hidden`}>
        <div className="scanline-overlay pointer-events-none" />
        <div className="fixed inset-0 bg-grid-pattern opacity-20 pointer-events-none z-0" />
        <div className="relative z-10 h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}

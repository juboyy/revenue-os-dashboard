import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import StoreInitializer from "../components/StoreInitializer";

const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Revenue OS // Multi-Agent Command Center",
  description: "Immersive multi-agent virtual office dashboard with real-time monitoring, memory graphs, and gamification",
  robots: "noindex, nofollow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#060a14",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${jetbrains.variable} ${inter.variable} font-sans bg-void text-gray-300 antialiased`}>
        <StoreInitializer />
        <div className="fixed inset-0 bg-grid-dots pointer-events-none z-0 opacity-40" />
        <div className="relative z-10 h-screen flex">
          <Sidebar />
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

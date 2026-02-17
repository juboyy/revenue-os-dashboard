import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "⛵ Thousand Sunny — revenue-OS Digital Office",
  description:
    "The immersive digital office of the revenue-OS crew. Monitor agents, tasks, and metrics in real-time.",
  keywords: ["revenue-OS", "dashboard", "AI agents", "digital office"],
  robots: "noindex, nofollow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0f1a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased bg-ocean-900 text-gray-200 min-h-screen">
        {/* Ship ambient header */}
        <div className="fixed inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent z-50" />
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { CartProvider } from "@/lib/CartContext";
import { ConditionalNavbar } from "@/components/ConditionalNavbar";
import { CustomCursor, NoiseOverlay } from "@/components/UI";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sustento - The Purest Form of Fruit",
  description: "Revolutionizing healthy snacking with freeze-dried fruits.",
};

export default function RootLayout({
  children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-[#111]`}
    >
      <body className="min-h-full flex flex-col font-sans selection:bg-amber-200 selection:text-black cursor-auto md:cursor-none text-white bg-[#111]">
        <AuthProvider>
          <CartProvider>
            <CustomCursor />
            <NoiseOverlay />
            <ConditionalNavbar />
            <div className="flex-1 flex flex-col relative z-10">
              {children}
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

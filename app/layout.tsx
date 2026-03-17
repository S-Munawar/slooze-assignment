import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";

import Providers from "@/components/Providers";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Slooze Food Ordering",
  description: "Country-scoped food ordering app with RBAC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${playfair.variable} antialiased font-[family-name:var(--font-manrope)]`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

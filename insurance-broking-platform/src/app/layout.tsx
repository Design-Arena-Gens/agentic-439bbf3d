import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AtriSure Nexus | Insurance Broking OS",
  description:
    "AtriSure Nexus is an end-to-end insurance broking operating system with no-code controls, AI copilots, and modular automation for intermediaries.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-night-950 text-surface-50">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-surface-50 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

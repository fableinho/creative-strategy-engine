import type { Metadata } from "next";
import { Geist, Geist_Mono, Jersey_10 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jersey10 = Jersey_10({
  variable: "--font-jersey-10",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Creative Strategy Engine",
  description: "Turn products into endless messaging angles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jersey10.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}

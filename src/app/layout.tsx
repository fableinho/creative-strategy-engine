import type { Metadata } from "next";
import { DM_Mono, Hahmlet } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

const hahmlet = Hahmlet({
  variable: "--font-hahmlet",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "flnt",
  description: "Turn products into endless messaging angles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmMono.variable} ${hahmlet.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

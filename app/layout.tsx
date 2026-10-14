import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pribadi · Manajemen Seragam",
  description: "Stok seragam bersama untuk SD, SMP, dan SMA Pribadi.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

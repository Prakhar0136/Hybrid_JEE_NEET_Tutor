import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JEE & NEET AI Tutor",
  description: "Your personal AI tutor for JEE and NEET exam preparation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

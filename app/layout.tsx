import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LP Radar — Institutional Investor Intelligence",
  description: "Institutional investor intelligence, automated",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NavBar />
        <main style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px 48px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}

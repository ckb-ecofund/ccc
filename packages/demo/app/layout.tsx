import type { Metadata } from "next";
import { ccc } from "@ckb-ccc/connector-react";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CCC Demo",
  description: "A demo for the CCC library",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ccc.Provider>{children}</ccc.Provider>
      </body>
    </html>
  );
}

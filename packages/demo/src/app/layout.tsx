import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { LayoutProvider } from "./layoutProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CCC Demo",
  description: "A demo for the CCC library",
  icons: "/favicon.svg",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="flex min-h-full flex-col">
      <body className={`flex grow flex-col ${inter.className}`}>
        <LayoutProvider>{children}</LayoutProvider>
      </body>
    </html>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/src/context";
import { useEffect } from "react";
import React from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { signer } = useApp();

  useEffect(() => {
    if (!signer) {
      router.push("/");
    }
  }, [signer, router]);

  if (!signer) {
    return <>Disconnected</>;
  }

  return children;
}

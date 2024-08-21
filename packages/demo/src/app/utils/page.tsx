"use client";

import { useApp } from "@/src/context";
import { Dropdown } from "@/src/components/Dropdown";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { icons } from "lucide-react";

const TABS: [string, string, keyof typeof icons][] = [
  ["Hash", "/utils/Hash", "Barcode"],
  ["Mnemonic", "/utils/Mnemonic", "SquareAsterisk"],
  ["Keystore", "/utils/Keystore", "Notebook"],
];

export default function Page() {
  const router = useRouter();
  const { signer } = useApp();

  useEffect(() => {
    if (signer) {
      router.push("/connected");
    }
  }, [signer, router]);

  useEffect(() => {
    TABS.forEach(([_, path]) => router.prefetch(path));
  }, [router]);

  return (
    <Dropdown
      className="my-3 w-60"
      options={TABS.map(([displayName, name, iconName]) => ({
        name,
        displayName,
        iconName,
      }))}
      selected="Select a Tool"
      defaultIcon="PocketKnife"
      onSelect={(name) => router.push(name)}
    />
  );
}

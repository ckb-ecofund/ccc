/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { formatString, useGetExplorerLink } from "@/src/utils";
import { Dropdown } from "@/src/components/Dropdown";
import { useRouter } from "next/navigation";
import { useApp } from "@/src/context";
import { icons } from "lucide-react";

const TABS: [string, string, keyof typeof icons][] = [
  ["Sign", "/connected/Sign", "Signature"],
  ["Transfer", "/connected/Transfer", "ArrowLeftRight"],
  ["Transfer with Lumos", "/connected/TransferLumos", "LampWallDown"],
  ["Transfer xUDT", "/connected/TransferXUdt", "BadgeCent"],
  ["Issue xUDT (SUS)", "/connected/IssueXUdtSus", "Rss"],
  ["Issue xUDT (Type ID)", "/connected/IssueXUdtTypeId", "PencilRuler"],
  ["Hash", "/utils/Hash", "Barcode"],
  ["Mnemonic", "/utils/Mnemonic", "SquareAsterisk"],
  ["Keystore", "/utils/Keystore", "Notebook"],
];

export default function Page() {
  const router = useRouter();
  const { signer, sendMessage } = useApp();

  const { explorerAddress } = useGetExplorerLink();

  const [addresses, setAddresses] = useState<string[]>([]);
  useEffect(() => {
    if (!signer) {
      return;
    }

    signer.getAddresses().then((v) => setAddresses(v));
  }, [signer]);

  useEffect(() => {
    TABS.forEach(([_, path]) => router.prefetch(path));
  }, [router]);

  if (!signer) {
    return undefined;
  }

  return (
    <>
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
      CKB Addresses:
      <Dropdown
        options={addresses.map((address, i) => ({
          name: address,
          displayName: formatString(address),
          iconName: i === 0 ? "HandCoins" : "CircleDollarSign",
        }))}
        selected={addresses[0]}
        onSelect={(address) => {
          sendMessage("info", "Address Copied", [explorerAddress(address)]);
          window.navigator.clipboard.writeText(address);
        }}
      />
    </>
  );
}

/* eslint-disable @next/next/no-img-element */
"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { formatString, useGetExplorerLink } from "@/src/utils";
import { Dropdown } from "@/src/components/Dropdown";
import { useRouter } from "next/navigation";
import { useApp } from "@/src/context";
import { icons } from "lucide-react";
import { BigButton } from "@/src/components/BigButton";

const TABS: [ReactNode, string, keyof typeof icons, string][] = [
  ["Sign", "/connected/Sign", "Signature", "text-orange-500"],
  ["Transfer", "/connected/Transfer", "ArrowLeftRight", "text-lime-500"],
  [
    "Transfer with Lumos",
    "/connected/TransferLumos",
    "LampWallDown",
    "text-yellow-500",
  ],
  ["Transfer xUDT", "/connected/TransferXUdt", "BadgeCent", "text-emerald-500"],
  ["Issue xUDT (SUS)", "/connected/IssueXUdtSus", "Rss", "text-sky-500"],
  [
    "Issue xUDT (Type ID)",
    "/connected/IssueXUdtTypeId",
    "PencilRuler",
    "text-blue-500",
  ],
  ["Hash", "/utils/Hash", "Barcode", "text-violet-500"],
  ["Mnemonic", "/utils/Mnemonic", "SquareAsterisk", "text-fuchsia-500"],
  ["Keystore", "/utils/Keystore", "Notebook", "text-rose-500"],
];

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    TABS.forEach(([_, path]) => router.prefetch(path));
  }, [router]);

  return (
    <div className="flex flex-wrap justify-center gap-8 px-4 lg:px-16">
      {TABS.map(([name, link, iconName, classes]) => (
        <BigButton
          key={link}
          size="sm"
          iconName={iconName}
          onClick={() => router.push(link)}
          className={classes}
        >
          {name}
        </BigButton>
      ))}
    </div>
  );
}

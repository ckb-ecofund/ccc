/* eslint-disable @next/next/no-img-element */
"use client";

import { ccc } from "@ckb-ccc/connector-react";
import React, { useEffect } from "react";
import { Key, Wallet } from "lucide-react";
import { BigButton } from "@/src/components/BigButton";
import { useRouter } from "next/navigation";
import { useApp } from "@/src/context";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const { signer } = useApp();

  useEffect(() => {
    if (signer) {
      router.push("/connected");
    }
  }, [signer, router]);

  useEffect(() => {
    router.prefetch("/connectPrivateKey");
  }, [router]);

  const { open } = ccc.useCcc();

  return (
    <>
      <div className="my-4 flex grow flex-col items-center justify-center gap-8 md:flex-row md:gap-32">
        <BigButton className="shadow-md" onClick={open}>
          <Wallet className="mb-4 h-16 w-16 md:h-20 md:w-20" />
          Connect Wallet
        </BigButton>
        <BigButton
          className="shadow-md"
          onClick={() => router.push("/connectPrivateKey")}
        >
          <Key className="mb-4 h-16 w-16 md:h-20 md:w-20" />
          Connect
          <br className="md:hidden" /> Private Key
        </BigButton>
      </div>
      <Link
        href="/utils"
        className="mb-4 rounded rounded-full bg-white px-4 py-2 shadow"
        prefetch={true}
      >
        Skip Connecting
      </Link>
    </>
  );
}

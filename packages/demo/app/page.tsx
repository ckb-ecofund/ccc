"use client";

import { ccc } from "@ckb-ccc/ccc";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <button
        className="rounded-full bg-black px-4 py-2 text-white"
        onClick={() => console.log(ccc)}
      >
        Connect Metamask
      </button>
    </main>
  );
}

"use client";

import { EIP6963Signer, ccc } from "@ckb-ccc/ccc";
import React, { useState, useSyncExternalStore } from "react";

const eip6963Manager = new ccc.EIP6963Manager(new ccc.ClientPublicTestnet());

function SignerIcon({
  signer,
  className,
}: {
  signer: EIP6963Signer;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={signer.detail.info.icon}
      alt={signer.detail.info.name}
      className={`h-8 w-8 rounded-full ${className}`}
    />
  );
}

function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`flex items-center rounded-full bg-black px-5 py-3 text-white ${props.className}`}
    />
  );
}

export default function Home() {
  const signers = useSyncExternalStore(
    (...args) => eip6963Manager.subscribeEIP6963Signers(...args),
    () => eip6963Manager.getSigners(),
  );
  const [connectedSigner, setConnectedSigner] =
    useState<ccc.EIP6963Signer | null>(null);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {connectedSigner ? (
        <>
          <SignerIcon signer={connectedSigner} className="mb-1" />
          <span className="mb-1">
            Connected to {connectedSigner.detail.info.name}
          </span>
          <span className="mb-1">{connectedAddress}</span>
          <Button
            className="mb-4"
            onClick={async () => {
              setConnectedSigner(null);
              setConnectedAddress(null);
            }}
          >
            Disconnect
          </Button>
        </>
      ) : null}
      {signers.map((signer) => (
        <Button
          key={signer.detail.info.uuid}
          onClick={async () => {
            await signer.connect();
            const address = await signer.getRecommendedAddress();
            setConnectedSigner(signer);
            setConnectedAddress(address);
          }}
        >
          <SignerIcon signer={signer} className="mr-3" />
          Connect {signer.detail.info.name}
        </Button>
      ))}
    </main>
  );
}

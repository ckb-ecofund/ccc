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
    () => eip6963Manager.getSigners(),
  );
  const [connectedSigner, setConnectedSigner] =
    useState<ccc.EIP6963Signer | null>(null);
  const [connectedInternalAddress, setConnectedInternalAddress] = useState<
    string | null
  >(null);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [messageToSign, setMessageToSign] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {connectedSigner ? (
        <>
          <SignerIcon signer={connectedSigner} className="mb-1" />
          <p className="mb-1">
            Connected to {connectedSigner.detail.info.name}
          </p>
          <p className="mb-1">{connectedInternalAddress}</p>
          <p className="mb-1">{connectedAddress}</p>
          {signature ? (
            <>
              <p className="mb-1">Signature</p>
              <p className="mb-1 w-full whitespace-normal text-balance break-all text-center">
                {signature}
              </p>
            </>
          ) : null}
          <input
            className="mb-1 rounded-full border border-black px-4 py-2"
            type="text"
            value={messageToSign ?? ""}
            onInput={(e) => setMessageToSign(e.currentTarget.value)}
            placeholder="Enter message to sign"
          />
          <p className="mb-4 flex">
            <Button
              className="mr-2"
              onClick={async () => {
                setSignature(
                  await connectedSigner.signMessage(messageToSign ?? ""),
                );
              }}
            >
              Sign
            </Button>
            <Button
              onClick={async () => {
                setConnectedSigner(null);
                setConnectedInternalAddress(null);
                setConnectedAddress(null);
              }}
            >
              Disconnect
            </Button>
          </p>
        </>
      ) : null}
      {signers.map((signer) => (
        <Button
          key={signer.detail.info.uuid}
          onClick={async () => {
            await signer.connect();
            const address = await signer.getRecommendedAddress();
            const internalAddress = await signer.getInternalAddress();
            setConnectedSigner(signer);
            setConnectedInternalAddress(internalAddress);
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

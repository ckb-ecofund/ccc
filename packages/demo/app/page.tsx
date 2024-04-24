"use client";

import { EIP6963Signer, ccc } from "@ckb-ccc/ccc";
import React, { useState, useSyncExternalStore } from "react";
import { common } from "@ckb-lumos/common-scripts";
import { TransactionSkeleton } from "@ckb-lumos/helpers";
import { Indexer } from "@ckb-lumos/ckb-indexer";
import { predefined } from "@ckb-lumos/config-manager";

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

function Sign({ signer }: { signer: ccc.Signer }) {
  const [messageToSign, setMessageToSign] = useState<string>("");
  const [signature, setSignature] = useState<string>("");

  return (
    <>
      {signature !== "" ? (
        <>
          <p className="mb-1">Signature</p>
          <p className="mb-1 w-full whitespace-normal text-balance break-all text-center">
            {signature}
          </p>
        </>
      ) : null}
      <div className="mb-1 flex items-center">
        <input
          className="rounded-full border border-black px-4 py-2"
          type="text"
          value={messageToSign}
          onInput={(e) => setMessageToSign(e.currentTarget.value)}
          placeholder="Enter message to sign"
        />
        <Button
          className="ml-2"
          onClick={async () => {
            setSignature(await signer.signMessage(messageToSign));
          }}
        >
          Sign
        </Button>
      </div>
    </>
  );
}

function Transfer({ signer }: { signer: ccc.Signer }) {
  const [transferTo, setTransferTo] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [hash, setHash] = useState<string>("");

  return (
    <>
      {hash !== "" ? (
        <p className="mb-1 w-full whitespace-normal text-balance break-all text-center">
          {hash}
        </p>
      ) : undefined}
      <div className="mb-1 flex items-center">
        <div className="flex flex-col">
          <input
            className="rounded-full border border-black px-4 py-2"
            type="text"
            value={transferTo}
            onInput={(e) => setTransferTo(e.currentTarget.value)}
            placeholder="Enter address to transfer to"
          />
          <input
            className="mt-1 rounded-full border border-black px-4 py-2"
            type="text"
            value={amount}
            onInput={(e) => setAmount(e.currentTarget.value)}
            placeholder="Enter amount to transfer"
          />
        </div>
        <Button
          className="ml-2"
          onClick={async () => {
            const client = new ccc.ClientPublicTestnet();
            await ccc.Address.fromString(transferTo, client);

            const indexer = new Indexer(client.getUrl());
            let txSkeleton = new TransactionSkeleton({
              cellProvider: indexer,
            });
            txSkeleton = await common.transfer(
              txSkeleton,
              [await signer.getRecommendedAddress()],
              transferTo,
              ccc.parseFixedPoint(amount),
              undefined,
              undefined,
              { config: predefined.AGGRON4 },
            );
            txSkeleton = await common.payFeeByFeeRate(
              txSkeleton,
              [await signer.getRecommendedAddress()],
              BigInt(1500),
              undefined,
              { config: predefined.AGGRON4 },
            );

            const tx = ccc.Transaction.fromLumosSkeleton(txSkeleton);
            setHash(await signer.sendTransaction(tx));
          }}
        >
          Transfer
        </Button>
      </div>
    </>
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {connectedSigner ? (
        <>
          <SignerIcon signer={connectedSigner} className="mb-1" />
          <p className="mb-1">
            Connected to {connectedSigner.detail.info.name}
          </p>
          <p className="mb-1">{connectedInternalAddress}</p>
          <p className="mb-1 text-balance break-all text-center">
            {connectedAddress}
          </p>
          <Sign signer={connectedSigner} />
          <Transfer signer={connectedSigner} />
          <Button
            className="mb-4"
            onClick={async () => {
              setConnectedSigner(null);
              setConnectedInternalAddress(null);
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

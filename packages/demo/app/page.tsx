"use client";

import { ccc } from "@ckb-ccc/connector-react";
import React, { useState } from "react";
import { common } from "@ckb-lumos/common-scripts";
import { TransactionSkeleton } from "@ckb-lumos/helpers";
import { Indexer } from "@ckb-lumos/ckb-indexer";
import { predefined } from "@ckb-lumos/config-manager";

function SignerIcon({
  signer,
  className,
}: {
  signer: ccc.SignerInfo;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={signer.icon}
      alt={signer.name}
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

function Sign({ signerInfo: { signer } }: { signerInfo: ccc.SignerInfo }) {
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

function Transfer({ signerInfo: { signer } }: { signerInfo: ccc.SignerInfo }) {
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
              ccc.fixedPointFrom(amount),
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
  const [connectedSigner, setConnectedSigner] = useState<ccc.SignerInfo | null>(
    null,
  );
  const [connectedInternalAddress, setConnectedInternalAddress] = useState<
    string | null
  >(null);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white p-24">
      {connectedSigner ? (
        <>
          <SignerIcon signer={connectedSigner} className="mb-1" />
          <p className="mb-1">Connected to {connectedSigner.name}</p>
          <p className="mb-1">{connectedInternalAddress}</p>
          <p className="mb-1 text-balance break-all text-center">
            {connectedAddress}
          </p>
          <Sign signerInfo={connectedSigner} />
          <Transfer signerInfo={connectedSigner} />
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
      <ccc.Connector
        onConnected={async ({ signerInfo }) => {
          const address = await signerInfo.signer.getRecommendedAddress();
          const internalAddress = await signerInfo.signer.getInternalAddress();
          setConnectedSigner(signerInfo);
          setConnectedInternalAddress(internalAddress);
          setConnectedAddress(address);
        }}
      />
    </main>
  );
}

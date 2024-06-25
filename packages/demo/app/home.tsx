/* eslint-disable @next/next/no-img-element */
"use client";

import { ccc } from "@ckb-ccc/connector-react";
import React, { ReactNode, useEffect, useState } from "react";
import { common } from "@ckb-lumos/common-scripts";
import { TransactionSkeleton } from "@ckb-lumos/helpers";
import { Indexer } from "@ckb-lumos/ckb-indexer";
import { predefined } from "@ckb-lumos/config-manager";
import { registerCustomLockScriptInfos } from "@ckb-lumos/common-scripts/lib/common";
import { generateDefaultScriptInfos } from "@ckb-ccc/lumos-patches";
import Link from "next/link";
import Image from "next/image";

function WalletIcon({
  wallet,
  className,
}: {
  wallet: ccc.Wallet;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={wallet.icon}
      alt={wallet.name}
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

function Sign() {
  const signer = ccc.useSigner();
  const [messageToSign, setMessageToSign] = useState<string>("");
  const [signature, setSignature] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean | undefined>(undefined);

  return (
    <>
      {signature !== "" ? (
        <>
          <p className="mb-1">Signature</p>
          <p className="mb-1 w-full whitespace-normal text-balance break-all text-center">
            {signature}
          </p>
          {isValid !== undefined ? (
            <p className="mb-1">{isValid ? "Valid" : "Invalid"}</p>
          ) : null}
        </>
      ) : null}
      <div className="mb-1 flex flex-col items-center">
        <input
          className="mb-1 rounded-full border border-black px-4 py-2"
          type="text"
          value={messageToSign}
          onInput={(e) => setMessageToSign(e.currentTarget.value)}
          placeholder="Message to sign and verify"
        />
        <div className="flex">
          <Button
            onClick={async () => {
              if (!signer) {
                return;
              }
              setSignature(
                JSON.stringify(await signer.signMessage(messageToSign)),
              );
              setIsValid(undefined);
            }}
          >
            Sign
          </Button>
          <Button
            className="ml-2"
            onClick={async () => {
              setIsValid(
                await ccc.Signer.verifyMessage(
                  messageToSign,
                  JSON.parse(signature),
                ),
              );
            }}
          >
            Verify
          </Button>
        </div>
      </div>
    </>
  );
}

function Transfer() {
  const signer = ccc.useSigner();
  const [transferTo, setTransferTo] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [hash, setHash] = useState<string>("");
  const [data, setData] = useState<string>("");

  return (
    <>
      {hash !== "" ? (
        <p className="mb-1 w-full whitespace-normal text-balance break-all text-center">
          {hash}
        </p>
      ) : (
        <></>
      )}
      <div className="mb-1 flex flex-col items-center">
        <div className="flex flex-col">
          <input
            className="rounded-full border border-black px-4 py-2"
            type="text"
            value={transferTo}
            onInput={(e) => setTransferTo(e.currentTarget.value)}
            placeholder="Address to transfer to"
          />
          <input
            className="mt-1 rounded-full border border-black px-4 py-2"
            type="text"
            value={amount}
            onInput={(e) => setAmount(e.currentTarget.value)}
            placeholder="Amount to transfer"
          />
          <textarea
            className="mt-1 rounded-3xl border border-black px-4 py-2"
            value={data}
            onInput={(e) => setData(e.currentTarget.value)}
            placeholder="Data in the cell. Hex string will be parsed."
          />
        </div>
        <Button
          className="mt-1"
          onClick={async () => {
            if (!signer) {
              return;
            }
            // Verify destination address
            await ccc.Address.fromString(transferTo, signer.client);

            const fromAddresses = await signer.getAddresses();
            // === Composing transaction with Lumos ===
            registerCustomLockScriptInfos(generateDefaultScriptInfos());
            const indexer = new Indexer(signer.client.url);
            let txSkeleton = new TransactionSkeleton({
              cellProvider: indexer,
            });
            txSkeleton = await common.transfer(
              txSkeleton,
              fromAddresses,
              transferTo,
              ccc.fixedPointFrom(amount),
              undefined,
              undefined,
              { config: signer.client.addressPrefix === 'ckb' ? predefined.LINA : predefined.AGGRON4 },
            );
            txSkeleton = await common.payFeeByFeeRate(
              txSkeleton,
              fromAddresses,
              BigInt(3600),
              undefined,
              { config: signer.client.addressPrefix === 'ckb' ? predefined.LINA : predefined.AGGRON4 },
            );
            // ======

            const tx = ccc.Transaction.fromLumosSkeleton(txSkeleton);

            // CCC transactions are easy to be edited
            const dataBytes = (() => {
              try {
                return ccc.bytesFrom(data);
              } catch (e) {}

              return ccc.bytesFrom(data, "utf8");
            })();
            if (tx.outputs[0].capacity < ccc.fixedPointFrom(dataBytes.length)) {
              throw new Error("Insufficient capacity to store data");
            }
            tx.outputsData[0] = ccc.hexFrom(dataBytes);

            // Sign and send the transaction
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
  const { wallet, open, setClient } = ccc.useCcc();
  const signer = ccc.useSigner();

  const [internalAddress, setInternalAddress] = useState("");
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState(ccc.Zero);
  const [isTestnet] = useState(true);
  const [tab, setTab] = useState("Sign");
  const tabs: [string, ReactNode][] = [
    ["Sign", <Sign key="Sign" />],
    ["Transfer", <Transfer key="Transfer" />],
  ];

  useEffect(() => {
    if (!signer) {
      setInternalAddress("");
      setAddress("");
      return;
    }

    (async () => {
      setInternalAddress(await signer.getInternalAddress());
      setAddress(await signer.getRecommendedAddress());
      setBalance(await signer.getBalance());
    })();
  }, [signer]);

  useEffect(() => {
    setClient(
      isTestnet ? new ccc.ClientPublicTestnet() : new ccc.ClientPublicMainnet(),
    );
  }, [isTestnet, setClient]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white p-24">
      {wallet ? (
        <>
          <WalletIcon wallet={wallet} className="mb-1" />
          <p className="mt-1 text-balance break-all text-center">
            {internalAddress}
          </p>
          <p className="mt-1 text-balance break-all text-center">{address}</p>
          <p className="mt-1">{ccc.fixedPointToString(balance)} CKB</p>
          <Button className="mt-2" onClick={open}>
            {internalAddress.slice(0, 7)}...{internalAddress.slice(-5)}
          </Button>
          <div className="mb-2 mt-2 flex">
            {tabs.map(([name]) => (
              <button
                key={name}
                className={`flex items-center border-b border-black px-5 py-2 text-lg ${tab === name ? "border-b-4" : ""}`}
                onClick={() => setTab(name)}
              >
                {name}
              </button>
            ))}
          </div>
          {tabs.find(([name]) => name === tab)?.[1]}
        </>
      ) : (
        <>
          <img
            src="https://raw.githubusercontent.com/ckb-ecofund/ccc/master/assets/logo.svg"
            alt="CCC Logo"
            className="mb-8 h-32 w-32"
          />
          <Button onClick={open}>Connect Wallet</Button>
        </>
      )}
      <Link className="mt-2" href="https://github.com/ckb-ecofund/ccc" target="_blank">
        <img alt="github" src="/github.png" width={24} height={24} />
      </Link>
    </main>
  );
}

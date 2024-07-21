/* eslint-disable @next/next/no-img-element */
"use client";

import { ccc } from "@ckb-ccc/connector-react";
import React, {
  createElement,
  FunctionComponent,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { Button } from "./components/Button";
import { Transfer } from "./tabs/Transfer";
import { TransferLumos } from "./tabs/TransferLumos";
import { TransferXUdt } from "./tabs/TransferXUdt";
import { IssueXUdtSul } from "./tabs/IssueXUdtSul";
import { IssueXUdtTypeId } from "./tabs/IssueXUdtTypeId";
import { TabProps } from "./types";
import { Sign } from "./tabs/Sign";
import { TextInput } from "./components/Input";
import { Hash } from "./tabs/hash";

const TABS: [string, FunctionComponent<TabProps>][] = [
  ["Sign", Sign],
  ["Hash", Hash],
  ["Transfer", Transfer],
  ["Transfer with Lumos", TransferLumos],
  ["Transfer xUDT", TransferXUdt],
  ["Issue xUDT (SUS)", IssueXUdtSul],
  ["Issue xUDT (Type ID)", IssueXUdtTypeId],
];

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

export default function Home() {
  const [messages, setMessages] = useState<["error" | "info", string][]>([]);
  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      const msg = (() => {
        if (typeof event.reason === "object" && event.reason !== null) {
          const { name, message, stack, cause } = (event as any).reason;
          return JSON.stringify({ name, message, stack, cause });
        }
        if (typeof event.reason === "string") {
          return event.reason;
        }
        return JSON.stringify(event);
      })();
      setMessages((messages) => [["error", msg], ...messages]);
    };

    window.addEventListener("unhandledrejection", handler);
    return () => window.removeEventListener("unhandledrejection", handler);
  }, [setMessages]);

  const { wallet, open, setClient, client } = ccc.useCcc();

  const [privateKey, setPrivateKey] = useState<string>("");
  const [privateKeySigner, setPrivateKeySigner] = useState<
    ccc.Signer | undefined
  >();
  const cccSigner = ccc.useSigner();
  const signer = cccSigner ?? privateKeySigner;

  const [internalAddress, setInternalAddress] = useState("");
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState(ccc.Zero);
  const [isTestnet, setIsTestnet] = useState(true);
  const [tab, setTab] = useState("Sign");

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
    <main className="flex min-h-screen flex-col items-center justify-center bg-white p-6 md:p-24">
      {signer ? (
        <>
          {wallet ? (
            <WalletIcon wallet={wallet} className="mb-1" />
          ) : (
            "Private Key mode"
          )}
          <p className="mt-1 text-balance break-all text-center">
            {internalAddress}
          </p>
          <p className="mt-1 text-balance break-all text-center">{address}</p>
          <p className="mt-1">{ccc.fixedPointToString(balance)} CKB</p>
          {cccSigner ? (
            <Button className="mt-2" onClick={open}>
              {internalAddress.slice(0, 7)}...{internalAddress.slice(-5)}
            </Button>
          ) : (
            <Button
              className="mt-2"
              onClick={() => setPrivateKeySigner(undefined)}
            >
              Disconnect
            </Button>
          )}

          <div className="mb-2 mt-2 flex max-w-full overflow-x-auto pb-1">
            {TABS.map(([name]) => (
              <button
                key={name}
                className={`flex items-center border-b border-black px-5 py-2 text-lg ${tab === name ? "border-b-4" : ""} whitespace-nowrap`}
                onClick={() => setTab(name)}
              >
                {name}
              </button>
            ))}
          </div>
          {ccc.apply(
            (e: FunctionComponent<TabProps>) =>
              createElement(e, {
                sendMessage: (...msg: string[]) =>
                  setMessages((messages) => [
                    ["info", `(${tab}) ${msg.join(" ")}`],
                    ...messages,
                  ]),
                signer,
              }),
            TABS.find(([name]) => name === tab)?.[1],
          )}
        </>
      ) : (
        <>
          <img
            src="https://raw.githubusercontent.com/ckb-ecofund/ccc/master/assets/logo.svg"
            alt="CCC Logo"
            className="mb-8 h-32 w-32"
          />
          <Button onClick={open}>Connect Wallet</Button>
          or
          <TextInput
            state={[privateKey, setPrivateKey]}
            placeholder="Enter your private key here"
          />
          <Button
            className="mt-2"
            onClick={() => {
              try {
                setPrivateKeySigner(
                  new ccc.SignerCkbPrivateKey(client, privateKey),
                );
              } catch (_) {
                setPrivateKeySigner(undefined);
                Promise.reject("Invalid private key");
              }
            }}
          >
            Connect CKB Private Key
          </Button>
        </>
      )}
      <Button onClick={() => setIsTestnet(!isTestnet)} className="mt-4">
        Switch to {isTestnet ? "Mainnet" : "Testnet"}
      </Button>
      <Link
        className="mb-5 mt-10 h-6 w-6"
        href="https://github.com/ckb-ecofund/ccc"
        target="_blank"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" id="github">
          <path d="M7.999 0C3.582 0 0 3.596 0 8.032a8.031 8.031 0 0 0 5.472 7.621c.4.074.546-.174.546-.387 0-.191-.007-.696-.011-1.366-2.225.485-2.695-1.077-2.695-1.077-.363-.928-.888-1.175-.888-1.175-.727-.498.054-.488.054-.488.803.057 1.225.828 1.225.828.714 1.227 1.873.873 2.329.667.072-.519.279-.873.508-1.074-1.776-.203-3.644-.892-3.644-3.969 0-.877.312-1.594.824-2.156-.083-.203-.357-1.02.078-2.125 0 0 .672-.216 2.2.823a7.633 7.633 0 0 1 2.003-.27 7.65 7.65 0 0 1 2.003.271c1.527-1.039 2.198-.823 2.198-.823.436 1.106.162 1.922.08 2.125.513.562.822 1.279.822 2.156 0 3.085-1.87 3.764-3.652 3.963.287.248.543.738.543 1.487 0 1.074-.01 1.94-.01 2.203 0 .215.144.465.55.386A8.032 8.032 0 0 0 16 8.032C16 3.596 12.418 0 7.999 0z"></path>
        </svg>
      </Link>
      {messages.map(([level, msg], i) => (
        <p
          className={`break-all border-b border-gray-400 pb-1 text-center font-bold ${level === "info" ? "text-green-400" : "text-red-400"}`}
          key={messages.length - i}
        >
          {messages.length - i}: {msg}
        </p>
      ))}
    </main>
  );
}

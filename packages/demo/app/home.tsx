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
            const { script: change } = await signer.getRecommendedAddressObj();
            // Verify destination address
            const { script: toLock } = await ccc.Address.fromString(
              transferTo,
              signer.client,
            );

            const dataBytes = (() => {
              try {
                return ccc.bytesFrom(data);
              } catch (e) {}

              return ccc.bytesFrom(data, "utf8");
            })();
            const tx = ccc.Transaction.from({
              outputs: [{ lock: toLock }],
              outputsData: [dataBytes],
            });

            // CCC transactions are easy to be edited
            if (tx.outputs[0].capacity > ccc.fixedPointFrom(amount)) {
              throw new Error("Insufficient capacity to store data");
            }
            tx.outputs[0].capacity = ccc.fixedPointFrom(amount);

            // Complete missing parts for transaction
            await tx.completeInputsByCapacity(signer);
            await tx.completeFeeChangeToLock(signer, change, 1000);

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

function TransferLumos() {
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
              {
                config:
                  signer.client.addressPrefix === "ckb"
                    ? predefined.LINA
                    : predefined.AGGRON4,
              },
            );
            txSkeleton = await common.payFeeByFeeRate(
              txSkeleton,
              fromAddresses,
              BigInt(3600),
              undefined,
              {
                config:
                  signer.client.addressPrefix === "ckb"
                    ? predefined.LINA
                    : predefined.AGGRON4,
              },
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

function TransferXUdt() {
  const signer = ccc.useSigner();
  const [xUdtArgs, setXUdtArgs] = useState<string>("");
  const [transferTo, setTransferTo] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [hash, setHash] = useState<string>("");

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
            value={xUdtArgs}
            onInput={(e) => setXUdtArgs(e.currentTarget.value)}
            placeholder="xUdt args to transfer"
          />
          <input
            className="mt-1 rounded-full border border-black px-4 py-2"
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
        </div>
        <Button
          className="mt-1"
          onClick={async () => {
            if (!signer) {
              return;
            }
            const { script: toScript } = await ccc.Address.fromString(
              transferTo,
              signer.client,
            );
            const { script: change } = await signer.getRecommendedAddressObj();

            const xUdtType = await ccc.Script.fromKnownScript(
              signer.client,
              ccc.KnownScript.XUdt,
              xUdtArgs,
            );

            const tx = ccc.Transaction.from({
              outputs: [
                {
                  lock: toScript,
                  type: xUdtType,
                },
              ],
              outputsData: [ccc.numLeToBytes(amount, 16)],
            });
            await tx.completeInputsByUdt(signer, xUdtType);
            const balanceDiff =
              (await tx.getInputsUdtBalance(signer.client, xUdtType)) -
              tx.getOutputsUdtBalance(xUdtType);
            if (balanceDiff > ccc.Zero) {
              tx.addOutput(
                {
                  lock: change,
                  type: xUdtType,
                },
                ccc.numLeToBytes(balanceDiff, 16),
              );
            }
            await tx.addCellDepsOfKnownScripts(
              signer.client,
              ccc.KnownScript.XUdt,
            );
            await tx.completeInputsByCapacity(signer);
            await tx.completeFeeChangeToLock(signer, change, 1000);

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

function IssueXUdtSul() {
  const signer = ccc.useSigner();
  const [amount, setAmount] = useState<string>("");
  const [hashes, setHashes] = useState<string[]>([]);

  return (
    <>
      {hashes.length !== 0 ? (
        hashes.map((hash, i) => (
          <p
            className="mb-1 w-full whitespace-normal text-balance break-all text-center"
            key={i}
          >
            {hash}
          </p>
        ))
      ) : (
        <></>
      )}
      <div className="mb-1 flex flex-col items-center">
        <div className="flex flex-col">
          You will need to sign three transactions.
          <input
            className="mt-1 rounded-full border border-black px-4 py-2"
            type="text"
            value={amount}
            onInput={(e) => setAmount(e.currentTarget.value)}
            placeholder="Amount to issue"
          />
        </div>
        <Button
          className="mt-1"
          onClick={async () => {
            if (!signer) {
              return;
            }
            const { script } = await signer.getRecommendedAddressObj();

            const susTx = ccc.Transaction.from({
              outputs: [
                {
                  lock: script,
                },
              ],
            });
            await susTx.completeInputsByCapacity(signer);
            await susTx.completeFeeChangeToLock(signer, script, 1000);
            const susTxHash = await signer.sendTransaction(susTx);
            await signer.client.markUnusable({ txHash: susTxHash, index: 0 });

            const singleUseLock = await ccc.Script.fromKnownScript(
              signer.client,
              ccc.KnownScript.SingleUseLock,
              ccc.OutPoint.from({
                txHash: susTxHash,
                index: 0,
              }).toBytes(),
            );
            const lockTx = ccc.Transaction.from({
              outputs: [
                // Owner cell
                {
                  lock: singleUseLock,
                },
              ],
            });
            await lockTx.completeInputsByCapacity(signer);
            await lockTx.completeFeeChangeToLock(signer, script, 1000);
            const lockTxHash = await signer.sendTransaction(lockTx);

            const mintTx = ccc.Transaction.from({
              inputs: [
                // SUS
                {
                  previousOutput: {
                    txHash: susTxHash,
                    index: 0,
                  },
                },
                // Owner cell
                {
                  previousOutput: {
                    txHash: lockTxHash,
                    index: 0,
                  },
                },
              ],
              outputs: [
                // Issued xUDT
                {
                  lock: script,
                  type: await ccc.Script.fromKnownScript(
                    signer.client,
                    ccc.KnownScript.XUdt,
                    singleUseLock.hash(),
                  ),
                },
              ],
              outputsData: [ccc.numLeToBytes(amount, 16)],
            });
            await mintTx.addCellDepsOfKnownScripts(
              signer.client,
              ccc.KnownScript.SingleUseLock,
              ccc.KnownScript.XUdt,
            );
            await mintTx.completeInputsByCapacity(signer);
            await mintTx.completeFeeChangeToLock(signer, script, 1000);
            const mintTxHash = await signer.sendTransaction(mintTx);

            setHashes([susTxHash, lockTxHash, mintTxHash]);
          }}
        >
          Issue
        </Button>
      </div>
    </>
  );
}

function IssueXUdtTypeId() {
  const signer = ccc.useSigner();

  const [typeIdArgs, setTypeIdArgs] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [hashes, setHashes] = useState<string[]>([]);

  return (
    <>
      {hashes.length !== 0 ? (
        hashes.map((hash, i) => (
          <p
            className="mb-1 w-full whitespace-normal text-balance break-all text-center"
            key={i}
          >
            {hash}
          </p>
        ))
      ) : (
        <></>
      )}
      <div className="mb-1 flex flex-col items-center">
        <div className="flex flex-col">
          You will need to sign two or three transactions.
          <input
            className="mt-1 rounded-full border border-black px-4 py-2"
            type="text"
            value={typeIdArgs}
            onInput={(e) => setTypeIdArgs(e.currentTarget.value)}
            placeholder="Type ID args, empty to create new"
          />
          <input
            className="mt-1 rounded-full border border-black px-4 py-2"
            type="text"
            value={amount}
            onInput={(e) => setAmount(e.currentTarget.value)}
            placeholder="Amount to issue"
          />
        </div>
        <Button
          className="mt-1"
          onClick={async () => {
            if (!signer) {
              return;
            }
            const hashes: ccc.Hex[] = [];
            const { script } = await signer.getRecommendedAddressObj();

            const typeId = await (async () => {
              if (typeIdArgs !== "") {
                return ccc.Script.fromKnownScript(
                  signer.client,
                  ccc.KnownScript.TypeId,
                  typeIdArgs,
                );
              }
              const typeIdTx = ccc.Transaction.from({
                outputs: [
                  {
                    lock: script,
                    type: await ccc.Script.fromKnownScript(
                      signer.client,
                      ccc.KnownScript.TypeId,
                      "00".repeat(32),
                    ),
                  },
                ],
              });
              await typeIdTx.completeInputsByCapacity(signer);
              if (!typeIdTx.outputs[0].type) {
                throw new Error("Unexpected disappeared output");
              }
              typeIdTx.outputs[0].type.args = ccc.ckbHash(
                typeIdTx.inputs[0].toBytes(),
                ccc.numLeToBytes(0, 8),
              );
              await typeIdTx.completeFeeChangeToLock(signer, script, 1000);
              hashes.push(await signer.sendTransaction(typeIdTx));
              return typeIdTx.outputs[0].type;
            })();

            const outputTypeLock = await ccc.Script.fromKnownScript(
              signer.client,
              ccc.KnownScript.OutputTypeProxyLock,
              typeId.hash(),
            );
            const lockTx = ccc.Transaction.from({
              outputs: [
                // Owner cell
                {
                  lock: outputTypeLock,
                },
              ],
            });
            await lockTx.completeInputsByCapacity(signer);
            await lockTx.completeFeeChangeToLock(signer, script, 1000);
            const lockTxHash = await signer.sendTransaction(lockTx);

            const typeIdCell =
              await signer.client.findSingletonCellByType(typeId);
            if (!typeIdCell) {
              throw new Error("Type ID cell not found");
            }
            const mintTx = ccc.Transaction.from({
              inputs: [
                // Type ID
                {
                  previousOutput: typeIdCell.outPoint,
                },
                // Owner cell
                {
                  previousOutput: {
                    txHash: lockTxHash,
                    index: 0,
                  },
                },
              ],
              outputs: [
                // Keep the Type ID cell
                typeIdCell.cellOutput,
                // Issued xUDT
                {
                  lock: script,
                  type: await ccc.Script.fromKnownScript(
                    signer.client,
                    ccc.KnownScript.XUdt,
                    outputTypeLock.hash(),
                  ),
                },
              ],
              outputsData: [
                typeIdCell.outputData,
                ccc.numLeToBytes(amount, 16),
              ],
            });
            await mintTx.addCellDepsOfKnownScripts(
              signer.client,
              ccc.KnownScript.OutputTypeProxyLock,
              ccc.KnownScript.XUdt,
            );
            await mintTx.completeInputsByCapacity(signer);
            await mintTx.completeFeeChangeToLock(signer, script, 1000);
            const mintTxHash = await signer.sendTransaction(mintTx);

            setHashes([typeId.args, ...hashes, lockTxHash, mintTxHash]);
          }}
        >
          Issue
        </Button>
      </div>
    </>
  );
}

export default function Home() {
  const [error, setError] = useState<string | undefined>(undefined);
  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      const { name, message, stack, cause } = event.reason as Error;
      setError(JSON.stringify({ name, message, stack, cause }));
    };

    window.addEventListener("unhandledrejection", handler);
    return () => window.removeEventListener("unhandledrejection", handler);
  }, []);

  const { wallet, open, setClient } = ccc.useCcc();
  const signer = ccc.useSigner();

  const [internalAddress, setInternalAddress] = useState("");
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState(ccc.Zero);
  const [isTestnet] = useState(true);
  const [tab, setTab] = useState("Sign");
  /* eslint-disable react/jsx-key */
  const tabs: [string, ReactNode][] = [
    ["Sign", <Sign />],
    ["Transfer", <Transfer />],
    ["Transfer with Lumos", <TransferLumos />],
    ["Transfer xUDT", <TransferXUdt />],
    ["Issue xUDT (SUS)", <IssueXUdtSul />],
    ["Issue xUDT (Type ID)", <IssueXUdtTypeId />],
  ];
  /* eslint-enable react/jsx-key */

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
          <div className="mb-2 mt-2 flex max-w-full overflow-x-auto pb-1">
            {tabs.map(([name]) => (
              <button
                key={name}
                className={`flex items-center border-b border-black px-5 py-2 text-lg ${tab === name ? "border-b-4" : ""} whitespace-nowrap`}
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
      {error !== undefined ? (
        <p className="mt-4 text-balance break-all text-center font-bold text-red-400">
          {error}
        </p>
      ) : null}
      <Link
        className="mt-10 h-6 w-6"
        href="https://github.com/ckb-ecofund/ccc"
        target="_blank"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" id="github">
          <path d="M7.999 0C3.582 0 0 3.596 0 8.032a8.031 8.031 0 0 0 5.472 7.621c.4.074.546-.174.546-.387 0-.191-.007-.696-.011-1.366-2.225.485-2.695-1.077-2.695-1.077-.363-.928-.888-1.175-.888-1.175-.727-.498.054-.488.054-.488.803.057 1.225.828 1.225.828.714 1.227 1.873.873 2.329.667.072-.519.279-.873.508-1.074-1.776-.203-3.644-.892-3.644-3.969 0-.877.312-1.594.824-2.156-.083-.203-.357-1.02.078-2.125 0 0 .672-.216 2.2.823a7.633 7.633 0 0 1 2.003-.27 7.65 7.65 0 0 1 2.003.271c1.527-1.039 2.198-.823 2.198-.823.436 1.106.162 1.922.08 2.125.513.562.822 1.279.822 2.156 0 3.085-1.87 3.764-3.652 3.963.287.248.543.738.543 1.487 0 1.074-.01 1.94-.01 2.203 0 .215.144.465.55.386A8.032 8.032 0 0 0 16 8.032C16 3.596 12.418 0 7.999 0z"></path>
        </svg>
      </Link>
    </main>
  );
}

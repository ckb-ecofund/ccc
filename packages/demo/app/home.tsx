/* eslint-disable @next/next/no-img-element */
"use client";

import { ccc } from "@ckb-ccc/connector-react";
import React, {
  createElement,
  FunctionComponent,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { common } from "@ckb-lumos/common-scripts";
import { TransactionSkeleton } from "@ckb-lumos/helpers";
import { Indexer } from "@ckb-lumos/ckb-indexer";
import { predefined } from "@ckb-lumos/config-manager";
import { registerCustomLockScriptInfos } from "@ckb-lumos/common-scripts/lib/common";
import { generateDefaultScriptInfos } from "@ckb-ccc/lumos-patches";
import Link from "next/link";

function tokenInfoToBytes(decimals: ccc.NumLike, symbol: string, name: string) {
  const symbolBytes = ccc.bytesFrom(symbol, "utf8");
  const nameBytes = ccc.bytesFrom(name === "" ? symbol : name, "utf8");
  return ccc.bytesConcat(
    ccc.numToBytes(decimals, 1),
    ccc.numToBytes(nameBytes.length, 1),
    nameBytes,
    ccc.numToBytes(symbolBytes.length, 1),
    symbolBytes,
  );
}

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

function Sign({ sendMessage }: { sendMessage: (...msg: string[]) => void }) {
  const signer = ccc.useSigner();
  const [messageToSign, setMessageToSign] = useState<string>("");
  const [signature, setSignature] = useState<string>("");

  return (
    <>
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
              const sig = JSON.stringify(
                await signer.signMessage(messageToSign),
              );
              setSignature(sig);
              sendMessage("Signature:", sig);
            }}
          >
            Sign
          </Button>
          <Button
            className="ml-2"
            onClick={async () => {
              if (
                await ccc.Signer.verifyMessage(
                  messageToSign,
                  JSON.parse(signature),
                )
              ) {
                sendMessage("Valid");
                return;
              }
              throw "Invalid";
            }}
          >
            Verify
          </Button>
        </div>
      </div>
    </>
  );
}

function Transfer({
  sendMessage,
}: {
  sendMessage: (...msg: string[]) => void;
}) {
  const signer = ccc.useSigner();
  const [transferTo, setTransferTo] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [data, setData] = useState<string>("");

  return (
    <>
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
            await tx.completeFeeBy(signer, 1000);

            // Sign and send the transaction
            sendMessage("Transaction sent:", await signer.sendTransaction(tx));
          }}
        >
          Transfer
        </Button>
      </div>
    </>
  );
}

function TransferLumos({
  sendMessage,
}: {
  sendMessage: (...msg: string[]) => void;
}) {
  const signer = ccc.useSigner();
  const [transferTo, setTransferTo] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [data, setData] = useState<string>("");

  return (
    <>
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
            sendMessage("Transaction sent:", await signer.sendTransaction(tx));
          }}
        >
          Transfer
        </Button>
      </div>
    </>
  );
}

function TransferXUdt({
  sendMessage,
}: {
  sendMessage: (...msg: string[]) => void;
}) {
  const signer = ccc.useSigner();
  const [xUdtArgs, setXUdtArgs] = useState<string>("");
  const [transferTo, setTransferTo] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  return (
    <>
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
            await tx.completeFeeBy(signer, 1000);

            // Sign and send the transaction
            sendMessage("Transaction sent:", await signer.sendTransaction(tx));
          }}
        >
          Transfer
        </Button>
      </div>
    </>
  );
}

function IssueXUdtSul({
  sendMessage,
}: {
  sendMessage: (...msg: string[]) => void;
}) {
  const signer = ccc.useSigner();
  const [amount, setAmount] = useState<string>("");
  const [decimals, setDecimals] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [symbol, setSymbol] = useState<string>("");

  return (
    <>
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
          <input
            className="mt-1 rounded-full border border-black px-4 py-2"
            type="text"
            value={decimals}
            onInput={(e) => setDecimals(e.currentTarget.value)}
            placeholder="Decimals of the token"
          />
          <input
            className="mt-1 rounded-full border border-black px-4 py-2"
            type="text"
            value={symbol}
            onInput={(e) => setSymbol(e.currentTarget.value)}
            placeholder="Symbol of the token"
          />
          <input
            className="mt-1 rounded-full border border-black px-4 py-2"
            type="text"
            value={name}
            onInput={(e) => setName(e.currentTarget.value)}
            placeholder="Name of the token, same as symbol if empty"
          />
        </div>
        <Button
          className="mt-1"
          onClick={async () => {
            if (!signer) {
              return;
            }
            if (decimals === "" || symbol === "") {
              throw new Error("Invalid token info");
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
            await susTx.completeFeeBy(signer, 1000);
            const susTxHash = await signer.sendTransaction(susTx);
            sendMessage("Transaction sent:", susTxHash);
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
            await lockTx.completeFeeBy(signer, 1000);
            const lockTxHash = await signer.sendTransaction(lockTx);
            sendMessage("Transaction sent:", lockTxHash);

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
                // xUDT Info
                {
                  lock: script,
                  type: await ccc.Script.fromKnownScript(
                    signer.client,
                    ccc.KnownScript.UniqueType,
                    "00".repeat(32),
                  ),
                },
              ],
              outputsData: [
                ccc.numLeToBytes(amount, 16),
                tokenInfoToBytes(decimals, symbol, name),
              ],
            });
            await mintTx.addCellDepsOfKnownScripts(
              signer.client,
              ccc.KnownScript.SingleUseLock,
              ccc.KnownScript.XUdt,
              ccc.KnownScript.UniqueType,
            );
            await mintTx.completeInputsByCapacity(signer);
            if (!mintTx.outputs[1].type) {
              throw new Error("Unexpected disappeared output");
            }
            mintTx.outputs[1].type!.args = ccc.hexFrom(
              ccc.bytesFrom(ccc.hashTypeId(mintTx.inputs[0], 1)).slice(0, 20),
            );
            await mintTx.completeFeeBy(signer, 1000);
            sendMessage(
              "Transaction sent:",
              await signer.sendTransaction(mintTx),
            );
          }}
        >
          Issue
        </Button>
      </div>
    </>
  );
}

function IssueXUdtTypeId({
  sendMessage,
}: {
  sendMessage: (...msg: string[]) => void;
}) {
  const signer = ccc.useSigner();

  const [typeIdArgs, setTypeIdArgs] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [decimals, setDecimals] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [symbol, setSymbol] = useState<string>("");

  return (
    <>
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
          <input
            className="mt-1 rounded-full border border-black px-4 py-2"
            type="text"
            value={decimals}
            onInput={(e) => setDecimals(e.currentTarget.value)}
            placeholder="Decimals of the token"
          />
          <input
            className="mt-1 rounded-full border border-black px-4 py-2"
            type="text"
            value={symbol}
            onInput={(e) => setSymbol(e.currentTarget.value)}
            placeholder="Symbol of the token"
          />
          <input
            className="mt-1 rounded-full border border-black px-4 py-2"
            type="text"
            value={name}
            onInput={(e) => setName(e.currentTarget.value)}
            placeholder="Name of the token, same as symbol if empty"
          />
        </div>
        <Button
          className="mt-1"
          onClick={async () => {
            if (!signer) {
              return;
            }
            const { script } = await signer.getRecommendedAddressObj();
            if (decimals === "" || symbol === "") {
              throw new Error("Invalid token info");
            }

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
              typeIdTx.outputs[0].type.args = ccc.hashTypeId(
                typeIdTx.inputs[0],
                0,
              );
              await typeIdTx.completeFeeBy(signer, 1000);
              sendMessage(
                "Transaction sent:",
                await signer.sendTransaction(typeIdTx),
              );
              sendMessage("Type ID created: ", typeIdTx.outputs[0].type.args);
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
            await lockTx.completeFeeBy(signer, 1000);
            const lockTxHash = await signer.sendTransaction(lockTx);
            sendMessage("Transaction sent:", lockTxHash);

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
                // xUDT Info
                {
                  lock: script,
                  type: await ccc.Script.fromKnownScript(
                    signer.client,
                    ccc.KnownScript.UniqueType,
                    "00".repeat(32),
                  ),
                },
              ],
              outputsData: [
                typeIdCell.outputData,
                ccc.numLeToBytes(amount, 16),
                tokenInfoToBytes(decimals, symbol, name),
              ],
            });
            await mintTx.addCellDepsOfKnownScripts(
              signer.client,
              ccc.KnownScript.OutputTypeProxyLock,
              ccc.KnownScript.XUdt,
              ccc.KnownScript.UniqueType,
            );
            await mintTx.completeInputsByCapacity(signer);
            if (!mintTx.outputs[2].type) {
              throw new Error("Unexpected disappeared output");
            }
            mintTx.outputs[2].type!.args = ccc.hexFrom(
              ccc.bytesFrom(ccc.hashTypeId(mintTx.inputs[0], 2)).slice(0, 20),
            );
            await mintTx.completeFeeBy(signer, 1000);
            sendMessage(
              "Transaction sent:",
              await signer.sendTransaction(mintTx),
            );
          }}
        >
          Issue
        </Button>
      </div>
    </>
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

  const { wallet, open, setClient } = ccc.useCcc();
  const signer = ccc.useSigner();

  const [internalAddress, setInternalAddress] = useState("");
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState(ccc.Zero);
  const [isTestnet, setIsTestnet] = useState(true);
  const [tab, setTab] = useState("Sign");
  const tabs: [
    string,
    FunctionComponent<{
      sendMessage: (...msg: string[]) => void;
    }>,
  ][] = [
    ["Sign", Sign],
    ["Transfer", Transfer],
    ["Transfer with Lumos", TransferLumos],
    ["Transfer xUDT", TransferXUdt],
    ["Issue xUDT (SUS)", IssueXUdtSul],
    ["Issue xUDT (Type ID)", IssueXUdtTypeId],
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-white p-6 md:p-24">
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
          {ccc.apply(
            (
              e: FunctionComponent<{
                sendMessage: (...msg: string[]) => void;
              }>,
            ) =>
              createElement(e, {
                sendMessage: (...msg: string[]) =>
                  setMessages((messages) => [
                    ["info", `(${tab}) ${msg.join(" ")}`],
                    ...messages,
                  ]),
              }),
            tabs.find(([name]) => name === tab)?.[1],
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

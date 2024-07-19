import { useState } from "react";
import { TabProps } from "../types";
import { TextInput } from "../components/Input";
import { Button } from "../components/Button";
import { ccc } from "@ckb-ccc/connector-react";
import { tokenInfoToBytes } from "../utils";

export function IssueXUdtSul({ sendMessage, signer }: TabProps) {
  const [amount, setAmount] = useState<string>("");
  const [decimals, setDecimals] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [symbol, setSymbol] = useState<string>("");

  return (
    <>
      <div className="mb-1 flex flex-col items-center">
        <div className="flex flex-col">
          You will need to sign three transactions.
          <TextInput
            className="mt-1"
            placeholder="Amount to issue"
            state={[amount, setAmount]}
          />
          <TextInput
            className="mt-1"
            placeholder="Decimals of the token"
            state={[decimals, setDecimals]}
          />
          <TextInput
            className="mt-1"
            placeholder="Symbol of the token"
            state={[symbol, setSymbol]}
          />
          <TextInput
            className="mt-1"
            placeholder="Name of the token, same as symbol if empty"
            state={[name, setName]}
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

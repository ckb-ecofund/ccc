import { useState } from "react";
import { TabProps } from "../types";
import { TextInput } from "../components/Input";
import { Button } from "../components/Button";
import { ccc } from "@ckb-ccc/connector-react";
import { tokenInfoToBytes } from "../utils";
import Message from "../components/message";
import Hint from '../components/message';

export function IssueXUdtTypeId({ sendMessage, signer }: TabProps) {
  const [typeIdArgs, setTypeIdArgs] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [decimals, setDecimals] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [symbol, setSymbol] = useState<string>("");

  return (
    <>
      <div className="mb-1 flex flex-col items-center">
        <Message title="Hint" message="You will need to sign two or three transactions." type="info" />
        <div className="flex w-9/12 flex-col items-center gap-1">
          <TextInput
            label="Type ID(options)"
            className="mt-1 w-full"
            placeholder="Type ID args, empty to create new"
            state={[typeIdArgs, setTypeIdArgs]}
          />
          <TextInput
            label="Amount"
            className="mt-1 w-full"
            placeholder="Amount to issue"
            state={[amount, setAmount]}
          />
          <TextInput
            label="Decimals"
            className="mt-1 w-full"
            placeholder="Decimals of the token"
            state={[decimals, setDecimals]}
          />
          <TextInput
            label="Symbol"
            className="mt-1 w-full"
            placeholder="Symbol of the token"
            state={[symbol, setSymbol]}
          />
          <TextInput
            label="Name (options)"
            className="mt-1 w-full"
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

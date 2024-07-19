import { useState } from "react";
import { TabProps } from "../types";
import { TextInput } from "../components/Input";
import { Button } from "../components/Button";
import { ccc } from "@ckb-ccc/connector-react";

export function TransferXUdt({ sendMessage, signer }: TabProps) {
  const [xUdtArgs, setXUdtArgs] = useState<string>("");
  const [transferTo, setTransferTo] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  return (
    <div className="mb-1 flex flex-col items-center">
      <div className="flex flex-col">
        <TextInput
          placeholder="xUdt args to transfer"
          state={[xUdtArgs, setXUdtArgs]}
        />
        <TextInput
          className="mt-1"
          placeholder="Address to transfer to"
          state={[transferTo, setTransferTo]}
        />
        <TextInput
          className="mt-1"
          placeholder="Amount to transfer"
          state={[amount, setAmount]}
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
  );
}

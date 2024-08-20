import { useState } from "react";
import { TabProps } from "../types";
import { TextInput } from "../components/Input";
import { Button } from "../components/Button";
import { ccc } from "@ckb-ccc/connector-react";
import { Textarea } from "../components/Textarea";
import { useGetExplorerLink } from "../utils";

export function TransferXUdt({ sendMessage, signer }: TabProps) {
  const [xUdtArgs, setXUdtArgs] = useState<string>("");
  const [transferTo, setTransferTo] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const { explorerTransaction } = useGetExplorerLink();

  return (
    <div className="mb-1 flex w-9/12 flex-col items-stretch gap-2">
      <TextInput
        label="Args"
        placeholder="xUdt args to transfer"
        state={[xUdtArgs, setXUdtArgs]}
      />
      <Textarea
        label="Address"
        placeholder="Addresses to transfer to, separated by lines"
        state={[transferTo, setTransferTo]}
      />
      <TextInput
        label="amount"
        placeholder="Amount to transfer for each"
        state={[amount, setAmount]}
      />
      <Button
        className="self-center"
        onClick={async () => {
          if (!signer) {
            return;
          }
          const toAddresses = await Promise.all(
            transferTo
              .split("\n")
              .map((addr) => ccc.Address.fromString(addr, signer.client)),
          );
          const { script: change } = await signer.getRecommendedAddressObj();

          const xUdtType = await ccc.Script.fromKnownScript(
            signer.client,
            ccc.KnownScript.XUdt,
            xUdtArgs,
          );

          const tx = ccc.Transaction.from({
            outputs: toAddresses.map(({ script }) => ({
              lock: script,
              type: xUdtType,
            })),
            outputsData: Array.from(Array(toAddresses.length), () =>
              ccc.numLeToBytes(amount, 16),
            ),
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
          sendMessage(
            "Transaction sent:",
            explorerTransaction(await signer.sendTransaction(tx)),
          );
        }}
      >
        Transfer
      </Button>
    </div>
  );
}

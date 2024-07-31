import { useState } from "react";
import { TabProps } from "../types";
import { TextInput } from "../components/Input";
import { Button } from "../components/Button";
import { Textarea } from "../components/Textarea";
import { ccc } from "@ckb-ccc/connector-react";
import { bytesFromAnyString } from "../utils";

export function Transfer({ sendMessage, signer }: TabProps) {
  const [transferTo, setTransferTo] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [data, setData] = useState<string>("");

  return (
    <div className="mb-1 flex flex-col items-center">
      <div className="flex w-9/12 flex-col items-center">
        <Textarea
          className="w-full"
          placeholder="Addresses to transfer to, separated by lines"
          state={[transferTo, setTransferTo]}
        />
        <TextInput
          className="mt-1 w-full"
          placeholder="Amount to transfer for each"
          state={[amount, setAmount]}
        />
        <Textarea
          className="mt-1 w-full"
          state={[data, setData]}
          placeholder="Leave empty if you don't know what this is. Data in the first output. Hex string will be parsed."
        />
      </div>
      <div className="mt-1 flex">
        <Button
          onClick={async () => {
            if (!signer) {
              return;
            }
            if (transferTo.split("\n").length !== 1) {
              throw new Error("Only one destination is allowed for max amount");
            }

            sendMessage("Calculating the max amount...");
            // Verify destination address
            const { script: toLock } = await ccc.Address.fromString(
              transferTo,
              signer.client,
            );

            // Build the full transaction to estimate the fee
            const tx = ccc.Transaction.from({
              outputs: [{ lock: toLock }],
              outputsData: [bytesFromAnyString(data)],
            });

            // Complete missing parts for transaction
            await tx.completeInputsAll(signer);
            // Change all balance to the first output
            await tx.completeFeeChangeToOutput(signer, 0, 1000);
            const amount = ccc.fixedPointToString(tx.outputs[0].capacity);
            sendMessage("You can transfer at most", amount, "CKB");
            setAmount(amount);
          }}
        >
          Max Amount
        </Button>
        <Button
          className="ml-2"
          onClick={async () => {
            if (!signer) {
              return;
            }
            // Verify destination addresses
            const toAddresses = await Promise.all(
              transferTo
                .split("\n")
                .map((addr) => ccc.Address.fromString(addr, signer.client)),
            );

            const tx = ccc.Transaction.from({
              outputs: toAddresses.map(({ script }) => ({ lock: script })),
              outputsData: [bytesFromAnyString(data)],
            });

            // CCC transactions are easy to be edited
            tx.outputs.forEach((output, i) => {
              if (output.capacity > ccc.fixedPointFrom(amount)) {
                throw new Error(
                  `Insufficient capacity at output ${i} to store data`,
                );
              }
              output.capacity = ccc.fixedPointFrom(amount);
            });

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
    </div>
  );
}

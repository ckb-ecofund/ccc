import { useState } from "react";
import { TabProps } from "../types";
import { TextInput } from "../components/Input";
import { Button } from "../components/Button";
import { ccc } from "@ckb-ccc/connector-react";

export function Transfer({ sendMessage, signer }: TabProps) {
  const [transferTo, setTransferTo] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [data, setData] = useState<string>("");

  return (
    <div className="mb-1 flex flex-col items-center">
      <div className="flex flex-col">
        <TextInput
          placeholder="Address to transfer to"
          state={[transferTo, setTransferTo]}
        />
        <TextInput
          className="mt-1"
          placeholder="Amount to transfer"
          state={[amount, setAmount]}
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
  );
}

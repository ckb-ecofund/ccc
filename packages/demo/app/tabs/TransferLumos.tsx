import { useState } from "react";
import { TabProps } from "../types";
import { TextInput } from "../components/Input";
import { Button } from "../components/Button";
import { ccc } from "@ckb-ccc/connector-react";
import common, {
  registerCustomLockScriptInfos,
} from "@ckb-lumos/common-scripts/lib/common";
import { generateDefaultScriptInfos } from "@ckb-ccc/lumos-patches";
import { Indexer } from "@ckb-lumos/ckb-indexer";
import { TransactionSkeleton } from "@ckb-lumos/helpers";
import { predefined } from "@ckb-lumos/config-manager";
import { Textarea } from "../components/Textarea";
import { useGetExplorerLink } from "../utils";

export function TransferLumos({ sendMessage, signer }: TabProps) {
  const [transferTo, setTransferTo] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [data, setData] = useState<string>("");

  const { explorerTransaction } = useGetExplorerLink();

  return (
    <>
      <div className="mb-1 flex w-9/12 flex-col items-stretch gap-2">
        <TextInput
          label="Address"
          placeholder="Address to transfer to"
          state={[transferTo, setTransferTo]}
        />
        <TextInput
          label="Amount"
          placeholder="Amount to transfer"
          state={[amount, setAmount]}
        />
        <Textarea
          label="Output Data(options)"
          state={[data, setData]}
          placeholder="Data in the cell. Hex string will be parsed."
        />
        <Button
          className="self-center"
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
            sendMessage(
              "Transaction sent:",
              explorerTransaction(await signer.sendTransaction(tx)),
            );
          }}
        >
          Transfer
        </Button>
      </div>
    </>
  );
}

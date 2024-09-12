import { ccc } from "@ckb-ccc/core";
import { JsonRpcTransformers } from "@ckb-ccc/core/advanced";
import { assert, describe, it } from "vitest";
import { createSporeCells } from "..";
import { balanceAndSignTransaction } from "../advanced";

describe("createSpore [testnet]", async () => {
    assert(process.env.PRIVATE_KEY, "PRIVATE_KEY is required");

    it("should create a simple Spore cell without cluster", async () => {
        const client = new ccc.ClientPublicTestnet();
        const signer = new ccc.SignerCkbPrivateKey(client, process.env.PRIVATE_KEY!);

        // Build transaction
        let { transaction: tx, actions, sporeIds } = await createSporeCells({
            signer,
            sporeDataCollection: [
                {
                    sporeData: {
                        contentType: "text/plain",
                        content: ccc.bytesFrom("hello, spore", "utf8"),
                    }
                }
            ],
            clusterMode: "skip",
        });
        console.log("sporeIds:", sporeIds);

        // Complete transaction
        tx = await balanceAndSignTransaction(signer, tx, actions);
        console.log(JSON.stringify(JsonRpcTransformers.transactionFrom(tx)));

        // Send transaction
        let txHash = await signer.sendTransaction(tx);
        console.log(txHash);
    }, 60000);
});

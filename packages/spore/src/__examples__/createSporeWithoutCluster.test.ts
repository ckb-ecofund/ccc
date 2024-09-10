import { ccc } from "@ckb-ccc/core";
import { JsonRpcTransformers } from "@ckb-ccc/core/advanced";
import "dotenv/config";
import { createSpore } from "../index.js";

describe("createSpore [testnet]", () => {
  expect(process.env.PRIVATE_KEY).toBeDefined();

  it("should create a simple Spore cell without cluster", async () => {
    const client = new ccc.ClientPublicTestnet();
    const signer = new ccc.SignerCkbPrivateKey(
      client,
      process.env.PRIVATE_KEY!,
    );

    // Build transaction
    let { tx, id } = await createSpore({
      signer,
      data: {
        contentType: "text/plain",
        content: ccc.bytesFrom("hello, spore", "utf8"),
      },
    });
    console.log("sporeId:", id);

    // Complete transaction
    await tx.completeFeeBy(signer);
    tx = await signer.signTransaction(tx);
    console.log(JSON.stringify(JsonRpcTransformers.transactionFrom(tx)));

    // Send transaction
    let txHash = await signer.sendTransaction(tx);
    console.log(txHash);
  }, 60000);
});

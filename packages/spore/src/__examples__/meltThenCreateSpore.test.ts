import { ccc } from "@ckb-ccc/core";
import { JsonRpcTransformers } from "@ckb-ccc/core/advanced";
import { createSpores, meltSpores } from "../index.js";

describe("meltSpore [testnet]", () => {
  expect(process.env.PRIVATE_KEY).toBeDefined();

  it("should melt a Spore cell by sporeId", async () => {
    const client = new ccc.ClientPublicTestnet();
    const signer = new ccc.SignerCkbPrivateKey(
      client,
      process.env.PRIVATE_KEY!,
    );

    // Build melt transaction
    let { tx: meltTx } = await meltSpores({
      signer,
      ids: [
        // Change this if you have a different sporeId
        "0x683ea7c306697fbef5af6a2fe4da78f9cdc302f30f2c8f50bd63f661a3df0fdf",
      ],
    });

    // Provide create transaction
    let { tx } = await createSpores({
      signer,
      tx: meltTx,
      spores: [
        {
          data: {
            contentType: "text/plain",
            content: ccc.bytesFrom("hello, spore", "utf8"),
          },
        },
      ],
    });

    // Complete transaction
    await tx.completeFeeBy(signer, 1000);
    tx = await signer.signTransaction(tx);
    console.log(JSON.stringify(JsonRpcTransformers.transactionFrom(tx)));

    // Send transaction
    let txHash = await signer.sendTransaction(tx);
    console.log(txHash);
  }, 60000);
});

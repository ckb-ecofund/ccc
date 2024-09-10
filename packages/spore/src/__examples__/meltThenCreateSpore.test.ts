import { ccc } from "@ckb-ccc/core";
import { JsonRpcTransformers } from "@ckb-ccc/core/advanced";
import { injectCommonCobuildProof } from "../advanced.js";
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
    let { tx: meltTx, actions: meltActions } = await meltSpores({
      signer,
      ids: [
        // Change this if you have a different sporeId
        "0xe41a6e19b70dcca7d8d9debc98d4c3b413a0fc69e0ae258bf24fbd5f92cca819",
      ],
    });

    // Provide create transaction
    let { tx, actions: createActions } = await createSpores({
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

    // Combine actions
    const actions = [...meltActions, ...createActions];

    // Complete transaction
    tx = injectCommonCobuildProof(tx, actions);
    await tx.completeFeeBy(signer, 1000);
    tx = await signer.signTransaction(tx);
    console.log(JSON.stringify(JsonRpcTransformers.transactionFrom(tx)));

    // Send transaction
    let txHash = await signer.sendTransaction(tx);
    console.log(txHash);
  }, 60000);
});

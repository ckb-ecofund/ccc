import { ccc } from "@ckb-ccc/core";
import { JsonRpcTransformers } from "@ckb-ccc/core/advanced";
<<<<<<< HEAD
<<<<<<< HEAD
import { meltSpores } from "..";
import { injectCommonCobuildProof } from "../advanced";

describe("meltSpore [testnet]", () => {
  expect(process.env.PRIVATE_KEY).toBeDefined();

  it("should melt a Spore cell by sporeId", async () => {
    const client = new ccc.ClientPublicTestnet();
    const signer = new ccc.SignerCkbPrivateKey(
      client,
      process.env.PRIVATE_KEY!,
    );

    // Build transaction
    let { tx, actions } = await meltSpores({
      signer,
      ids: [
        // Change this if you have a different sporeId
        "0xd413acd003c0913f0da53fc0ba1c3185d10fad5ebfad9bc449c87e8e7b2efc1d",
      ],
    });

    // Complete transaction
    tx = injectCommonCobuildProof(tx, actions);
    await tx.completeFeeBy(signer, 1000);
    tx = await signer.signTransaction(tx);
    console.log(JSON.stringify(JsonRpcTransformers.transactionFrom(tx)));

    // Send transaction
    let txHash = await signer.sendTransaction(tx);
    console.log(txHash);
  }, 60000);
=======
import { assert, describe, it } from "vitest";
=======
>>>>>>> 2de265a (feat: fix issues from comment)
import { meltSporeCells } from "..";

describe("meltSpore [testnet]", () => {
  expect(process.env.PRIVATE_KEY).toBeDefined();

  it("should melt a Spore cell by sporeId", async () => {
    const client = new ccc.ClientPublicTestnet();
    const signer = new ccc.SignerCkbPrivateKey(
      client,
      process.env.PRIVATE_KEY!,
    );

    // Build transaction
    let { transaction: tx } = await meltSporeCells({
      signer,
      sporeIdCollection: [
        // Change this if you have a different sporeId
        "0xd413acd003c0913f0da53fc0ba1c3185d10fad5ebfad9bc449c87e8e7b2efc1d",
      ],
    });

    // Complete transaction
    await tx.completeFeeBy(signer, 1000);
    tx = await signer.signTransaction(tx);
    console.log(JSON.stringify(JsonRpcTransformers.transactionFrom(tx)));

<<<<<<< HEAD
        // Send transaction
        let txHash = await signer.sendTransaction(tx);
        console.log(txHash);
    }, 60000);
>>>>>>> 5899f53 (feat: add spore-sdk examples)
=======
    // Send transaction
    let txHash = await signer.sendTransaction(tx);
    console.log(txHash);
  }, 60000);
>>>>>>> 2de265a (feat: fix issues from comment)
});

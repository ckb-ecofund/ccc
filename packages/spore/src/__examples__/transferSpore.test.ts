import { ccc } from "@ckb-ccc/core";
import { JsonRpcTransformers } from "@ckb-ccc/core/advanced";
import { transferSpores } from "../api/spore";

describe("transferSpore [testnet]", () => {
  expect(process.env.PRIVATE_KEY).toBeDefined();

  it("should transfer a Spore cell by sporeId", async () => {
    const client = new ccc.ClientPublicTestnet();
    const signer = new ccc.SignerCkbPrivateKey(
      client,
      process.env.PRIVATE_KEY!,
    );

    // Create a new owner
    const owner = await ccc.Address.fromString(
      "ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqv5puz2ee96nuh9nmc6rtm0n8v7agju4rgdmxlnk",
      signer.client,
    );

    // Build transaction
    let { tx } = await transferSpores({
      signer,
      spores: [
        {
          // Change this if you have a different sporeId
          id: "0x22cc6272ce14488b27e67519915a5574701eec36a2fdca6c24174ac66c77d01a",
          to: owner.script,
        },
      ],
    });

    // Complete transaction
    await tx.completeFeeBy(signer, 1000);
    tx = await signer.signTransaction(tx);
    console.log(JSON.stringify(JsonRpcTransformers.transactionFrom(tx)));

    // Send transaction
    let txHash = await signer.client.sendTransaction(tx);
    console.log(txHash);
  }, 60000);
});

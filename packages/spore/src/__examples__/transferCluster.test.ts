import { ccc } from "@ckb-ccc/core";
import { JsonRpcTransformers } from "@ckb-ccc/core/advanced";
import { transferSporeCluster } from "..";

describe("transferCluster [testnet]", () => {
  expect(process.env.PRIVATE_KEY).toBeDefined();

  it("should transfer a Cluster cell by sporeId", async () => {
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
    let { tx } = await transferSporeCluster({
      signer,
      id: "0xd0138f33157a2027c7190ffd1492b3666ced8794fb8820da3c69927a83c52c32",
      to: owner.script,
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

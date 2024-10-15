import { ccc } from "@ckb-ccc/core";
import { JsonRpcTransformers } from "@ckb-ccc/core/advanced";
import { createSpores } from "..";

describe("createSpore [testnet]", () => {
  expect(process.env.PRIVATE_KEY).toBeDefined();

  it("should create a Spore cell under DOB protocol", async () => {
    const client = new ccc.ClientPublicTestnet();
    const signer = new ccc.SignerCkbPrivateKey(
      client,
      process.env.PRIVATE_KEY!,
    );

    // Generate the DNA of DOB protocol for `createDobCluster` example required
    //
    // note: each different DOB pattern may require different DNA length and format
    const hasher = new ccc.HasherCkb(7);
    hasher.update(ccc.bytesFrom("hello, dob", "utf8"));
    let dna = ccc.bytesFrom(hasher.digest());
    dna = ccc.bytesConcat(dna, ccc.bytesFrom("hello, world!", "utf8"));
    expect(dna.length === 20);
    const hexedDna = ccc.bytesTo(dna, "hex"); // no leading "0x"
    const content = `{"dna":"${hexedDna}"}`;

    // Build transaction
    let { tx, ids } = await createSpores({
      signer,
      spores: [
        {
          data: {
            contentType: "dob/1",
            content: ccc.bytesFrom(content, "utf8"),
            clusterId:
              "0xaf14384d05ef7a9dfaaa51dd6283506ec7a9578ec53ca5ffd23cb790166cbc14",
          },
        },
      ],
      clusterMode: "clusterCell",
    });
    console.log("sporeIds:", ids);

    // Complete transaction
    await tx.completeFeeBy(signer, 1000);
    tx = await signer.signTransaction(tx);
    console.log(JSON.stringify(JsonRpcTransformers.transactionFrom(tx)));

    // Send transaction
    let txHash = await signer.sendTransaction(tx);
    console.log(txHash);
  }, 60000);
});

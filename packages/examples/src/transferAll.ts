import { ccc } from "@ckb-ccc/ccc";
import { render, signer } from "@ckb-ccc/playground";

// The receiver is the signer itself on mainnet
const receiver = await signer.getRecommendedAddress();
console.log(receiver);

// Parse the receiver script from an address
const { script: lock } = await ccc.Address.fromString(receiver, signer.client);

// Describe what we want
const tx = ccc.Transaction.from({
  outputs: [{ lock }],
});
await render(tx);

// Complete missing parts: Collect all cells as inputs
await tx.completeInputsAll(signer);
await render(tx);

// Complete missing parts: Pay fee and collect all CKB to the first output
await tx.completeFeeChangeToOutput(signer, 0);
await render(tx);

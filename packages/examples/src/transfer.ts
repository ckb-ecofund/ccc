import { ccc } from "@ckb-ccc/ccc";
import { render, signer } from "@ckb-ccc/playground";

// The receiver is the signer itself on mainnet
const receiver = await signer.getRecommendedAddress();
console.log(receiver);

// Parse the receiver script from an address
const { script: lock } = await ccc.Address.fromString(receiver, signer.client);

// Describe what we want
const tx = ccc.Transaction.from({
  outputs: [{ capacity: ccc.fixedPointFrom(100), lock }],
});
await render(tx);

// Complete missing parts: Fill inputs
await tx.completeInputsByCapacity(signer);
await render(tx);

// Complete missing parts: Pay fee
await tx.completeFeeBy(signer);
await render(tx);

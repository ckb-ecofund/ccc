import { ccc } from "@ckb-ccc/ccc";
import { client, signer as playgroundSigner } from "@ckb-ccc/playground";

// The default signer can not sign message
// Create a new one when needed
const signer: ccc.Signer =
  playgroundSigner instanceof ccc.SignerCkbPublicKey
    ? new ccc.SignerCkbPrivateKey(client, "01".repeat(32))
    : playgroundSigner;
const message = "Hello world";

// Sign message
const signature = await signer.signMessage("Hello world");
console.log(signature);

console.log(
  `Verification should pass: ${await ccc.Signer.verifyMessage(message, signature)}`,
);
console.log(
  `Verification should fail: ${await ccc.Signer.verifyMessage("Wrong message", signature)}`,
);

import { ccc } from "@ckb-ccc/ccc";
import { client } from "@ckb-ccc/playground";

const controller = new ccc.SignersController();
let wallets: ccc.WalletWithSigners[] | undefined;

// Fetch all available signers
await controller.refresh(client, (w) => (wallets = w));
if (!wallets) {
  throw new Error("Unexpected not wallets");
}
wallets.forEach((wallet) => {
  console.log(
    wallet.name,
    wallet.signers.map(({ name }) => name),
  );
});

const signer = wallets[0].signers[0].signer;

// Connect signer
await signer.connect();
console.log("Connected");

// Sign message as test
const signature = await signer.signMessage("Hello world");
console.log(signature);

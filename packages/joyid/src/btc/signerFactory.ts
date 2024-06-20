import { ccc } from "@ckb-ccc/core";
import { BitcoinSigner } from "./signer";

export function getJoyIDBitcoinSigner(
  client: ccc.Client,
): BitcoinSigner | undefined {
  
  return new BitcoinSigner(client);
}

import { ccc } from "@ckb-ccc/core";
import { BitcoinSigner } from "./signer";

export function getJoyIdBitcoinSigner(
  client: ccc.Client,
): BitcoinSigner {
  return new BitcoinSigner(client);
}

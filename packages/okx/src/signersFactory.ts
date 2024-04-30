import { ccc } from "@ckb-ccc/core";
import { BitcoinProvider } from "./advanced";
import { BitcoinSigner } from "./signer";

export function getOKXBitcoinSigner(
  client: ccc.Client,
): ccc.Signer | undefined {
  const windowRef = window as { okxwallet?: { bitcoin: BitcoinProvider } };

  if (typeof windowRef.okxwallet === "undefined") {
    return;
  }

  return new BitcoinSigner(client, windowRef.okxwallet.bitcoin);
}

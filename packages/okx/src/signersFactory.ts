import { ccc } from "@ckb-ccc/core";
import { BitcoinProvider } from "./advancedBarrel";
import { BitcoinSigner } from "./signer";

/**
 * Retrieves the OKX Bitcoin signer if available.
 * @param {ccc.Client} client - The client instance.
 * @returns {BitcoinSigner | undefined} The BitcoinSigner instance if the OKX wallet is available, otherwise undefined.
 */
export function getOKXBitcoinSigner(
  client: ccc.Client,
): BitcoinSigner | undefined {
  const windowRef = window as { okxwallet?: { bitcoin: BitcoinProvider } };

  if (typeof windowRef.okxwallet === "undefined") {
    return undefined;
  }

  return new BitcoinSigner(client, windowRef.okxwallet.bitcoin);
}

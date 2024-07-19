import { ccc } from "@ckb-ccc/core";
import { BitcoinProvider, NostrProvider } from "./advancedBarrel";
import { BitcoinSigner } from "./btc";
import { NostrSigner } from "./nostr";

/**
 * Retrieves the OKX Bitcoin signer if available.
 * @param {ccc.Client} client - The client instance.
 * @returns {BitcoinSigner | undefined} The BitcoinSigner instance if the OKX wallet is available, otherwise undefined.
 */
export function getOKXBitcoinSigner(
  client: ccc.Client,
  preferredNetworks: ccc.NetworkPreference[],
): ccc.Signer[] {
  const windowRef = window as {
    okxwallet?: Record<string, BitcoinProvider> & { nostr: NostrProvider };
  };

  if (typeof windowRef.okxwallet === "undefined") {
    return [];
  }

  return [
    new BitcoinSigner(client, windowRef.okxwallet, preferredNetworks),
    new NostrSigner(client, windowRef.okxwallet.nostr),
  ];
}

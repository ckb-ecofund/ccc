import { ccc } from "@ckb-ccc/core";
import { BitcoinProvider, NostrProvider } from "./advancedBarrel.js";
import { BitcoinSigner } from "./btc/index.js";
import { NostrSigner } from "./nostr/index.js";

/**
 * Retrieves the OKX Bitcoin signer if available.
 * @public
 * 
 * @param client - The client instance.
 * @returns The BitcoinSigner instance if the OKX wallet is available, otherwise undefined.
 */
export function getOKXSigners(
  client: ccc.Client,
  preferredNetworks?: ccc.NetworkPreference[],
): ccc.SignerInfo[] {
  const windowRef = window as {
    okxwallet?: Record<string, BitcoinProvider> & { nostr: NostrProvider };
  };

  if (typeof windowRef.okxwallet === "undefined") {
    return [];
  }

  return [
    {
      signer: new BitcoinSigner(client, windowRef.okxwallet, preferredNetworks),
      name: "BTC",
    },
    {
      signer: new NostrSigner(client, windowRef.okxwallet.nostr),
      name: "Nostr",
    },
  ];
}

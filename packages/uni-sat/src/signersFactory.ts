import { ccc } from "@ckb-ccc/core";
import { Provider } from "./advancedBarrel";
import { Signer } from "./signer";

/**
 * Retrieves the UniSat signer if available.
 * @param {ccc.Client} client - The client instance.
 * @returns {Signer | undefined} The Signer instance if the UniSat provider is available, otherwise undefined.
 */
export function getUniSatSigner(
  client: ccc.Client,
  preferredNetworks: ccc.NetworkPreference[],
): Signer | undefined {
  const windowRef = window as { unisat?: Provider };

  if (typeof windowRef.unisat === "undefined") {
    return undefined;
  }

  return new Signer(client, windowRef.unisat, preferredNetworks);
}

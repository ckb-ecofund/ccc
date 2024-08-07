import { ccc } from "@ckb-ccc/core";
import { Provider } from "./advancedBarrel.js";
import { Signer } from "./signer.js";

/**
 * Retrieves the UniSat signer if available.
 * @param {ccc.Client} client - The client instance.
 * @returns {Signer | undefined} The Signer instance if the UniSat provider is available, otherwise undefined.
 */
export function getUniSatSigners(
  client: ccc.Client,
  preferredNetworks?: ccc.NetworkPreference[],
): ccc.SignerInfo[] {
  const windowRef = window as { unisat?: Provider };

  if (typeof windowRef.unisat === "undefined") {
    return [];
  }

  return [
    {
      signer: new Signer(client, windowRef.unisat, preferredNetworks),
      name: "BTC",
    },
  ];
}

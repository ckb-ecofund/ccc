import { ccc } from "@ckb-ccc/core";
import { Provider } from "./advancedBarrel.js";
import { ReiSigner } from "./signer.js";

/**
 * Retrieves the Rei signer if available.
 * @param client - The client instance.
 * @returns The Signer instance if the Rei provider is available, otherwise undefined.
 */
export function getReiSigners(client: ccc.Client): ccc.SignerInfo[] {
  const windowRef = window as { ckb?: Provider };

  if (typeof windowRef.ckb === "undefined") {
    return [];
  }

  return [
    {
      signer: new ReiSigner(client, windowRef.ckb),
      name: "CKB",
    },
  ];
}

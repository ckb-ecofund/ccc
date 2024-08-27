import { ccc } from "@ckb-ccc/core";
import { Provider } from "./nip07.advanced.js";
import { Signer } from "./signer.js";

/**
 * @public
 */
export function getNip07Signer(client: ccc.Client): Signer | undefined {
  const windowRef = window as { nostr?: Provider };

  if (typeof windowRef.nostr === "undefined") {
    return;
  }

  return new Signer(client, windowRef.nostr);
}

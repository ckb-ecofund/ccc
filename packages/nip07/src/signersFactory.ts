import { ccc } from "@ckb-ccc/core";
import { Provider } from "./nip07.advanced";
import { Signer } from "./signer";

export function getNip07Signer(client: ccc.Client): Signer | undefined {
  const windowRef = window as { nostr?: Provider };

  if (typeof windowRef.nostr === "undefined") {
    return;
  }

  return new Signer(client, windowRef.nostr);
}

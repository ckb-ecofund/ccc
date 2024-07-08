import { ccc } from "@ckb-ccc/core";

export interface Provider {
  getPublicKey(): Promise<string>;
  signEvent(event: ccc.NostrEvent): Promise<Required<ccc.NostrEvent>>;
}

import { ccc } from "@ckb-ccc/core";
import { Signer } from "./signer";

export function getJoyIdCkbSigner(client: ccc.Client): Signer {
  return new Signer(client);
}

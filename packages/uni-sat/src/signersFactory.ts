import { ccc } from "@ckb-ccc/core";
import { Signer } from "./signer";
import { Provider } from "./uni-sat.advanced";

export function getUniSatSigner(client: ccc.Client): Signer | undefined {
  const windowRef = window as { unisat?: Provider };

  if (typeof windowRef.unisat === "undefined") {
    return;
  }

  return new Signer(client, windowRef.unisat);
}
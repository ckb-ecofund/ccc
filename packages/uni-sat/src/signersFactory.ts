import { ccc } from "@ckb-ccc/core";
import { Provider } from "./advancedBarrel";
import { Signer } from "./signer";

export function getUniSatSigner(client: ccc.Client): Signer | undefined {
  const windowRef = window as { unisat?: Provider };

  if (typeof windowRef.unisat === "undefined") {
    return;
  }

  return new Signer(client, windowRef.unisat);
}

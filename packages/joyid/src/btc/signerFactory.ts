import { ccc } from "@ckb-ccc/core";
import { BitcoinSigner } from "./signer";
import { BitcoinProvider } from '../../../okx/src/advanced';
import { Provider } from "./joyid-btc.advanced";

export function getJoyIDBitcoinSigner(
  client: ccc.Client,
): BitcoinSigner | undefined {
  const windowRef = window as { joyid?: Provider };

  return new BitcoinSigner(client, windowRef.joyid!!);
}

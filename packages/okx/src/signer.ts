import { ccc } from "@ckb-ccc/core";
import { UniSat } from "@ckb-ccc/uni-sat";
import { BitcoinProvider } from "./advancedBarrel";

export class BitcoinSigner extends UniSat.Signer {
  constructor(
    client: ccc.Client,
    public readonly provider: BitcoinProvider,
  ) {
    super(client, provider);
  }
}

import { ccc } from "@ckb-ccc/core";
import { UniSat } from "@ckb-ccc/uni-sat";
import { BitcoinProvider } from "./advancedBarrel";

/**
 * Class representing a Bitcoin signer that extends the UniSat Signer.
 * @class
 * @extends {UniSat.Signer}
 */
export class BitcoinSigner extends UniSat.Signer {
  /**
   * Creates an instance of BitcoinSigner.
   * @param {ccc.Client} client - The client instance.
   * @param {BitcoinProvider} provider - The Bitcoin provider.
   */
  constructor(
    client: ccc.Client,
    public readonly provider: BitcoinProvider,
  ) {
    super(client, provider);
  }
}

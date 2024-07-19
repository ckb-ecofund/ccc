import { ccc } from "@ckb-ccc/core";
import { NostrProvider } from "../advancedBarrel";

/**
 * Class representing a Bitcoin signer that extends SignerBtc from @ckb-ccc/core.
 * @class
 * @extends {ccc.SignerBtc}
 */
export class NostrSigner extends ccc.SignerNostr {
  constructor(
    client: ccc.Client,
    public readonly provider: NostrProvider,
  ) {
    super(client);
  }

  async replaceClient(client: ccc.Client): Promise<boolean> {
    return super.replaceClient(client);
  }

  async getNostrPublicKey(): Promise<ccc.Hex> {
    if (!this.provider.selectedAccount) {
      throw new Error("Not connected");
    }

    return ccc.hexFrom(this.provider.selectedAccount.publicKey);
  }

  async signNostrEvent(
    event: ccc.NostrEvent,
  ): Promise<Required<ccc.NostrEvent>> {
    return this.provider.signEvent(event);
  }

  async connect(): Promise<void> {
    await this.provider.getPublicKey();
  }

  async isConnected(): Promise<boolean> {
    return this.provider.selectedAccount !== null;
  }
}

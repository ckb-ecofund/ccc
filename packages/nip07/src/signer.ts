import { ccc } from "@ckb-ccc/core";
import { Provider } from "./nip07.advanced.js";

/**
 * @public
 */
export class Signer extends ccc.SignerNostr {
  private publicKeyCache?: Promise<string> = undefined;

  constructor(
    client: ccc.Client,
    public readonly provider: Provider,
  ) {
    super(client);
  }

  async getNostrPublicKey(): Promise<ccc.Hex> {
    if (!this.publicKeyCache) {
      this.publicKeyCache = this.provider.getPublicKey().catch((e) => {
        this.publicKeyCache = undefined;
        throw e;
      });
    }

    return ccc.hexFrom(await this.publicKeyCache);
  }

  async signNostrEvent(
    event: ccc.NostrEvent,
  ): Promise<Required<ccc.NostrEvent>> {
    return this.provider.signEvent({
      ...event,
      pubkey: await this.publicKeyCache,
    });
  }

  async connect(): Promise<void> {
    await this.getNostrPublicKey();
  }

  async isConnected(): Promise<boolean> {
    return true;
  }
}

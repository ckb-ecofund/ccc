import { ccc } from "@ckb-ccc/core";
import { NostrProvider } from "../advancedBarrel";

/**
 * Class representing a Bitcoin signer that extends SignerBtc from @ckb-ccc/core.
 * @class
 * @extends {ccc.SignerBtc}
 */
export class NostrSigner extends ccc.SignerNostr {
  private publicKeyCache?: Promise<string> = undefined;

  constructor(
    client: ccc.Client,
    public readonly provider: NostrProvider,
  ) {
    super(client);
  }

  async getNostrPublicKey(): Promise<ccc.Hex> {
    if (!this.publicKeyCache) {
      this.publicKeyCache = this.provider.getPublicKey();
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
    await this.provider.connect?.(); // Help extension to switch network
  }

  onReplaced(listener: () => void): () => void {
    const stop: (() => void)[] = [];
    const replacer = async () => {
      listener();
      stop[0]?.();
    };
    stop.push(() => {
      this.provider.removeListener("accountChanged", replacer);
    });

    this.provider.on("accountChanged", replacer);

    return stop[0];
  }

  async isConnected(): Promise<boolean> {
    return true;
  }
}

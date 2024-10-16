import { ccc } from "@ckb-ccc/core";
import { NostrProvider } from "../advancedBarrel.js";

/**
 * Class representing a Bitcoin signer that extends SignerBtc
 * @public
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
      this.publicKeyCache = this.provider
        .getPublicKey()
        .then((v) => {
          // For some account types of OKX Wallet, this might returns null
          // e.g. Keyless accounts
          if (v) {
            return v;
          }

          throw Error("This OKX Wallet account does not support Nostr");
        })
        .catch((e) => {
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
    await this.provider.connect?.(); // Help extension to switch network

    await this.getNostrPublicKey();
  }

  onReplaced(listener: () => void): () => void {
    const stop: (() => void)[] = [];
    const replacer = () => {
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

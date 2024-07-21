import { ccc } from "@ckb-ccc/core";
import {
  ConnectionsRepo,
  ConnectionsRepoLocalStorage,
} from "./connectionsRepo";
import { Provider } from "./nip07.advanced";

export class Signer extends ccc.SignerNostr {
  private publicKey: ccc.Hex | undefined = undefined;

  constructor(
    client: ccc.Client,
    public readonly provider: Provider,
    private readonly connectionsRepo: ConnectionsRepo = new ConnectionsRepoLocalStorage(),
  ) {
    super(client);
  }

  async getNostrPublicKey(): Promise<ccc.Hex> {
    if (this.publicKey) {
      return this.publicKey;
    }

    this.publicKey = (await this.connectionsRepo.get())?.publicKey;
    if (!this.publicKey) {
      throw new Error("Not connected");
    }

    return this.publicKey;
  }

  async signNostrEvent(
    event: ccc.NostrEvent,
  ): Promise<Required<ccc.NostrEvent>> {
    return this.provider.signEvent({ ...event, pubkey: this.publicKey });
  }

  async connect(): Promise<void> {
    this.publicKey = ccc.hexFrom(await this.provider.getPublicKey());
    await this.connectionsRepo.set({ publicKey: this.publicKey });
  }

  async isConnected(): Promise<boolean> {
    if (this.publicKey) {
      return true;
    }

    this.publicKey = (await this.connectionsRepo.get())?.publicKey;
    return this.publicKey !== undefined;
  }
}

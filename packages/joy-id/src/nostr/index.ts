import { ccc } from "@ckb-ccc/core";
import { DappRequestType, buildJoyIDURL } from "@joyid/common";
import { createPopup } from "../common/index.js";
import {
  Connection,
  ConnectionsRepo,
  ConnectionsRepoLocalStorage,
} from "../connectionsStorage/index.js";

/**
 * Class representing a Nostr signer that extends SignerNostr
 * @public
 */
export class NostrSigner extends ccc.SignerNostr {
  private connection?: Connection;

  /**
   * Ensures that the signer is connected and returns the connection.
   * @throws Will throw an error if not connected.
   * @returns The current connection.
   */
  private assertConnection(): Connection {
    if (!this.isConnected() || !this.connection) {
      throw new Error("Not connected");
    }

    return this.connection;
  }

  /**
   * Creates an instance of NostrSigner.
   * @param client - The client instance.
   * @param name - The name of the signer.
   * @param icon - The icon URL of the signer.
   * @param _appUri - The application URI.
   * @param connectionsRepo - The connections repository.
   */
  constructor(
    client: ccc.Client,
    private readonly name: string,
    private readonly icon: string,
    private readonly _appUri?: string,
    private readonly connectionsRepo: ConnectionsRepo = new ConnectionsRepoLocalStorage(),
  ) {
    super(client);
  }

  /**
   * Gets the configuration for JoyID.
   * @returns The configuration object.
   */
  private getConfig() {
    return {
      redirectURL: location.href,
      joyidAppURL:
        this._appUri ?? this.client.addressPrefix === "ckb"
          ? "https://app.joy.id"
          : "https://testnet.joyid.dev",
      requestNetwork: "nostr",
      name: this.name,
      logo: this.icon,
    };
  }

  /**
   * Connects to the provider by requesting authentication.
   * @returns A promise that resolves when the connection is established.
   */
  async connect(): Promise<void> {
    const config = this.getConfig();
    const res = await createPopup(buildJoyIDURL(config, "popup", "/auth"), {
      ...config,
      type: DappRequestType.Auth,
    });

    this.connection = {
      address: "",
      publicKey: ccc.hexFrom(res.nostrPubkey),
      keyType: res.keyType,
    };
    await this.saveConnection();
  }

  async disconnect(): Promise<void> {
    await super.disconnect();

    this.connection = undefined;
    await this.saveConnection();
  }

  /**
   * Checks if the signer is connected.
   * @returns A promise that resolves to true if connected, false otherwise.
   */
  async isConnected(): Promise<boolean> {
    if (this.connection) {
      return true;
    }

    await this.restoreConnection();
    return this.connection !== undefined;
  }

  async getNostrPublicKey(): Promise<ccc.Hex> {
    return this.assertConnection().publicKey;
  }

  async signNostrEvent(
    event: ccc.NostrEvent,
  ): Promise<Required<ccc.NostrEvent>> {
    const config = this.getConfig();
    const res = await createPopup(
      buildJoyIDURL({ ...config, event }, "popup", "/sign-nostr-event"),
      {
        ...config,
        type: DappRequestType.SignNostrEvent,
      },
    );
    return res.event;
  }

  /**
   * Saves the current connection.
   * @returns
   */
  private async saveConnection(): Promise<void> {
    return this.connectionsRepo.set(
      {
        uri: this.getConfig().joyidAppURL,
        addressType: "nostr",
      },
      this.connection,
    );
  }

  /**
   * Restores the previous connection.
   * @returns
   */
  private async restoreConnection(): Promise<void> {
    this.connection = await this.connectionsRepo.get({
      uri: this.getConfig().joyidAppURL,
      addressType: "nostr",
    });
  }
}

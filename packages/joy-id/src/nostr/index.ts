import { ccc } from "@ckb-ccc/core";
import { DappRequestType, buildJoyIDURL } from "@joyid/common";
import { createPopup } from "../common";
import {
  Connection,
  ConnectionsRepo,
  ConnectionsRepoLocalStorage,
} from "../connectionsStorage";

/**
 * Class representing a Nostr signer that extends SignerNostr from @ckb-ccc/core.
 * @class
 * @extends {ccc.SignerNostr}
 */
export class NostrSigner extends ccc.SignerNostr {
  private connection?: Connection;

  /**
   * Ensures that the signer is connected and returns the connection.
   * @private
   * @throws Will throw an error if not connected.
   * @returns {Connection} The current connection.
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
   * @param appUri - The application URI.
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
   * @private
   * @returns {object} The configuration object.
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
   * @returns {Promise<void>} A promise that resolves when the connection is established.
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
   * @returns {Promise<boolean>} A promise that resolves to true if connected, false otherwise.
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
   * @private
   * @returns {Promise<void>}
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
   * @private
   * @returns {Promise<void>}
   */
  private async restoreConnection(): Promise<void> {
    this.connection = await this.connectionsRepo.get({
      uri: this.getConfig().joyidAppURL,
      addressType: "nostr",
    });
  }
}

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
   * @param {ccc.Client} client - The client instance.
   * @param {string} name - The name of the signer.
   * @param {string} icon - The icon URL of the signer.
   * @param {string} [appUri="https://app.joy.id"] - The application URI.
   * @param {ConnectionsRepo} [connectionsRepo=new ConnectionsRepoLocalStorage()] - The connections repository.
   */
  constructor(
    client: ccc.Client,
    private readonly name: string,
    private readonly icon: string,
    private readonly appUri = "https://app.joy.id",
    private readonly connectionsRepo: ConnectionsRepo = new ConnectionsRepoLocalStorage(),
  ) {
    super(client);
  }

  static isValidClient(client: ccc.Client): boolean {
    return client.addressPrefix === "ckt";
  }

  async replaceClient(client: ccc.Client): Promise<boolean> {
    if (!NostrSigner.isValidClient(client)) {
      return false;
    }
    return super.replaceClient(client);
  }

  /**
   * Gets the configuration for JoyID.
   * @private
   * @returns {object} The configuration object.
   */
  private getConfig() {
    return {
      redirectURL: location.href,
      joyidAppURL: this.appUri,
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
    await this.connectionsRepo.set(
      { uri: this.appUri, addressType: "nostr" },
      this.connection,
    );
  }

  /**
   * Checks if the signer is connected.
   * @returns {Promise<boolean>} A promise that resolves to true if connected, false otherwise.
   */
  async isConnected(): Promise<boolean> {
    if (this.connection) {
      return true;
    }

    this.connection = await this.connectionsRepo.get({
      uri: this.appUri,
      addressType: "nostr",
    });
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
}

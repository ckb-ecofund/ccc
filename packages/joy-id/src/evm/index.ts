import { ccc } from "@ckb-ccc/core";
import { DappRequestType, buildJoyIDURL } from "@joyid/common";
import { createPopup } from "../common";
import {
  Connection,
  ConnectionsRepo,
  ConnectionsRepoLocalStorage,
} from "../connectionsStorage";

/**
 * Class representing an EVM signer that extends SignerEvm from @ckb-ccc/core.
 * @class
 * @extends {ccc.SignerEvm}
 */
export class EvmSigner extends ccc.SignerEvm {
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
   * Creates an instance of EvmSigner.
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
      requestNetwork: `ethereum`,
      name: this.name,
      logo: this.icon,
    };
  }

  /**
   * Gets the EVM account address.
   * @returns {Promise<string>} A promise that resolves to the EVM account address.
   */
  async getEvmAccount(): Promise<string> {
    return this.assertConnection().address;
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
      address: res.ethAddress,
      publicKey: ccc.hexFrom(res.pubkey),
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

  /**
   * Signs a raw message with the EVM account.
   * @param {string | ccc.BytesLike} message - The message to sign.
   * @returns {Promise<ccc.Hex>} A promise that resolves to the signed message.
   */
  async signMessageRaw(message: string | ccc.BytesLike): Promise<ccc.Hex> {
    const { address } = this.assertConnection();

    const challenge =
      typeof message === "string" ? message : ccc.hexFrom(message).slice(2);

    const config = this.getConfig();
    const { signature } = await createPopup(
      buildJoyIDURL(
        {
          ...config,
          challenge,
          isData: typeof message !== "string",
          address,
        },
        "popup",
        "/sign-message",
      ),
      { ...config, type: DappRequestType.SignMessage },
    );
    return ccc.hexFrom(signature);
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
        addressType: "ethereum",
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
      addressType: "ethereum",
    });
  }
}

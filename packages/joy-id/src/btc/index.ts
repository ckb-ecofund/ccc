import { ccc } from "@ckb-ccc/core";
import { DappRequestType, buildJoyIDURL } from "@joyid/common";
import { createPopup } from "../common";
import {
  Connection,
  ConnectionsRepo,
  ConnectionsRepoLocalStorage,
} from "../connectionsStorage";

/**
 * Class representing a Bitcoin signer that extends SignerBtc from @ckb-ccc/core.
 * @class
 * @extends {ccc.SignerBtc}
 */
export class BitcoinSigner extends ccc.SignerBtc {
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
   * Creates an instance of BitcoinSigner.
   * @param {ccc.Client} client - The client instance.
   * @param {string} name - The name of the signer.
   * @param {string} icon - The icon URL of the signer.
   * @param {"auto" | "p2wpkh" | "p2tr"} [addressType="auto"] - The address type.
   * @param {string} [appUri="https://app.joy.id"] - The application URI.
   * @param {ConnectionsRepo} [connectionsRepo=new ConnectionsRepoLocalStorage()] - The connections repository.
   */
  constructor(
    client: ccc.Client,
    private readonly name: string,
    private readonly icon: string,
    private readonly addressType: "auto" | "p2wpkh" | "p2tr" = "auto",
    private readonly appUri = "https://app.joy.id",
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
      joyidAppURL: this.appUri,
      requestNetwork: `btc-${this.addressType}`,
      name: this.name,
      logo: this.icon,
    };
  }

  /**
   * Gets the Bitcoin account address.
   * @returns {Promise<string>} A promise that resolves to the Bitcoin account address.
   */
  async getBtcAccount(): Promise<string> {
    const { address } = this.assertConnection();
    return address;
  }

  /**
   * Gets the Bitcoin public key.
   * @returns {Promise<ccc.Hex>} A promise that resolves to the Bitcoin public key.
   */
  async getBtcPublicKey(): Promise<ccc.Hex> {
    const { publicKey } = this.assertConnection();
    return publicKey;
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

    const { address, pubkey } = (() => {
      if (this.addressType === "auto") {
        return res.btcAddressType === "p2wpkh" ? res.nativeSegwit : res.taproot;
      }
      return res.btcAddressType === "p2wpkh" ? res.nativeSegwit : res.taproot;
    })();

    this.connection = {
      address,
      publicKey: ccc.hexFrom(pubkey),
      keyType: res.keyType,
    };
    await Promise.all([
      this.connectionsRepo.set(
        { uri: this.appUri, addressType: `btc-${res.btcAddressType}` },
        this.connection,
      ),
      this.connectionsRepo.set(
        { uri: this.appUri, addressType: "btc-auto" },
        this.connection,
      ),
    ]);
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
      addressType: `btc-${this.addressType}`,
    });
    return this.connection !== undefined;
  }

  /**
   * Signs a raw message with the Bitcoin account.
   * @param {string | ccc.BytesLike} message - The message to sign.
   * @returns {Promise<string>} A promise that resolves to the signed message.
   */
  async signMessageRaw(message: string | ccc.BytesLike): Promise<string> {
    const { address } = this.assertConnection();

    const challenge =
      typeof message === "string" ? message : ccc.hexFrom(message).slice(2);

    const config = this.getConfig();
    const { signature } = await createPopup(
      buildJoyIDURL(
        {
          ...config,
          challenge,
          address,
          signMessageType: "ecdsa",
        },
        "popup",
        "/sign-message",
      ),
      { ...config, type: DappRequestType.SignMessage },
    );
    return signature;
  }
}

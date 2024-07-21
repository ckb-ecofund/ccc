import { ccc } from "@ckb-ccc/core";
import { BitcoinProvider } from "../advancedBarrel";

/**
 * Class representing a Bitcoin signer that extends SignerBtc from @ckb-ccc/core.
 * @class
 * @extends {ccc.SignerBtc}
 */
export class BitcoinSigner extends ccc.SignerBtc {
  private network = "btcTestnet";

  /**
   * Creates an instance of Signer.
   * @param {ccc.Client} client - The client instance.
   * @param {Provider} provider - The provider instance.
   */
  constructor(
    client: ccc.Client,
    public readonly providers: Record<string, BitcoinProvider>,
    private readonly preferredNetworks: ccc.NetworkPreference[] = [
      {
        addressPrefix: "ckb",
        signerType: ccc.SignerType.BTC,
        network: "btc",
      },
      {
        addressPrefix: "ckt",
        signerType: ccc.SignerType.BTC,
        network: "btcTestnet",
      },
    ],
  ) {
    super(client);
  }

  get provider(): BitcoinProvider {
    const { network } = this.matchNetworkPreference(
      this.preferredNetworks,
      this.network,
    ) ?? { network: this.network };
    this.network = network;

    const chain = {
      btc: "bitcoin",
      btcTestnet: "bitcoinTestnet",
      btcSignet: "bitcoinSignet",
    }[network];
    if (!chain) {
      throw new Error(
        `OKX wallet doesn't support the requested chain ${this.network}`,
      );
    }
    const provider = this.providers[chain];
    if (!provider) {
      throw new Error(
        `OKX wallet doesn't support the requested chain ${this.network}`,
      );
    }
    return provider;
  }

  /**
   * Get account info if the signer is connected.
   * @returns Account information
   */
  async assertConnection(): Promise<{ address: string; publicKey: string }> {
    const account = await this.provider.getSelectedAccount();
    if (!account) {
      throw Error("Not connected");
    }
    return account;
  }

  /**
   * Gets the Bitcoin account address.
   * @returns {Promise<string>} A promise that resolves to the Bitcoin account address.
   */
  async getBtcAccount(): Promise<string> {
    return (await this.assertConnection()).address;
  }

  /**
   * Gets the Bitcoin public key.
   * @returns {Promise<ccc.Hex>} A promise that resolves to the Bitcoin public key.
   */
  async getBtcPublicKey(): Promise<ccc.Hex> {
    return ccc.hexFrom((await this.assertConnection()).publicKey);
  }

  /**
   * Connects to the provider by requesting accounts.
   * @returns {Promise<void>} A promise that resolves when the connection is established.
   */
  async connect(): Promise<void> {
    await this.provider.connect();
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

  /**
   * Checks if the signer is connected.
   * @returns {Promise<boolean>} A promise that resolves to true if connected, false otherwise.
   */
  async isConnected(): Promise<boolean> {
    if ((await this.provider.getSelectedAccount()) === null) {
      return false;
    }

    await this.connect();
    return true;
  }

  /**
   * Signs a raw message with the Bitcoin account.
   * @param {string | ccc.BytesLike} message - The message to sign.
   * @returns {Promise<string>} A promise that resolves to the signed message.
   */
  async signMessageRaw(message: string | ccc.BytesLike): Promise<string> {
    const challenge =
      typeof message === "string" ? message : ccc.hexFrom(message).slice(2);

    return this.provider.signMessage(challenge, "ecdsa");
  }
}

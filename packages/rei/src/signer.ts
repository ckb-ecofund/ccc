import { ccc } from "@ckb-ccc/core";
import { cccA } from "@ckb-ccc/core/advanced";

import { Provider } from "./advancedBarrel.js";

/**
 * Class representing a CKB signer that extends Signer from @ckb-ccc/core.
 * @public
 */
export class ReiSigner extends ccc.Signer {
  /**
   * Creates an instance of Signer.
   * @param client - The client instance.
   * @param provider - The provider instance.
   */
  constructor(
    client: ccc.Client,
    public readonly provider: Provider,
  ) {
    super(client);
  }

  /**
   * Register a listener to be called when this signer is replaced.
   *
   * @returns A function for unregister
   */

  onReplaced(listener: () => void): () => void {
    const stop: (() => void)[] = [];
    const replacer = async () => {
      listener();
      stop[0]?.();
    };
    stop.push(() => {
      this.provider.off("accountsChanged", replacer);
      this.provider.off("chainChanged", replacer);
    });
    this.provider.on("accountsChanged", replacer);
    this.provider.on("chainChanged", replacer);

    return stop[0];
  }

  /**
   * Gets the signer type.
   * @returns The type of the signer.
   */
  get type(): ccc.SignerType {
    return ccc.SignerType.CKB;
  }

  /**
   * Gets the sign type.
   * @returns The sign type.
   */
  get signType(): ccc.SignerSignType {
    return ccc.SignerSignType.CkbSecp256k1;
  }

  /**
   * Connects to the provider by requesting authentication.
   * @returns A promise that resolves when the connection is established.
   */
  async connect(): Promise<void> {
    const prefixClient = this.client.addressPrefix;
    const netChange = await this._getNetworkChanged();
    if (netChange) {
      const data = prefixClient === "ckb" ? "mainnet" : "testnet";
      await this.provider.request({ method: "ckb_switchNetwork", data });
    }
  }

  /**
   * Checks if the signer is connected.
   * @returns A promise that resolves to true if connected, false otherwise.
   */
  async isConnected(): Promise<boolean> {
    const connected = await this.provider.isConnected();
    if (!connected || (await this._getNetworkChanged())) {
      return false;
    }
    return connected;
  }

  async _getNetworkChanged(): Promise<boolean> {
    const prefixClient = this.client.addressPrefix;

    const address = await this.getInternalAddress();
    const { prefix } = cccA.addressPayloadFromString(address);
    return prefixClient !== prefix;
  }

  /**
   * Gets the internal address.
   * @returns A promise that resolves to the internal address.
   */
  async getInternalAddress(): Promise<string> {
    return this.provider.request({ method: "ckb_requestAccounts" });
  }

  /**
   * Gets the address object.
   * @returns A promise that resolves to the address object.
   */
  async getAddressObj(): Promise<ccc.Address> {
    return ccc.Address.fromString(await this.getInternalAddress(), this.client);
  }

  /**
   * Gets the address objects.
   * @returns A promise that resolves to an array of address objects.
   */
  async getAddressObjs(): Promise<ccc.Address[]> {
    return [await this.getAddressObj()];
  }

  /**
   * Gets the identity of the signer.
   * @returns A promise that resolves to the identity.
   */
  async getIdentity(): Promise<string> {
    return this.provider.request({
      method: "ckb_getPublicKey",
    });
  }

  /**
   * Signs a raw message with the personal account.
   * @param message - The message to sign.
   * @returns A promise that resolves to the signed message.
   */
  async signMessageRaw(message: string): Promise<ccc.Hex> {
    return this.provider.request({
      method: "ckb_signMessage",
      data: { message },
    });
  }

  /**
   * prepare a transaction before signing.
   *
   * @param txLike - The transaction to prepare, represented as a TransactionLike object.
   * @returns A promise that resolves to the prepared Transaction object.
   */

  async prepareTransaction(
    txLike: ccc.TransactionLike,
  ): Promise<ccc.Transaction> {
    const tx = ccc.Transaction.from(txLike);
    await tx.addCellDepsOfKnownScripts(
      this.client,
      ccc.KnownScript.Secp256k1Blake160,
    );
    return ccc.reduceAsync(
      await this.getAddressObjs(),
      (tx: ccc.Transaction, { script }) =>
        tx.prepareSighashAllWitness(script, 65, this.client),
      tx,
    );
  }

  /**
   * Signs a transaction without preparing information for it.
   *
   * @param txLike - The transaction to sign, represented as a TransactionLike object.
   * @returns A promise that resolves to the signed Transaction object.
   */

  async signOnlyTransaction(
    txLike: ccc.TransactionLike,
  ): Promise<ccc.Transaction> {
    const txFormat = cccA.JsonRpcTransformers.transactionFrom(txLike);

    return this.provider.request({
      method: "ckb_signTransaction",
      data: { txSkeleton: txFormat },
    });
  }
}

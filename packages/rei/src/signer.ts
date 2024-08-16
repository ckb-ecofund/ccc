import { ccc, numToHex, OutPoint } from "@ckb-ccc/core";
import {
  addressPayloadFromString,
  JsonRpcTransformers,
} from "@ckb-ccc/core/advanced";
import {
  createTransactionSkeleton,
  transactionSkeletonToObject,
} from "@ckb-lumos/helpers";
import { Provider } from "./advancedBarrel.js";

/**
 * Class representing a CKB signer that extends Signer from @ckb-ccc/core.
 * @class
 * @extends {ccc.Signer}
 */
export class ReiSigner extends ccc.Signer {
  /**
   * Creates an instance of Signer.
   * @param {ccc.Client} client - The client instance.
   * @param {Provider} provider - The provider instance.
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
   * @returns {ccc.SignerType} The type of the signer.
   */
  get type(): ccc.SignerType {
    return ccc.SignerType.CKB;
  }

  /**
   * Gets the sign type.
   * @returns {ccc.SignerSignType} The sign type.
   */
  get signType(): ccc.SignerSignType {
    return ccc.SignerSignType.CkbSecp256k1;
  }

  /**
   * Connects to the provider by requesting authentication.
   * @returns {Promise<void>} A promise that resolves when the connection is established.
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
   * @returns {Promise<boolean>} A promise that resolves to true if connected, false otherwise.
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
    const { prefix } = addressPayloadFromString(address);
    return prefixClient !== prefix;
  }

  /**
   * Gets the internal address.
   * @returns {Promise<string>} A promise that resolves to the internal address.
   */
  async getInternalAddress(): Promise<string> {
    return await this.provider.request({ method: "ckb_requestAccounts" });
  }

  /**
   * Gets the address object.
   * @returns {Promise<ccc.Address>} A promise that resolves to the address object.
   */
  async getAddressObj(): Promise<ccc.Address> {
    return await ccc.Address.fromString(
      await this.getInternalAddress(),
      this.client,
    );
  }

  /**
   * Gets the address objects.
   * @returns {Promise<ccc.Address[]>} A promise that resolves to an array of address objects.
   */
  async getAddressObjs(): Promise<ccc.Address[]> {
    return [await this.getAddressObj()];
  }

  /**
   * Gets the identity of the signer.
   * @returns {Promise<string>} A promise that resolves to the identity.
   */
  async getIdentity(): Promise<string> {
    return await this.provider.request({
      method: "ckb_getPublicKey",
    });
  }

  /**
   * Signs a raw message with the personal account.
   * @param {string} message - The message to sign.
   * @returns {Promise<ccc.Hex>} A promise that resolves to the signed message.
   */
  async signMessageRaw(message: string): Promise<ccc.Hex> {
    return await this.provider.request({
      method: "ckb_signMessage",
      data: { message: message },
    });
  }

  /**
   * prepare a transaction before signing.
   *
   * @param _ - The transaction to prepare, represented as a TransactionLike object.
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
   * @param _ - The transaction to sign, represented as a TransactionLike object.
   * @returns A promise that resolves to the signed Transaction object.
   */

  async signOnlyTransaction(
    txLike: ccc.TransactionLike,
  ): Promise<ccc.Transaction> {
    const tx = ccc.Transaction.from(txLike);
    let txFormat = JsonRpcTransformers.transactionFrom(tx);
    let result = JsonRpcTransformers.transactionTo(txFormat);
    const txString = result.stringify();
    const unsigned = JSON.parse(txString);

    const fetcher = async (outPoint: OutPoint) => {
      const fRt = await this.client.getCell(outPoint);
      const jsonStr = JSON.stringify(fRt, (_, value) => {
        if (typeof value === "bigint") {
          return numToHex(value);
        }
        return value;
      });
      return JSON.parse(jsonStr);
    };

    const txSkeleton = await createTransactionSkeleton(
      unsigned,
      fetcher as any,
    );
    const txObj = transactionSkeletonToObject(txSkeleton);

    return await this.provider.request({
      method: "ckb_signRawTransaction",
      data: { txSkeleton: txObj },
    });
  }
}

import { Address } from "../address";
import { BytesLike } from "../bytes";
import { Transaction, TransactionLike } from "../ckb";
import { Client } from "../client";
import { Hex } from "../hex";

/**
 * An abstract class representing a generic signer.
 * This class provides methods to connect, get addresses, and sign transactions.
 */
export abstract class Signer {
  constructor(protected client_: Client) {}

  get client(): Client {
    return this.client_;
  }

  /**
   * Construct a new signer with the client replaced.
   *
   * @returns A promise that resolves the new Signer.
   */
  abstract replaceClient(client: Client): Promise<Signer>;

  /**
   * Connects to the signer.
   *
   * @returns A promise that resolves when the connection is complete.
   */
  abstract connect(): Promise<void>;

  /**
   * Disconnects to the signer.
   *
   * @returns A promise that resolves when disconnected.
   */
  async disconnect(): Promise<void> {}

  /**
   * Check if the signer is connected.
   *
   * @returns A promise that resolves the connection status.
   */
  abstract isConnected(): Promise<boolean>;

  /**
   * Gets the internal address associated with the signer.
   *
   * @returns A promise that resolves to a string representing the internal address.
   */
  abstract getInternalAddress(): Promise<string>;

  /**
   * Gets an array of Address objects associated with the signer.
   *
   * @returns A promise that resolves to an array of Address objects.
   */
  abstract getAddressObjs(): Promise<Address[]>;

  /**
   * Gets the recommended Address object for the signer.
   *
   * @param _preference - Optional preference parameter.
   * @returns A promise that resolves to the recommended Address object.
   */
  async getRecommendedAddressObj(_preference?: unknown): Promise<Address> {
    return (await this.getAddressObjs())[0];
  }

  /**
   * Gets the recommended address for the signer as a string.
   *
   * @param preference - Optional preference parameter.
   * @returns A promise that resolves to the recommended address as a string.
   */
  async getRecommendedAddress(preference?: unknown): Promise<string> {
    return (await this.getRecommendedAddressObj(preference)).toString();
  }

  /**
   * Gets an array of addresses associated with the signer as strings.
   *
   * @returns A promise that resolves to an array of addresses as strings.
   */
  async getAddresses(): Promise<string[]> {
    return this.getAddressObjs().then((addresses) =>
      addresses.map((address) => address.toString()),
    );
  }

  /**
   * Signs a message. This method is not implemented and should be overridden by subclasses.
   *
   * @param _ - The message to sign, as a string or BytesLike object.
   * @returns A promise that resolves to the signed message as a string.
   * @throws Will throw an error if not implemented.
   */
  signMessage(_: string | BytesLike): Promise<string> {
    throw Error("Signer.signMessage not implemented");
  }

  /**
   * Sends a transaction after signing it.
   *
   * @param tx - The transaction to send, represented as a TransactionLike object.
   * @returns A promise that resolves to the transaction hash as a Hex string.
   */
  async sendTransaction(tx: TransactionLike): Promise<Hex> {
    return this.client.sendTransaction(await this.signTransaction(tx));
  }

  /**
   * Signs a transaction.
   *
   * @param tx - The transaction to sign, represented as a TransactionLike object.
   * @returns A promise that resolves to the signed Transaction object.
   */
  async signTransaction(tx: TransactionLike): Promise<Transaction> {
    const preparedTx = await this.prepareTransaction(tx);
    return this.signOnlyTransaction(preparedTx);
  }

  /**
   * prepare a transaction before signing. This method is not implemented and should be overridden by subclasses.
   *
   * @param _ - The transaction to prepare, represented as a TransactionLike object.
   * @returns A promise that resolves to the prepared Transaction object.
   * @throws Will throw an error if not implemented.
   */
  prepareTransaction(_: TransactionLike): Promise<Transaction> {
    throw Error("Signer.prepareTransaction not implemented");
  }

  /**
   * Signs a transaction without sending it. This method is not implemented and should be overridden by subclasses.
   *
   * @param _ - The transaction to sign, represented as a TransactionLike object.
   * @returns A promise that resolves to the signed Transaction object.
   * @throws Will throw an error if not implemented.
   */
  signOnlyTransaction(_: TransactionLike): Promise<Transaction> {
    throw Error("Signer.signOnlyTransaction not implemented");
  }
}

/**
 * An enumeration of signer types.
 */
export enum SignerType {
  EVM = "EVM",
  BTC = "BTC",
  CKB = "CKB",
}

/**
 * A class representing information about a signer, including its type and the signer instance.
 */
export class SignerInfo {
  constructor(
    public name: string,
    public type: SignerType,
    public signer: Signer,
  ) {}
}

/**
 * Represents a wallet with a name, icon, and an array of signer information.
 */
export type Wallet = {
  name: string;
  icon: string;
};

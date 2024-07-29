import { Address } from "../../address";
import { BytesLike } from "../../bytes";
import { Transaction, TransactionLike } from "../../ckb";
import { Client } from "../../client";
import { Hex } from "../../hex";
import { Num } from "../../num";
import { verifyMessageBtcEcdsa } from "../btc";
import { verifyMessageCkbSecp256k1 } from "../ckb/verifyCkbSecp256k1";
import { verifyMessageJoyId } from "../ckb/verifyJoyId";
import { verifyMessageEvmPersonal } from "../evm/verify";
import { verifyMessageNostrEvent } from "../nostr/verify";

export enum SignerSignType {
  Unknown = "Unknown",
  BtcEcdsa = "BtcEcdsa",
  EvmPersonal = "EvmPersonal",
  JoyId = "JoyId",
  NostrEvent = "NostrEvent",
  CkbSecp256k1 = "CkbSecp256k1",
}

/**
 * An enumeration of signer display types in wallet.
 */
export enum SignerType {
  EVM = "EVM",
  BTC = "BTC",
  CKB = "CKB",
  Nostr = "Nostr",
}

export type NetworkPreference = {
  addressPrefix: string;
  signerType: SignerType;
  network: string;
  /*
    Wallet signers should check if the wallet is using preferred networks.
    If not, try to switch to the first preferred network.
    If non preferred, let users choose what they want.

    BTC: // They made a mess...
      btc
      btcTestnet
      btcSignet // OKX
      fractalBtc // UniSat
  */
};

export class Signature {
  constructor(
    public signature: string,
    public identity: string,
    public signType: SignerSignType,
  ) {}
}

/**
 * An abstract class representing a generic signer.
 * This class provides methods to connect, get addresses, and sign transactions.
 */
export abstract class Signer {
  constructor(protected client_: Client) {}

  abstract get type(): SignerType;
  abstract get signType(): SignerSignType;

  get client(): Client {
    return this.client_;
  }

  // Returns the preference if we need to switch network
  // undefined otherwise
  matchNetworkPreference(
    preferences: NetworkPreference[],
    currentNetwork: string,
  ) {
    if (
      preferences.some(({ signerType, addressPrefix, network }) => {
        signerType === this.type &&
          addressPrefix === this.client.addressPrefix &&
          network === currentNetwork;
      })
    ) {
      return;
    }
    return preferences.find(
      ({ signerType, addressPrefix }) =>
        signerType === this.type && addressPrefix === this.client.addressPrefix,
    );
  }

  static async verifyMessage(
    message: string | BytesLike,
    signature: Signature,
  ): Promise<boolean> {
    switch (signature.signType) {
      case SignerSignType.EvmPersonal:
        return verifyMessageEvmPersonal(
          message,
          signature.signature,
          signature.identity,
        );
      case SignerSignType.BtcEcdsa:
        return verifyMessageBtcEcdsa(
          message,
          signature.signature,
          signature.identity,
        );
      case SignerSignType.JoyId:
        return verifyMessageJoyId(
          message,
          signature.signature,
          signature.identity,
        );
      case SignerSignType.NostrEvent:
        return verifyMessageNostrEvent(
          message,
          signature.signature,
          signature.identity,
        );
      case SignerSignType.CkbSecp256k1:
        return verifyMessageCkbSecp256k1(
          message,
          signature.signature,
          signature.identity,
        );
      case SignerSignType.Unknown:
        throw new Error("Unknown signer sign type");
    }
  }

  /**
   * Connects to the signer.
   *
   * @returns A promise that resolves when the connection is complete.
   */
  abstract connect(): Promise<void>;

  /**
   * Register a listener to be called when this signer is replaced.
   *
   * @returns A function for unregister
   */
  onReplaced(_: () => void): () => void {
    return () => {};
  }

  /**
   * Disconnects to the signer.
   *
   * @returns A promise that resolves when the signer is disconnected.
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
   * Gets the identity for verifying signature, usually it's address
   *
   * @returns A promise that resolves to a string representing the identity
   */
  async getIdentity(): Promise<string> {
    return this.getInternalAddress();
  }

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
   * Gets balance of all addresses
   *
   * @returns A promise that resolves to the balance
   */
  async getBalance(): Promise<Num> {
    return this.client.getBalance(
      (await this.getAddressObjs()).map(({ script }) => script),
    );
  }

  /**
   * Signs a message.
   *
   * @param _ - The message to sign, as a string or BytesLike object.
   * @returns A promise that resolves to the signature info.
   * @throws Will throw an error if not implemented.
   */
  async signMessage(message: string | BytesLike): Promise<Signature> {
    return {
      signature: await this.signMessageRaw(message),
      identity: await this.getIdentity(),
      signType: this.signType,
    };
  }

  /**
   * Signs a message and returns signature only. This method is not implemented and should be overridden by subclasses.
   *
   * @param _ - The message to sign, as a string or BytesLike object.
   * @returns A promise that resolves to the signature as a string.
   * @throws Will throw an error if not implemented.
   */
  signMessageRaw(_: string | BytesLike): Promise<string> {
    throw Error("Signer.signMessageRaw not implemented");
  }

  /**
   * Verify a signature.
   *
   * @param _ - The original message.
   * @param _ - The signature to verify.
   * @returns A promise that resolves to the verification result.
   * @throws Will throw an error if not implemented.
   */
  async verifyMessage(
    message: string | BytesLike,
    signature: string | Signature,
  ): Promise<boolean> {
    if (typeof signature === "string") {
      return Signer.verifyMessage(message, {
        signType: this.signType,
        signature,
        identity: await this.getIdentity(),
      });
    }

    if (
      signature.identity !== (await this.getIdentity()) ||
      ![SignerSignType.Unknown, this.signType].includes(signature.signType)
    ) {
      return false;
    }

    return Signer.verifyMessage(message, signature);
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
   * Signs a transaction without preparing information for it. This method is not implemented and should be overridden by subclasses.
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
 * A class representing information about a signer, including its type and the signer instance.
 */
export class SignerInfo {
  constructor(
    public name: string,
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

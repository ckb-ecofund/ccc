import { ripemd160 } from "@noble/hashes/ripemd160";
import { sha256 } from "@noble/hashes/sha256";
import { Address } from "../../address";
import { bytesConcat, bytesFrom } from "../../bytes";
import { Transaction, TransactionLike, WitnessArgs } from "../../ckb";
import { KnownScript } from "../../client";
import { HexLike, hexFrom } from "../../hex";
import { numToBytes } from "../../num";
import { getSignHashInfo, prepareSighashAllWitness } from "../helpers";
import { Signer } from "../signer";

/**
 * An abstract class extending the Signer class for Bitcoin-like signing operations.
 * This class provides methods to get Bitcoin account, public key, and internal address,
 * as well as signing transactions.
 */
export abstract class SignerBtc extends Signer {
  /**
   * Gets the Bitcoin account associated with the signer.
   *
   * @returns A promise that resolves to a string representing the Bitcoin account.
   */
  abstract getBtcAccount(): Promise<string>;

  /**
   * Gets the Bitcoin public key associated with the signer.
   *
   * @returns A promise that resolves to a HexLike value representing the Bitcoin public key.
   */
  abstract getBtcPublicKey(): Promise<HexLike>;

  /**
   * Gets the internal address, which is the Bitcoin account in this case.
   *
   * @returns A promise that resolves to a string representing the internal address.
   */
  async getInternalAddress(): Promise<string> {
    return this.getBtcAccount();
  }

  /**
   * Gets an array of Address objects representing the known script addresses for the signer.
   *
   * @returns A promise that resolves to an array of Address objects.
   */
  async getAddressObjs(): Promise<Address[]> {
    const publicKey = await this.getBtcPublicKey();
    const hash = ripemd160(sha256(bytesFrom(publicKey)));

    return [
      await Address.fromKnownScript(
        KnownScript.OmniLock,
        hexFrom([0x04, ...hash, 0x00]),
        this.client,
      ),
    ];
  }

  /**
   * prepare a transaction before signing. This method is not implemented and should be overridden by subclasses.
   *
   * @param txLike - The transaction to prepare, represented as a TransactionLike object.
   * @returns A promise that resolves to the prepared Transaction object.
   */
  async prepareTransaction(txLike: TransactionLike): Promise<Transaction> {
    const { script } = await this.getRecommendedAddressObj();
    return prepareSighashAllWitness(txLike, script, 85, this.client);
  }

  /**
   * Signs a transaction without modifying it.
   *
   * @param txLike - The transaction to sign, represented as a TransactionLike object.
   * @returns A promise that resolves to a signed Transaction object.
   */
  async signOnlyTransaction(txLike: TransactionLike): Promise<Transaction> {
    const tx = Transaction.from(txLike);
    const { script } = await this.getRecommendedAddressObj();
    const info = await getSignHashInfo(tx, script, this.client);
    if (!info) {
      return tx;
    }

    const signature = bytesFrom(
      await this.signMessage(
        `CKB (Bitcoin Layer) transaction: ${info.message}`,
      ),
      "base64",
    );
    signature[0] = 31 + ((signature[0] - 27) % 4);

    const witness = WitnessArgs.fromBytes(tx.witnesses[info.position]);
    witness.lock = hexFrom(
      bytesConcat(
        numToBytes(5 * 4 + signature.length, 4),
        numToBytes(4 * 4, 4),
        numToBytes(5 * 4 + signature.length, 4),
        numToBytes(5 * 4 + signature.length, 4),
        numToBytes(signature.length, 4),
        signature,
      ),
    );

    tx.witnesses[info.position] = hexFrom(witness.toBytes());

    return tx;
  }
}

import { Address } from "../../address";
import { bytesConcat, bytesFrom } from "../../bytes";
import { Transaction, TransactionLike, WitnessArgs } from "../../ckb";
import { KnownScript } from "../../client";
import { hexFrom } from "../../hex";
import { numToBytes } from "../../num";
import { getSignHashInfo, prepareSighashAllWitness } from "../helpers";
import { Signer } from "../signer";

/**
 * An abstract class extending Signer for Ethereum Virtual Machine (EVM) based signing operations.
 * This class provides methods to get EVM account, internal address, and signing transactions.
 */
export abstract class SignerEvm extends Signer {
  /**
   * Gets the EVM account associated with the signer.
   *
   * @returns A promise that resolves to a string representing the EVM account.
   */
  abstract getEvmAccount(): Promise<string>;

  /**
   * Gets the internal address, which is the EVM account in this case.
   *
   * @returns A promise that resolves to a string representing the internal address.
   */
  async getInternalAddress(): Promise<string> {
    return this.getEvmAccount();
  }

  /**
   * Gets an array of Address objects representing the known script addresses for the signer.
   *
   * @returns A promise that resolves to an array of Address objects.
   */
  async getAddressObjs(): Promise<Address[]> {
    const account = await this.getEvmAccount();
    return [
      await Address.fromKnownScript(
        KnownScript.OmniLock,
        hexFrom([0x12, ...bytesFrom(account), 0x00]),
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
      await this.signMessage(`CKB transaction: ${info.message}`),
    );
    if (signature[signature.length - 1] >= 27) {
      signature[signature.length - 1] -= 27;
    }

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

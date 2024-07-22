import { Address } from "../../address";
import { BytesLike, bytesConcat, bytesFrom } from "../../bytes";
import { Script, Transaction, TransactionLike, WitnessArgs } from "../../ckb";
import { KnownScript } from "../../client";
import { Hex, hexFrom } from "../../hex";
import { numToBytes } from "../../num";
import { reduceAsync } from "../../utils";
import { Signer, SignerSignType, SignerType } from "../signer";

/**
 * An abstract class extending Signer for Ethereum Virtual Machine (EVM) based signing operations.
 * This class provides methods to get EVM account, internal address, and signing transactions.
 */
export abstract class SignerEvm extends Signer {
  get type(): SignerType {
    return SignerType.EVM;
  }

  get signType(): SignerSignType {
    return SignerSignType.EvmPersonal;
  }

  /**
   * Gets the EVM account associated with the signer.
   *
   * @returns A promise that resolves to a string representing the EVM account.
   */
  abstract getEvmAccount(): Promise<Hex>;

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
      await this._getOmniLockEvmAddressObj(account),
      await this._getOmniLockOldEvmAddressObj(account),
    ];
  }

  async _getOmniLockEvmAddressObj(account: string): Promise<Address> {
    return Address.fromKnownScript(
      this.client,
      KnownScript.OmniLock,
      hexFrom([0x12, ...bytesFrom(account), 0x00]),
    );
  }

  async _getOmniLockOldEvmAddressObj(account: string): Promise<Address> {
    return Address.fromKnownScript(
      this.client,
      KnownScript.OmniLock,
      hexFrom([0x1, ...bytesFrom(account), 0x00]),
    );
  }

  /**
   * prepare a transaction before signing. This method is not implemented and should be overridden by subclasses.
   *
   * @param txLike - The transaction to prepare, represented as a TransactionLike object.
   * @returns A promise that resolves to the prepared Transaction object.
   */
  async prepareTransaction(txLike: TransactionLike): Promise<Transaction> {
    const tx = Transaction.from(txLike);
    await tx.addCellDepsOfKnownScripts(this.client, KnownScript.OmniLock);
    return reduceAsync(
      await this.getAddressObjs(),
      (tx: Transaction, { script }) =>
        tx.prepareSighashAllWitness(script, 85, this.client),
      tx,
    );
  }

  /**
   * Signs a transaction without modifying it.
   *
   * @param txLike - The transaction to sign, represented as a TransactionLike object.
   * @returns A promise that resolves to a signed Transaction object.
   */
  async signOnlyTransaction(txLike: TransactionLike): Promise<Transaction> {
    let tx = Transaction.from(txLike);

    const account = await this.getEvmAccount();
    const { script: evmScript } = await this._getOmniLockEvmAddressObj(account);
    const { script: oldEvmScript } =
      await this._getOmniLockOldEvmAddressObj(account);

    tx = await this._signOmniLockScriptForTransaction(
      tx,
      evmScript,
      (hash) => `CKB transaction: ${hash}`,
    );
    tx = await this._signOmniLockScriptForTransaction(
      tx,
      oldEvmScript,
      (hash) => bytesFrom(hash),
    );

    return tx;
  }

  async _signOmniLockScriptForTransaction(
    tx: Transaction,
    script: Script,
    messageTransformer: (hash: string) => BytesLike,
  ): Promise<Transaction> {
    const info = await tx.getSignHashInfo(script, this.client);
    if (!info) {
      return tx;
    }

    const signature = bytesFrom(
      await this.signMessageRaw(messageTransformer(info.message)),
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

    tx.setWitnessArgsAt(info.position, witness);

    return tx;
  }
}

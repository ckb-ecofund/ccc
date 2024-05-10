import { Address } from "../../address";
import { bytesConcat, bytesFrom } from "../../bytes";
import { Transaction, WitnessArgs } from "../../ckb";
import { KnownScript } from "../../client";
import { hexFrom } from "../../hex";
import { numToBytes } from "../../num";
import { getSignHashInfo } from "../helpers";
import { Signer } from "../signer";

export abstract class SignerEvm extends Signer {
  abstract getEvmAccount(): Promise<string>;

  async getInternalAddress(): Promise<string> {
    return this.getEvmAccount();
  }

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

  async signOnlyTransaction(tx: Transaction): Promise<Transaction> {
    const { script } = await this.getRecommendedAddressObj();
    const info = await getSignHashInfo(tx, script);
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

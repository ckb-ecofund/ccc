import { ripemd160 } from "@noble/hashes/ripemd160";
import { sha256 } from "@noble/hashes/sha256";
import { Address } from "../address";
import { bytesConcat, bytesFrom } from "../bytes";
import { Transaction, WitnessArgs } from "../ckb";
import { KnownScript } from "../client";
import { HexLike, hexFrom } from "../hex";
import { numToBytes } from "../num";
import { getSignHashInfo } from "./helpers";
import { Signer } from "./signer";

export abstract class SignerBTC extends Signer {
  abstract getBTCAccount(): Promise<string>;

  abstract getBTCPublicKey(): Promise<HexLike>;

  async getInternalAddress(): Promise<string> {
    return this.getBTCAccount();
  }

  async getAddressObjs(): Promise<Address[]> {
    const publicKey = await this.getBTCPublicKey();
    const hash = ripemd160(sha256(bytesFrom(publicKey)));

    return [
      await Address.fromKnownScript(
        KnownScript.OmniLock,
        hexFrom([0x04, ...hash, 0x00]),
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

import { secp256k1 } from "@noble/curves/secp256k1";
import { bytesConcat, bytesFrom, BytesLike } from "../../bytes";
import { Transaction, TransactionLike, WitnessArgs } from "../../ckb";
import { Client } from "../../client";
import { Hex, hexFrom, HexLike } from "../../hex";
import { numBeToBytes } from "../../num";
import { SignerCkbPublicKey } from "./signerCkbPublicKey";
import { messageHashCkbSecp256k1 } from "./verifyCkbSecp256k1";

export class SignerCkbPrivateKey extends SignerCkbPublicKey {
  public readonly privateKey: Hex;

  constructor(client: Client, privateKey: HexLike) {
    const pk = hexFrom(privateKey);
    if (bytesFrom(pk).length !== 32) {
      throw new Error("Private key must be 32 bytes!");
    }

    super(client, secp256k1.getPublicKey(bytesFrom(pk), true));
    this.privateKey = pk;
  }

  async signMessageRaw(message: string | BytesLike): Promise<Hex> {
    const signature = secp256k1.sign(
      bytesFrom(messageHashCkbSecp256k1(message)),
      bytesFrom(this.privateKey),
    );
    const { r, s, recovery } = signature;

    return hexFrom(
      bytesConcat(
        numBeToBytes(r, 32),
        numBeToBytes(s, 32),
        numBeToBytes(recovery, 1),
      ),
    );
  }

  async signOnlyTransaction(txLike: TransactionLike): Promise<Transaction> {
    const tx = Transaction.from(txLike);
    const { script } = await this.getRecommendedAddressObj();
    const info = await tx.getSignHashInfo(script, this.client);
    if (!info) {
      return tx;
    }

    const signature = await this.signMessageRaw(info.message);

    const witness = tx.getWitnessArgsAt(info.position) ?? WitnessArgs.from({});
    witness.lock = signature;
    tx.setWitnessArgsAt(info.position, witness);
    return tx;
  }
}

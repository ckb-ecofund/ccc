import { secp256k1 } from "@noble/curves/secp256k1";
import { Address } from "../../address";
import { Bytes, bytesConcat, bytesFrom, BytesLike } from "../../bytes";
import { Transaction, TransactionLike, WitnessArgs } from "../../ckb";
import { Client, KnownScript } from "../../client";
import { hashCkb } from "../../hasher";
import { Hex, hexFrom, HexLike } from "../../hex";
import { numBeToBytes } from "../../num";
import { Signer, SignerSignType, SignerType } from "../signer";

export class SignerCkbPrivateKey extends Signer {
  get type(): SignerType {
    return SignerType.CKB;
  }

  get signType(): SignerSignType {
    return SignerSignType.CkbSecp256k1;
  }

  private readonly privateKey: Hex;

  constructor(client: Client, privateKey: HexLike) {
    super(client);
    this.privateKey = hexFrom(privateKey);

    if (bytesFrom(this.privateKey).length !== 32) {
      throw new Error("Private key must be 32 bytes!");
    }
  }

  async connect(): Promise<void> {}

  async isConnected(): Promise<boolean> {
    return true;
  }

  async getInternalAddress(): Promise<string> {
    return this.getRecommendedAddress();
  }

  async getAddressObjs(): Promise<Address[]> {
    const publicKey = this.getPublicKey();
    return [
      await Address.fromKnownScript(
        this.client,
        KnownScript.Secp256k1Blake160,
        bytesFrom(hashCkb(publicKey)).slice(0, 20),
      ),
    ];
  }

  async signMessageRaw(message: string | BytesLike): Promise<Hex> {
    const signature = secp256k1.sign(
      bytesFrom(message),
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

  getPublicKey(): Bytes {
    return secp256k1.getPublicKey(bytesFrom(this.privateKey), true);
  }

  async prepareTransaction(txLike: TransactionLike): Promise<Transaction> {
    const tx = Transaction.from(txLike);
    const { script } = await this.getRecommendedAddressObj();
    await tx.addCellDepsOfKnownScripts(
      this.client,
      KnownScript.Secp256k1Blake160,
    );
    await tx.prepareSighashAllWitness(script, 65, this.client);
    return tx;
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

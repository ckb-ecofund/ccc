import { Address } from "../../address";
import { bytesFrom } from "../../bytes";
import { Transaction, TransactionLike } from "../../ckb";
import { Client, KnownScript } from "../../client";
import { hashCkb } from "../../hasher";
import { Hex, HexLike, hexFrom } from "../../hex";
import { Signer, SignerSignType, SignerType } from "../signer";

export class SignerCkbPublicKey extends Signer {
  get type(): SignerType {
    return SignerType.CKB;
  }

  get signType(): SignerSignType {
    return SignerSignType.CkbSecp256k1;
  }

  public readonly publicKey: Hex;

  constructor(client: Client, publicKey: HexLike) {
    super(client);
    this.publicKey = hexFrom(publicKey);

    if (bytesFrom(this.publicKey).length !== 33) {
      throw new Error("Public key must be 33 bytes!");
    }
  }

  async connect(): Promise<void> {}

  async isConnected(): Promise<boolean> {
    return true;
  }

  async getInternalAddress(): Promise<string> {
    return this.getRecommendedAddress();
  }

  async getIdentity(): Promise<string> {
    return this.publicKey;
  }

  async getAddressObjs(): Promise<Address[]> {
    return [
      await Address.fromKnownScript(
        this.client,
        KnownScript.Secp256k1Blake160,
        bytesFrom(hashCkb(this.publicKey)).slice(0, 20),
      ),
    ];
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
}

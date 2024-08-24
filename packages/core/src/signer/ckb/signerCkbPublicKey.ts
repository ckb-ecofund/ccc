import { Address } from "../../address/index.js";
import { bytesFrom } from "../../bytes/index.js";
import { Transaction, TransactionLike } from "../../ckb/index.js";
import { Client, KnownScript } from "../../client/index.js";
import { hashCkb } from "../../hasher/index.js";
import { Hex, HexLike, hexFrom } from "../../hex/index.js";
import { Signer, SignerSignType, SignerType } from "../signer/index.js";

/**
 * @public
 */
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

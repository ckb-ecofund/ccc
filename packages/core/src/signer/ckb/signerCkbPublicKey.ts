import { Address } from "../../address/index.js";
import { bytesFrom } from "../../bytes/index.js";
import { Script, Transaction, TransactionLike } from "../../ckb/index.js";
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

  async getRecommendedAddressObj(_preference?: unknown): Promise<Address> {
    return Address.fromKnownScript(
      this.client,
      KnownScript.Secp256k1Blake160,
      bytesFrom(hashCkb(this.publicKey)).slice(0, 20),
    );
  }

  async getAddressObjs(): Promise<Address[]> {
    const recommended = await this.getRecommendedAddressObj();

    const addresses: Address[] = [];
    let count = 0;
    for await (const cell of this.client.findCells({
      script: await Script.fromKnownScript(
        this.client,
        KnownScript.AnyoneCanPay,
        recommended.script.args,
      ),
      scriptType: "lock",
      scriptSearchMode: "prefix",
      withData: false,
    })) {
      if (count >= 10) {
        break;
      }
      count += 1;

      if (addresses.some(({ script }) => script.eq(cell.cellOutput.lock))) {
        continue;
      }

      addresses.push(
        Address.from({
          prefix: this.client.addressPrefix,
          script: cell.cellOutput.lock,
        }),
      );
    }

    return [recommended, ...addresses];
  }

  async prepareTransaction(txLike: TransactionLike): Promise<Transaction> {
    const tx = Transaction.from(txLike);
    const addresses = await this.getAddressObjs();
    await tx.addCellDepsOfKnownScripts(
      this.client,
      KnownScript.Secp256k1Blake160,
    );
    if (addresses.length > 1) {
      await tx.addCellDepsOfKnownScripts(this.client, KnownScript.AnyoneCanPay);
    }

    await Promise.all(
      addresses.map(({ script }) =>
        tx.prepareSighashAllWitness(script, 65, this.client),
      ),
    );
    return tx;
  }
}

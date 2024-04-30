import { ccc } from "@ckb-ccc/core";
import { ripemd160 } from "@noble/hashes/ripemd160";
import { sha256 } from "@noble/hashes/sha256";
import { Provider } from "./uni-sat.advanced";

export class Signer extends ccc.Signer {
  constructor(
    client: ccc.Client,
    public readonly provider: Provider,
  ) {
    super(client);
  }

  async getBTCAccount() {
    return (await this.provider.getAccounts())[0];
  }

  async getBTCPublicKey(): Promise<ccc.Hex> {
    return ccc.hexFrom(await this.provider.getPublicKey());
  }

  async getInternalAddress(): Promise<string> {
    return this.getBTCAccount();
  }

  async getAddressObjs(): Promise<ccc.Address[]> {
    const publicKey = await this.getBTCPublicKey();
    const hash = ripemd160(sha256(ccc.bytesFrom(publicKey)));

    return [
      await ccc.Address.fromKnownScript(
        ccc.KnownScript.OmniLock,
        ccc.hexFrom([0x04, ...hash, 0x00]),
        this.client,
      ),
    ];
  }

  async connect(): Promise<void> {
    await this.provider.requestAccounts();
  }

  async signMessage(message: string | ccc.BytesLike): Promise<string> {
    const challenge =
      typeof message === "string" ? message : ccc.hexFrom(message).slice(2);

    return this.provider.signMessage(challenge, "ecdsa");
  }

  async signOnlyTransaction(tx: ccc.Transaction): Promise<ccc.Transaction> {
    const { script } = await this.getRecommendedAddressObj();
    const info = await ccc.getSignHashInfo(tx, script);
    if (!info) {
      return tx;
    }

    const signature = ccc.bytesFrom(
      await this.signMessage(
        `CKB (Bitcoin Layer) transaction: ${info.message}`,
      ),
      "base64",
    );
    signature[0] = 31 + ((signature[0] - 27) % 4);

    console.log(ccc.hexFrom(signature));

    const witness = ccc.WitnessArgs.fromBytes(tx.witnesses[info.position]);
    witness.lock = ccc.hexFrom(
      ccc.bytesConcat(
        ccc.numToBytes(5 * 4 + signature.length, 4),
        ccc.numToBytes(4 * 4, 4),
        ccc.numToBytes(5 * 4 + signature.length, 4),
        ccc.numToBytes(5 * 4 + signature.length, 4),
        ccc.numToBytes(signature.length, 4),
        signature,
      ),
    );

    tx.witnesses[info.position] = ccc.hexFrom(witness.toBytes());

    return tx;
  }
}

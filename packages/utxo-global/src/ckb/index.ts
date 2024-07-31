import { ccc } from "@ckb-ccc/core";
import { Provider } from "../advancedBarrel.js";

export class SignerCkb extends ccc.Signer {
  private accountCache: string | undefined;
  get type(): ccc.SignerType {
    return ccc.SignerType.CKB;
  }

  /**
   * Gets the sign type.
   * @returns {ccc.SignerSignType} The sign type.
   */
  get signType(): ccc.SignerSignType {
    return ccc.SignerSignType.CkbSecp256k1;
  }

  constructor(
    client: ccc.Client,
    public readonly provider: Provider,
  ) {
    super(client);
  }

  getInternalAddress(): Promise<string> {
    return this.getAccount();
  }

  async getIdentity(): Promise<string> {
    return this.getPublicKey();
  }

  async getAddressObj(): Promise<ccc.Address> {
    const address = await this.getInternalAddress();
    return ccc.Address.fromString(address, this.client);
  }

  async getAddressObjs(): Promise<ccc.Address[]> {
    return [await this.getAddressObj()];
  }

  async getAccount() {
    const accounts = await this.provider.getAccount();
    this.accountCache = accounts[0];
    return this.accountCache;
  }

  async getPublicKey(): Promise<ccc.Hex> {
    const pubKeys = await this.provider.getPublicKey();
    const account = await this.getAccount();
    const pubKey = pubKeys.find((p) => p.address === account);

    if (!pubKey) {
      throw new Error("pubKey not found");
    }

    return ccc.hexFrom(pubKey.publicKey);
  }

  async connect(): Promise<void> {
    await this.provider.connect();
  }

  async isConnected(): Promise<boolean> {
    return await this.provider.isConnected();
  }

  async signMessageRaw(message: string | ccc.BytesLike): Promise<string> {
    const challenge =
      typeof message === "string" ? message : ccc.hexFrom(message).slice(2);

    return this.provider.signMessage(
      challenge,
      this.accountCache ?? (await this.getAccount()),
    );
  }

  async signOnlyTransaction(
    txLike: ccc.TransactionLike,
  ): Promise<ccc.Transaction> {
    const txSigned = await this.provider.signTransaction(txLike);
    return ccc.Transaction.from(txSigned);
  }

  async prepareTransaction(
    txLike: ccc.TransactionLike,
  ): Promise<ccc.Transaction> {
    const tx = ccc.Transaction.from(txLike);
    const { script } = await this.getAddressObj();

    await tx.addCellDepsOfKnownScripts(
      this.client,
      ccc.KnownScript.Secp256k1Blake160,
    );
    await tx.prepareSighashAllWitness(script, 65, this.client);
    return tx;
  }
}

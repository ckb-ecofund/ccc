import { ccc } from "@ckb-ccc/core";
import { Provider } from "../advancedBarrel";

export class SignerCkb extends ccc.Signer {
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
    return await this.getPublicKey();
  }

  async getAddressObj(): Promise<ccc.Address | undefined> {
    const address = await this.getInternalAddress();
    return await ccc.Address.fromString(address, this.client);
  }

  async getAddressObjs(): Promise<ccc.Address[]> {
    const address = await this.getAddressObj();

    if (!!address) {
      return [address];
    }

    throw new Error("address not found");
  }

  async getAccount() {
    const accounts = await this.provider.getAccount();
    return accounts[0];
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
    const account = await this.getAccount();
    return this.provider.signMessage(challenge, account);
  }

  async signOnlyTransaction(
    txLike: ccc.TransactionLike,
  ): Promise<ccc.Transaction> {
    const txSigned = await this.provider.signTransaction(txLike);
    return ccc.Transaction.from(JSON.parse(txSigned));
  }

  async prepareTransaction(
    txLike: ccc.TransactionLike,
  ): Promise<ccc.Transaction> {
    const tx = ccc.Transaction.from(txLike);
    const addessObjs = await this.getAddressObjs();
    await tx.addCellDepsOfKnownScripts(
      this.client,
      ccc.KnownScript.Secp256k1Blake160,
    );
    await tx.prepareSighashAllWitness(addessObjs[0].script, 65, this.client);
    return tx;
  }
}

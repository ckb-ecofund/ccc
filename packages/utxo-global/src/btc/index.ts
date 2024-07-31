import { ccc } from "@ckb-ccc/core";
import { Provider } from "../advancedBarrel.js";

export class SignerBtc extends ccc.SignerBtc {
  private accountCache: string | undefined;

  constructor(
    client: ccc.Client,
    public readonly provider: Provider,
  ) {
    super(client);
  }

  async getBtcAccount() {
    const accounts = await this.provider.getAccount();
    this.accountCache = accounts[0];
    return this.accountCache;
  }

  async getBtcPublicKey(): Promise<ccc.Hex> {
    const pubKeys = await this.provider.getPublicKey();
    const account = await this.getBtcAccount();
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
      this.accountCache ?? (await this.getBtcAccount()),
    );
  }
}

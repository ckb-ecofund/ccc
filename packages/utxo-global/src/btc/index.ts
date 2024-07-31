import { ccc } from "@ckb-ccc/core";
import { Provider } from "../advancedBarrel";

export class SignerBtc extends ccc.SignerBtc {
  constructor(
    client: ccc.Client,
    public readonly provider: Provider,
  ) {
    super(client);
  }

  async getBtcAccount() {
    const accounts = await this.provider.getAccount();
    return accounts[0];
  }

  async getBtcPublicKey(): Promise<ccc.Hex> {
    const pubKeys = await this.provider.getPublicKey();
    const account = await this.getBtcAccount();
    const pubKey = pubKeys.find((p) => p.address === account);

    if (pubKey) {
      return ccc.hexFrom(pubKey.publicKey);
    }

    throw new Error("pubKey not found");
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
    const account = await this.getBtcAccount();
    return this.provider.signMessage(challenge, account);
  }
}

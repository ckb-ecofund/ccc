import { ccc } from "@ckb-ccc/core";
import { Provider } from "./advancedBarrel";

export class Signer extends ccc.SignerBtc {
  constructor(
    client: ccc.Client,
    public readonly provider: Provider,
  ) {
    super(client);
  }

  async replaceClient(client: ccc.Client): Promise<Signer> {
    return new Signer(client, this.provider);
  }

  async getBtcAccount() {
    return (await this.provider.getAccounts())[0];
  }

  async getBtcPublicKey(): Promise<ccc.Hex> {
    return ccc.hexFrom(await this.provider.getPublicKey());
  }

  async connect(): Promise<void> {
    await this.provider.requestAccounts();
  }

  async isConnected(): Promise<boolean> {
    return (await this.provider.getAccounts()).length !== 0;
  }

  async signMessage(message: string | ccc.BytesLike): Promise<string> {
    const challenge =
      typeof message === "string" ? message : ccc.hexFrom(message).slice(2);

    return this.provider.signMessage(challenge, "ecdsa");
  }
}

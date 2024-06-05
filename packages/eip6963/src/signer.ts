import { ccc } from "@ckb-ccc/core";
import { ProviderDetail as EIP6963ProviderDetail } from "./eip6963.advanced";

export class Signer extends ccc.SignerEvm {
  constructor(
    client: ccc.Client,
    public readonly detail: EIP6963ProviderDetail,
  ) {
    super(client);
  }

  async replaceClient(client: ccc.Client): Promise<Signer> {
    return new Signer(client, this.detail);
  }

  async getEvmAccount() {
    return (await this.detail.provider.request({ method: "eth_accounts" }))[0];
  }

  async connect(): Promise<void> {
    await this.detail.provider.request({ method: "eth_requestAccounts" });
  }

  async isConnected(): Promise<boolean> {
    return (
      (await this.detail.provider.request({ method: "eth_accounts" }))
        .length !== 0
    );
  }

  async signMessage(message: string | ccc.BytesLike): Promise<ccc.Hex> {
    const challenge =
      typeof message === "string" ? ccc.bytesFrom(message, "utf8") : message;
    const address = await this.getEvmAccount();

    return this.detail.provider.request({
      method: "personal_sign",
      params: [ccc.hexFrom(challenge), address],
    });
  }
}

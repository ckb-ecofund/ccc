import { ccc } from "@ckb-ccc/core";
import { ProviderDetail as EIP6963ProviderDetail } from "./eip6963.advanced";

export class Signer extends ccc.SignerEVM {
  constructor(
    client: ccc.Client,
    public readonly detail: EIP6963ProviderDetail,
  ) {
    super(client);
  }

  async getEVMAccount() {
    return (await this.detail.provider.request({ method: "eth_accounts" }))[0];
  }

  async connect(): Promise<void> {
    await this.detail.provider.request({ method: "eth_requestAccounts" });
  }

  async signMessage(message: string | ccc.BytesLike): Promise<ccc.Hex> {
    const challenge =
      typeof message === "string" ? ccc.bytesFrom(message, "utf8") : message;
    const address = await this.getEVMAccount();

    return this.detail.provider.request({
      method: "personal_sign",
      params: [ccc.hexFrom(challenge), address],
    });
  }
}

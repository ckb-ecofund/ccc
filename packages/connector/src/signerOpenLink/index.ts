import { ccc } from "@ckb-ccc/ccc";

export class SignerOpenLink extends ccc.Signer {
  get signType(): ccc.SignerSignType {
    return ccc.SignerSignType.Unknown;
  }

  constructor(
    client: ccc.Client,
    private readonly link: string,
  ) {
    super(client);
  }

  async replaceClient(client: ccc.Client): Promise<SignerOpenLink> {
    return new SignerOpenLink(client, this.link);
  }

  async isConnected(): Promise<boolean> {
    return false;
  }

  async connect(): Promise<void> {
    window.open(this.link, "_blank")?.focus();
  }

  async getInternalAddress(): Promise<string> {
    throw new Error("Can't get address from SignerOpenLink");
  }

  async getAddressObjs(): Promise<ccc.Address[]> {
    throw new Error("Can't get addresses from SignerOpenLink");
  }
}

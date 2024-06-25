import { Client } from "../../client";
import { SignerType } from "../signer";
import { SignerDummy } from "./dummy";

export class SignerOpenLink extends SignerDummy {
  constructor(
    client: Client,
    type: SignerType,
    private readonly link: string,
  ) {
    super(client, type);
  }

  async replaceClient(client: Client): Promise<SignerOpenLink> {
    return new SignerOpenLink(client, this.type, this.link);
  }

  async connect(): Promise<void> {
    window.open(this.link, "_blank")?.focus();
  }
}

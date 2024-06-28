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

  async connect(): Promise<void> {
    window.open(this.link, "_blank")?.focus();
  }
}

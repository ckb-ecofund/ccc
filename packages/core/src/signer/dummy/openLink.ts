import { Client } from "../../client/index.js";
import { SignerType } from "../signer/index.js";
import { SignerDummy } from "./dummy.js";

/**
 * @public
 */
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

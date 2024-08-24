import { Client } from "../../client/index.js";
import { SignerType } from "../signer/index.js";
import { SignerDummy } from "./dummy.js";

/**
 * @public
 */
export class SignerAlwaysError extends SignerDummy {
  constructor(
    client: Client,
    type: SignerType,
    private readonly message: string,
  ) {
    super(client, type);
  }

  async connect(): Promise<void> {
    throw new Error(this.message);
  }
}

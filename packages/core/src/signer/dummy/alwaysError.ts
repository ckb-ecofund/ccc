import { Client } from "../../client";
import { SignerType } from "../signer";
import { SignerDummy } from "./dummy";

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

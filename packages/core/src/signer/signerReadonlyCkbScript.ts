import { Address } from "../address";
import { Script } from "../ckb";
import { Client } from "../client";
import { SignerReadonly } from "./signerReadonly";

export class SignerReadonlyCkbScript extends SignerReadonly {
  constructor(
    private readonly script: Script,
    client: Client,
  ) {
    super(client);
  }

  async connect(): Promise<void> {
    return;
  }

  async getInternalAddress(): Promise<string> {
    return this.getRecommendedAddress();
  }

  async getAddressObjs(): Promise<Address[]> {
    return [await Address.fromScript(this.script, this.client)];
  }
}

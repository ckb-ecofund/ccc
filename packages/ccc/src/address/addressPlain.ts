import { Client } from "../client";
import { Script } from "../types";
import { Address } from "./address";
import { encodeScriptToAddress } from "./converter";

export class AddressPlain extends Address {
  constructor(
    private readonly script: Script,
    private readonly client: Client,
  ) {
    super();
  }

  async getClient(): Promise<Client> {
    return this.client;
  }

  async getAddress(): Promise<string> {
    const prefix = await (await this.getClient()).getAddressPrefix();

    return encodeScriptToAddress(prefix, this.script);
  }

  async getScript(): Promise<Script> {
    return this.script;
  }
}

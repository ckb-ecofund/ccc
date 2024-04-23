import { Client } from "../client";
import { Script } from "../types";
import { BaseAddress } from "./baseAddress.advanced";

export class AddressPlain extends BaseAddress {
  constructor(
    private readonly script: Script,
    private readonly client: Client,
  ) {
    super();
  }

  async getClient(): Promise<Client> {
    return this.client;
  }

  async getScript(): Promise<Script> {
    return this.script;
  }
}

import { Client, KnownScript } from "../client";
import { HexString, Script } from "../types";
import { BaseAddress } from "./baseAddress.advanced";

export class AddressKnownScript extends BaseAddress {
  constructor(
    private readonly script: KnownScript,
    private readonly args: HexString,
    private readonly client: Client,
  ) {
    super();
  }

  getKnownScript(): KnownScript {
    return this.script;
  }

  getArgs(): HexString {
    return this.args;
  }

  async getClient(): Promise<Client> {
    return this.client;
  }

  async getScript(): Promise<Script> {
    return {
      ...(await this.client.getKnownScript(this.script)),
      args: this.args,
    };
  }
}

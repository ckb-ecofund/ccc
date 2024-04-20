import { Client, KnownScript } from "../client";
import { Script } from "../types";
import { Address } from "./address";
import { encodeScriptToAddress } from "./converter";

export class AddressKnownScript extends Address {
  constructor(
    private readonly script: KnownScript,
    private readonly args: Script["args"],
    private readonly client: Client,
  ) {
    super();
  }

  async getClient(): Promise<Client> {
    return this.client;
  }

  async getAddress(): Promise<string> {
    const prefix = await (await this.getClient()).getAddressPrefix();

    return encodeScriptToAddress(prefix, await this.getScript());
  }

  async getScript(): Promise<Script> {
    return {
      ...(await this.client.getKnownScript(this.script)),
      args: this.args,
    };
  }
}

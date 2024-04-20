import { Script } from "../types";
import { Client, KnownScript } from "./client";
import { TESTNET_SCRIPTS } from "./clientPublicTestnet.advanced";

export class ClientPublicTestnet extends Client {
  async getAddressPrefix(): Promise<string> {
    return "ckt";
  }

  async getKnownScript(script: KnownScript): Promise<Omit<Script, "args">> {
    return TESTNET_SCRIPTS[script];
  }
}

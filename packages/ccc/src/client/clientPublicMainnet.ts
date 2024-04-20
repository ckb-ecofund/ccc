import { Script } from "../types";
import { Client, KnownScript } from "./client";
import { MAINNET_SCRIPTS } from "./clientPublicMainnet.advanced";

export class ClientPublicMainnet extends Client {
  async getAddressPrefix(): Promise<string> {
    return "ckb";
  }

  async getKnownScript(script: KnownScript): Promise<Omit<Script, "args">> {
    return MAINNET_SCRIPTS[script];
  }
}

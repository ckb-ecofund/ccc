import { ScriptLike } from "../ckb";
import { KnownScript } from "./client";
import { MAINNET_SCRIPTS } from "./clientPublicMainnet.advanced";
import { ClientJsonRpc } from "./jsonRpc";

export class ClientPublicMainnet extends ClientJsonRpc {
  constructor(timeout?: number) {
    super("https://mainnet.ckbapp.dev/", timeout);
  }

  async getAddressPrefix(): Promise<string> {
    return "ckb";
  }

  async getKnownScript(script: KnownScript): Promise<Omit<ScriptLike, "args">> {
    return { ...MAINNET_SCRIPTS[script] };
  }
}

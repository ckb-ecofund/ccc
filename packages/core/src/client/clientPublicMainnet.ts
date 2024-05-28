import { Script } from "../ckb";
import { KnownScript } from "./client";
import { MAINNET_SCRIPTS } from "./clientPublicMainnet.advanced";
import { ClientJsonRpc } from "./jsonRpc";

export class ClientPublicMainnet extends ClientJsonRpc {
  constructor(url = "https://mainnet.ckbapp.dev/", timeout?: number) {
    super(url, timeout);
  }

  async getAddressPrefix(): Promise<string> {
    return "ckb";
  }

  async getKnownScript(
    script: KnownScript,
  ): Promise<Pick<Script, "codeHash" | "hashType">> {
    return { ...MAINNET_SCRIPTS[script] };
  }
}

import { Script } from "../ckb";
import { KnownScript } from "./client";
import { TESTNET_SCRIPTS } from "./clientPublicTestnet.advanced";
import { ClientJsonRpc } from "./jsonRpc";

export class ClientPublicTestnet extends ClientJsonRpc {
  constructor(url = "https://testnet.ckbapp.dev/", timeout?: number) {
    super(url, timeout);
  }

  async getAddressPrefix(): Promise<string> {
    return "ckt";
  }

  async getKnownScript(
    script: KnownScript,
  ): Promise<Pick<Script, "codeHash" | "hashType">> {
    return { ...TESTNET_SCRIPTS[script] };
  }
}

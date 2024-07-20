import { Script } from "../ckb";
import { CellDepInfo, KnownScript } from "./client";
import { TESTNET_SCRIPTS } from "./clientPublicTestnet.advanced";
import { ClientJsonRpc } from "./jsonRpc";

export class ClientPublicTestnet extends ClientJsonRpc {
  constructor(url = "https://testnet.ckb.dev/", timeout?: number) {
    super(url, timeout);
  }

  get addressPrefix(): string {
    return "ckt";
  }

  async getKnownScript(
    script: KnownScript,
  ): Promise<
    Pick<Script, "codeHash" | "hashType"> & { cellDeps: CellDepInfo[] }
  > {
    const found = TESTNET_SCRIPTS[script];
    return {
      ...found,
      cellDeps: found.cellDeps.map((c) => CellDepInfo.from(c)),
    };
  }
}

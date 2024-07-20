import { Script } from "../ckb";
import { CellDepInfo, KnownScript } from "./client";
import { MAINNET_SCRIPTS } from "./clientPublicMainnet.advanced";
import { ClientJsonRpc } from "./jsonRpc";

export class ClientPublicMainnet extends ClientJsonRpc {
  constructor(url = "https://mainnet.ckb.dev/", timeout?: number) {
    super(url, timeout);
  }

  get addressPrefix(): string {
    return "ckb";
  }

  async getKnownScript(
    script: KnownScript,
  ): Promise<
    Pick<Script, "codeHash" | "hashType"> & { cellDeps: CellDepInfo[] }
  > {
    const found = MAINNET_SCRIPTS[script];
    if (!found) {
      throw new Error(
        `No script information was found for ${script} on ${this.addressPrefix}`,
      );
    }
    return {
      ...found,
      cellDeps: found.cellDeps.map((c) => CellDepInfo.from(c)),
    };
  }
}

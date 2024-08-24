import { Script } from "../ckb/index.js";
import { CellDepInfo, KnownScript } from "./client.js";
import { TESTNET_SCRIPTS } from "./clientPublicTestnet.advanced.js";
import { ClientJsonRpc } from "./jsonRpc/index.js";

/**
 * @public
 */
export class ClientPublicTestnet extends ClientJsonRpc {
  constructor(
    url = "https://testnet.ckb.dev/",
    timeout?: number,
    private readonly scripts = TESTNET_SCRIPTS,
  ) {
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
    const found = this.scripts[script];
    return {
      ...found,
      cellDeps: found.cellDeps.map((c) => CellDepInfo.from(c)),
    };
  }
}

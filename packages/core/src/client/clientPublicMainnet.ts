import { Script } from "../ckb/index.js";
import { CellDepInfo, KnownScript } from "./client.js";
import { MAINNET_SCRIPTS } from "./clientPublicMainnet.advanced.js";
import { ClientJsonRpc } from "./jsonRpc/index.js";

/**
 * @public
 */
export class ClientPublicMainnet extends ClientJsonRpc {
  constructor(
    url?: string,
    timeout?: number,
    private readonly scripts = MAINNET_SCRIPTS,
  ) {
    super(
      url ??
        (typeof WebSocket !== "undefined"
          ? "wss://mainnet.ckb.dev/ws"
          : "https://mainnet.ckb.dev/"),
      timeout,
    );
  }

  get addressPrefix(): string {
    return "ckb";
  }

  async getKnownScript(
    script: KnownScript,
  ): Promise<
    Pick<Script, "codeHash" | "hashType"> & { cellDeps: CellDepInfo[] }
  > {
    const found = this.scripts[script];
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

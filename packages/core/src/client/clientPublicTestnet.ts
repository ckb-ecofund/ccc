import WebSocket from "isomorphic-ws";
import { ClientCache } from "./cache/index.js";
import { TESTNET_SCRIPTS } from "./clientPublicTestnet.advanced.js";
import { KnownScript, ScriptInfo } from "./clientTypes.js";
import { ClientJsonRpc } from "./jsonRpc/index.js";

/**
 * @public
 */
export class ClientPublicTestnet extends ClientJsonRpc {
  constructor(
    private readonly config?: {
      url?: string;
      timeout?: number;
      scripts?: typeof TESTNET_SCRIPTS;
      cache?: ClientCache;
    },
  ) {
    super(
      config?.url ??
        (typeof WebSocket !== "undefined"
          ? "wss://testnet.ckb.dev/ws"
          : "https://testnet.ckb.dev/"),
      config,
    );
  }

  get scripts(): typeof TESTNET_SCRIPTS {
    return this.config?.scripts ?? TESTNET_SCRIPTS;
  }

  get addressPrefix(): string {
    return "ckt";
  }

  async getKnownScript(script: KnownScript): Promise<ScriptInfo> {
    const found = this.scripts[script];
    return ScriptInfo.from(found);
  }
}

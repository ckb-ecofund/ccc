import { ccc } from "@ckb-ccc/core";
import { SporeScript, SporeScriptInfo } from "./base.js";
import { SPORE_MAINNET_SCRIPTS, SPORE_TESTNET_SCRIPTS } from "./spore_v2.js";

export function buildSporeScript(
  client: ccc.Client,
  protocol: SporeScript,
  args: ccc.HexLike,
  scriptInfo?: SporeScriptInfo,
): ccc.Script {
  const info =
    scriptInfo ??
    (client.addressPrefix === "ckb"
      ? SPORE_MAINNET_SCRIPTS
      : SPORE_TESTNET_SCRIPTS);

  return ccc.Script.from({
    args,
    ...info[protocol],
  });
}

export function buildSporeCellDep(
  client: ccc.Client,
  protocol: SporeScript,
  scriptInfo?: SporeScriptInfo,
): ccc.CellDepInfo[] {
  const info =
    scriptInfo ??
    (client.addressPrefix === "ckb"
      ? SPORE_MAINNET_SCRIPTS
      : SPORE_TESTNET_SCRIPTS);

  return info[protocol].cellDeps.map(ccc.CellDepInfo.from);
}

export * from "./base.js";

import { ccc } from "@ckb-ccc/core";
import { SPORE_MAINNET_SCRIPTS, SPORE_TESTNET_SCRIPTS } from "./spore_v2.js";

export type SporeScript = "spore" | "cluster";
export type SporeScriptInfo = Record<
  SporeScript,
  Pick<ccc.Script, "codeHash" | "hashType"> & {
    cellDeps: ccc.CellDepInfoLike[];
    dynamicCelldep?: ccc.ScriptLike;
  }
>;

export function buildProtoclScript(
  client: ccc.Client,
  procotol: SporeScript,
  args: ccc.HexLike,
  scriptInfo?: SporeScriptInfo,
): ccc.Script {
  if (scriptInfo) {
    return ccc.Script.from({
      args,
      ...scriptInfo[procotol],
    });
  }
  if (client.addressPrefix == "ckb") {
    return ccc.Script.from({
      args,
      ...SPORE_MAINNET_SCRIPTS[procotol],
    });
  }
  return ccc.Script.from({
    args,
    ...SPORE_TESTNET_SCRIPTS[procotol],
  });
}

export async function buildProcotolCelldep(
  client: ccc.Client,
  procotol: SporeScript,
  scriptInfo?: SporeScriptInfo,
): Promise<ccc.CellDepInfoLike[]> {
  if (scriptInfo) {
    const config = scriptInfo[procotol];
    // automatically update cellDep if hashType is the type
    if (config.hashType == "type") {
      if (!config.dynamicCelldep) {
        throw new Error(`missing dynamicCelldep for ${procotol}`);
      }
      const scriptCell = await client.findSingletonCellByType(
        config.dynamicCelldep,
        false,
      );
      if (!scriptCell) {
        throw new Error(
          `missing scriptCell under dynamicCelldep for ${procotol}`,
        );
      }
      return [
        {
          cellDep: {
            outPoint: scriptCell.outPoint,
            depType: "code",
          },
        },
      ];
    }
    return scriptInfo[procotol].cellDeps;
  }
  if (client.addressPrefix == "ckb") {
    return SPORE_MAINNET_SCRIPTS[procotol].cellDeps;
  }
  return SPORE_TESTNET_SCRIPTS[procotol].cellDeps;
}

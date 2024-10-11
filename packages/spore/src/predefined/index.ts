import { ccc } from "@ckb-ccc/core";
import { ScriptInfo, SporeScript, SporeScriptInfo } from "./base.js";
import * as did from "./did.js";
import * as spore_v1 from "./spore_v1.js";
import * as spore_v2 from "./spore_v2.js";
export * from "./base.js";

const SPORE_MAINNET_SCRIPTS_COLLECTION = [
  spore_v2.SPORE_MAINNET_SCRIPTS,
  did.DID_MAINNET_SCRIPTS,
];

const SPORE_TESTNET_SCRIPTS_COLLECTION = [
  spore_v1.SPORE_TESTNET_SCRIPTS,
  spore_v2.SPORE_TESTNET_SCRIPTS,
  did.DID_TESTNET_SCRIPTS,
];

function getScriptInfoByCodeHash(
  codeHash: ccc.HexLike,
): ScriptInfo | undefined {
  for (const scriptInfo of SPORE_MAINNET_SCRIPTS_COLLECTION) {
    for (const info of Object.values(scriptInfo)) {
      if (info.codeHash === codeHash) {
        return info;
      }
    }
  }
  for (const scriptInfo of SPORE_TESTNET_SCRIPTS_COLLECTION) {
    for (const info of Object.values(scriptInfo)) {
      if (info.codeHash === codeHash) {
        return info;
      }
    }
  }
}

export async function findExistedSporeCellAndCelldep(
  client: ccc.Client,
  protocol: SporeScript,
  args: ccc.HexLike,
  scriptInfo?: SporeScriptInfo,
): Promise<{
  cell: ccc.Cell;
  celldep: ccc.CellDepInfo[];
}> {
  if (scriptInfo) {
    const script = buildSporeScript(client, protocol, args, scriptInfo);
    const cell = await client.findSingletonCellByType(script);
    if (cell) {
      return {
        cell,
        celldep: await buildSporeCellDep(client, protocol, scriptInfo),
      };
    }
    throw new Error(
      `${protocol} cell not found of args ${args} from specified scriptInfo`,
    );
  }
  for (const scriptInfo of client.addressPrefix === "ckb"
    ? SPORE_MAINNET_SCRIPTS_COLLECTION
    : SPORE_TESTNET_SCRIPTS_COLLECTION) {
    const info = scriptInfo[protocol];
    const script = ccc.Script.from({
      args,
      ...info,
    });
    const cell = await client.findSingletonCellByType(script);
    if (cell) {
      return {
        cell,
        celldep: await buildSporeCellDep(client, protocol, scriptInfo),
      };
    }
  }
  throw new Error(`${protocol} cell not found of args: ${args}`);
}

export function buildSporeScript(
  client: ccc.Client,
  protocol: SporeScript,
  args: ccc.HexLike,
  scriptInfo?: SporeScriptInfo,
): ccc.Script {
  const collection =
    scriptInfo ??
    (client.addressPrefix === "ckb"
      ? spore_v2.SPORE_MAINNET_SCRIPTS
      : spore_v2.SPORE_TESTNET_SCRIPTS);

  return ccc.Script.from({
    args,
    ...collection[protocol],
  });
}

export async function buildSporeCellDep(
  client: ccc.Client,
  protocol: SporeScript,
  scriptInfo?: SporeScriptInfo,
): Promise<ccc.CellDepInfo[]> {
  const info =
    scriptInfo ??
    (client.addressPrefix === "ckb"
      ? spore_v2.SPORE_MAINNET_SCRIPTS
      : spore_v2.SPORE_TESTNET_SCRIPTS);

  const config = info[protocol];
  if (config.dynamicCelldep) {
    const cell = await client.findSingletonCellByType(config.dynamicCelldep);
    if (!cell) {
      throw new Error(`Dynamic celldep not found of protocol: ${protocol}`);
    }
    return [
      ccc.CellDepInfo.from({
        cellDep: {
          outPoint: cell!.outPoint,
          depType: "code",
        },
      }),
    ];
  }

  return config.cellDeps.map(ccc.CellDepInfo.from);
}

export function cobuildRequired(tx: ccc.Transaction): boolean {
  const checkCodeHash = (codeHash: ccc.HexLike | undefined) => {
    if (!codeHash) {
      return false;
    }
    const scriptInfo = getScriptInfoByCodeHash(codeHash);
    if (!scriptInfo) {
      return false;
    }
    return scriptInfo.cobuild === true;
  };
  const input = tx.inputs.find((input) => {
    return checkCodeHash(input.cellOutput?.type?.codeHash);
  });
  const output = tx.outputs.find((output) => {
    return checkCodeHash(output.type?.codeHash);
  });
  return !input || !output;
}

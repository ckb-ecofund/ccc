import { ccc } from "@ckb-ccc/core";
import {
  ScriptInfo,
  SPORE_DEFAULT_VERSION,
  SporeScript,
  SporeVersion,
} from "./base.js";
import { SPORE_MAINNET_SCRIPTS } from "./mainnet.js";
import { SPORE_TESTNET_SCRIPTS } from "./testnet.js";
export * from "./base.js";

function getScriptInfoByCodeHash(
  codeHash: ccc.HexLike,
): ScriptInfo | undefined {
  for (const collection of Object.values(SPORE_MAINNET_SCRIPTS)) {
    for (const scriptInfo of Object.values(collection)) {
      if (scriptInfo && scriptInfo.codeHash === codeHash) {
        return scriptInfo;
      }
    }
  }
  for (const collection of Object.values(SPORE_TESTNET_SCRIPTS)) {
    for (const scriptInfo of Object.values(collection)) {
      if (scriptInfo && scriptInfo.codeHash === codeHash) {
        return scriptInfo;
      }
    }
  }
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
  const inputIndex = tx.inputs.findIndex((input) => {
    return checkCodeHash(input.cellOutput?.type?.codeHash);
  });
  const outputIndex = tx.outputs.findIndex((output) => {
    return checkCodeHash(output.type?.codeHash);
  });
  return inputIndex > -1 || outputIndex > -1;
}

export async function findExistedSporeCellAndCelldep(
  client: ccc.Client,
  protocol: SporeScript,
  args: ccc.HexLike,
): Promise<{
  cell: ccc.Cell;
  celldep: ccc.CellDepInfo[];
}> {
  for (const collection of client.addressPrefix === "ckb"
    ? Object.values(SPORE_MAINNET_SCRIPTS)
    : Object.values(SPORE_TESTNET_SCRIPTS)) {
    for (const version of Object.keys(collection) as Array<SporeVersion>) {
      const scriptInfo = collection[version];
      if (!scriptInfo) {
        continue;
      }
      const script = ccc.Script.from({
        args,
        ...scriptInfo,
      });
      const cell = await client.findSingletonCellByType(script, true);
      if (cell) {
        return {
          cell,
          celldep: await buildSporeCellDep(client, protocol, version),
        };
      }
    }
  }
  throw new Error(`${protocol} cell not found of args: ${args}`);
}

export function buildSporeScript(
  client: ccc.Client,
  protocol: SporeScript,
  args: ccc.HexLike,
  version?: SporeVersion,
): ccc.Script {
  const collection =
    client.addressPrefix === "ckb"
      ? SPORE_MAINNET_SCRIPTS
      : SPORE_TESTNET_SCRIPTS;

  const scriptInfo = collection[protocol][version ?? SPORE_DEFAULT_VERSION];
  if (!scriptInfo) {
    throw new Error(
      `ScriptInfo not found of ${protocol} protocol with version ${version}`,
    );
  }

  return ccc.Script.from({
    args,
    ...scriptInfo,
  });
}

export async function buildSporeCellDep(
  client: ccc.Client,
  protocol: SporeScript,
  version?: SporeVersion,
): Promise<ccc.CellDepInfo[]> {
  const collection =
    client.addressPrefix === "ckb"
      ? SPORE_MAINNET_SCRIPTS
      : SPORE_TESTNET_SCRIPTS;

  const scriptInfo = collection[protocol][version ?? SPORE_DEFAULT_VERSION];
  if (!scriptInfo) {
    throw new Error(
      `ScriptInfo not found of ${protocol} protocol with version ${version}`,
    );
  }

  if (scriptInfo.dynamicCelldep) {
    const cell = await client.findSingletonCellByType(
      scriptInfo.dynamicCelldep,
    );
    if (!cell) {
      throw new Error(
        `Dynamic celldep not found of ${protocol} protocol with version ${version}`,
      );
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

  return scriptInfo.cellDeps.map(ccc.CellDepInfo.from);
}

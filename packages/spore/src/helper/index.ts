import { ccc } from "@ckb-ccc/core";
import { SporeScriptInfo, SporeScriptInfoLike } from "../predefined/index.js";

export async function findSingletonCellByArgs(
  client: ccc.Client,
  args: ccc.HexLike,
  scripts: (SporeScriptInfoLike | undefined)[],
): Promise<
  | {
      cell: ccc.Cell;
      scriptInfo: SporeScriptInfo;
    }
  | undefined
> {
  for (const scriptInfo of scripts) {
    if (!scriptInfo) {
      continue;
    }

    const cell = await client.findSingletonCellByType(
      {
        ...scriptInfo,
        args,
      },
      true,
    );

    if (cell) {
      return {
        cell,
        scriptInfo: SporeScriptInfo.from(scriptInfo),
      };
    }
  }
}

export async function searchOneCellBySigner(
  signer: ccc.Signer,
): Promise<ccc.Cell | undefined> {
  for await (const cell of signer.findCells(
    {
      scriptLenRange: [0, 1],
      outputDataLenRange: [0, 1],
    },
    true,
    undefined,
    1,
  )) {
    return cell;
  }
}

export async function injectOneCapacityCell(
  signer: ccc.Signer,
  tx: ccc.Transaction,
): Promise<void> {
  const liveCell = await searchOneCellBySigner(signer);
  if (!liveCell) {
    throw new Error("No live cell found");
  }

  tx.inputs.push(
    ccc.CellInput.from({
      previousOutput: liveCell.outPoint,
      ...liveCell,
    }),
  );
}

import { ccc } from "@ckb-ccc/core";

export async function searchOneCellByLock(
  signer: ccc.Signer,
): Promise<ccc.Cell | undefined> {
  let liveCell: ccc.Cell | undefined = undefined;
  for await (const cell of signer.findCells({
    scriptLenRange: [0, 1],
    outputDataLenRange: [0, 1],
  })) {
    liveCell = cell;
    break;
  }
  return liveCell;
}

export async function injectOneCapacityCell(
  signer: ccc.Signer,
  tx: ccc.Transaction,
) {
  const liveCell = await searchOneCellByLock(signer);
  if (!liveCell) {
    const address = await signer.getRecommendedAddress();
    throw new Error("No live cell found in address: " + address);
  }
  let txSkeleton = ccc.Transaction.from(tx);
  txSkeleton.inputs.push(
    ccc.CellInput.from({
      previousOutput: liveCell.outPoint,
      ...liveCell,
    }),
  );
}

export function computeTypeId(
  tx: ccc.TransactionLike,
  outputIndex: number,
): ccc.Hex {
  const firstInput = tx.inputs ? tx.inputs[0] : void 0;
  if (!firstInput) {
    throw new Error("No input found in transaction");
  }
  return ccc.hashTypeId(firstInput, outputIndex);
}

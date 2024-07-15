import { bytesFrom } from "../bytes";
import { Cell, CellLike, Script, ScriptLike } from "../ckb";
import { HexLike, hexFrom } from "../hex";
import { NumLike, numFrom } from "../num";
import { ClientIndexerSearchKey } from "./clientTypes";
import {
  ClientCollectableSearchKeyLike,
  clientSearchKeyRangeFrom,
} from "./clientTypes.advanced";

export function filterData(
  dataLike: HexLike,
  filterLike: HexLike | undefined,
  filterMode: "exact" | "prefix" | "partial",
): boolean {
  if (!filterLike) {
    return true;
  }

  const data = hexFrom(dataLike);
  const filter = hexFrom(filterLike);
  if (
    (filterMode === "exact" && data !== filter) ||
    (filterMode === "prefix" && !data.startsWith(filter)) ||
    (filterMode === "partial" && data.search(filter) === -1)
  ) {
    return false;
  }

  return true;
}

export function filterScript(
  valueLike: ScriptLike | undefined,
  filterLike: ScriptLike | undefined,
  filterMode: "prefix" | "exact" | "partial",
): boolean {
  if (!filterLike) {
    return true;
  }
  if (!valueLike) {
    return false;
  }

  const value = Script.from(valueLike);
  const filter = Script.from(filterLike);
  if (
    value.codeHash !== filter.codeHash ||
    value.hashType !== filter.hashType
  ) {
    return false;
  }

  return filterData(value.args, filter?.args, filterMode);
}

export function filterNumByRange(
  lengthLike: NumLike,
  range: [NumLike, NumLike] | undefined,
) {
  if (!range) {
    return true;
  }
  const length = numFrom(lengthLike);
  const [lower, upper] = clientSearchKeyRangeFrom(range);

  return lower <= length && length < upper;
}

export function filterScriptByLenRange(
  valueLike?: ScriptLike,
  scriptLenRange?: [NumLike, NumLike],
): boolean {
  if (!scriptLenRange) {
    return true;
  }

  const len = (() => {
    if (!valueLike) {
      return 0;
    }
    return bytesFrom(Script.from(valueLike).args).length + 33;
  })();
  return filterNumByRange(len, scriptLenRange);
}

export function filterCell(
  searchKeyLike: ClientCollectableSearchKeyLike,
  cellLike: CellLike,
): boolean {
  const key = ClientIndexerSearchKey.from(searchKeyLike);
  const cell = Cell.from(cellLike);

  if (key.scriptType === "lock") {
    if (
      !filterScript(cell.cellOutput.lock, key.script, key.scriptSearchMode) ||
      !filterScript(cell.cellOutput.type, key.filter?.script, "prefix") ||
      !filterScriptByLenRange(cell.cellOutput.type, key.filter?.scriptLenRange)
    ) {
      return false;
    }
  }
  if (key.scriptType === "type") {
    if (
      !filterScript(cell.cellOutput.type, key.script, key.scriptSearchMode) ||
      !filterScript(cell.cellOutput.lock, key.filter?.script, "prefix") ||
      !filterScriptByLenRange(cell.cellOutput.lock, key.filter?.scriptLenRange)
    ) {
      return false;
    }
  }

  if (
    !filterData(
      cell.outputData,
      key.filter?.outputData,
      key.filter?.outputDataSearchMode ?? "prefix",
    ) ||
    !filterNumByRange(
      bytesFrom(cell.outputData).length,
      key.filter?.outputDataLenRange,
    )
  ) {
    return false;
  }

  if (
    !filterNumByRange(cell.cellOutput.capacity, key.filter?.outputCapacityRange)
  ) {
    return false;
  }

  return true;
}

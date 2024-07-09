import { Cell, Script, ScriptLike, Transaction } from "../ckb";
import { Hex, HexLike, hexFrom } from "../hex";
import { Num, NumLike, numFrom } from "../num";
import { apply } from "../utils";

export type OutputsValidator = "passthrough" | "well_known_scripts_only";

export type TransactionStatus =
  | "pending"
  | "proposed"
  | "committed"
  | "unknown"
  | "rejected";
export type ClientTransactionResponse = {
  transaction: Transaction;
  status: TransactionStatus;
  blockNumber: Num | null;
};

export type ClientIndexerSearchKeyFilterLike = {
  script?: ScriptLike;
  scriptLenRange?: [NumLike, NumLike];
  outputData?: HexLike;
  outputDataSearchMode?: "prefix" | "exact" | "partial";
  outputDataLenRange?: [NumLike, NumLike];
  outputCapacityRange?: [NumLike, NumLike];
  blockRange?: [NumLike, NumLike];
};
export class ClientIndexerSearchKeyFilter {
  constructor(
    public script: Script | undefined,
    public scriptLenRange: [Num, Num] | undefined,
    public outputData: Hex | undefined,
    public outputDataSearchMode: "prefix" | "exact" | "partial" | undefined,
    public outputDataLenRange: [Num, Num] | undefined,
    public outputCapacityRange: [Num, Num] | undefined,
    public blockRange: [Num, Num] | undefined,
  ) {}

  static from(
    filterLike: ClientIndexerSearchKeyFilterLike,
  ): ClientIndexerSearchKeyFilter {
    return new ClientIndexerSearchKeyFilter(
      apply(Script.from, filterLike.script),
      apply(rangeFrom, filterLike.scriptLenRange),
      apply(hexFrom, filterLike.outputData),
      filterLike.outputDataSearchMode,
      apply(rangeFrom, filterLike.outputDataLenRange),
      apply(rangeFrom, filterLike.outputCapacityRange),
      apply(rangeFrom, filterLike.blockRange),
    );
  }
}

export type ClientIndexerSearchKeyLike = {
  script: ScriptLike;
  scriptType: "lock" | "type";
  scriptSearchMode?: "prefix" | "exact" | "partial";
  filter?: ClientIndexerSearchKeyFilterLike;
  withData?: boolean;
};

function rangeFrom([a, b]: [NumLike, NumLike]): [Num, Num] {
  return [numFrom(a), numFrom(b)];
}
export class ClientIndexerSearchKey {
  constructor(
    public script: Script,
    public scriptType: "lock" | "type",
    public scriptSearchMode: "prefix" | "exact" | "partial" | undefined,
    public filter: ClientIndexerSearchKeyFilter | undefined,
    public withData: boolean | undefined,
  ) {}

  static from(keyLike: ClientIndexerSearchKeyLike): ClientIndexerSearchKey {
    return new ClientIndexerSearchKey(
      Script.from(keyLike.script),
      keyLike.scriptType,
      keyLike.scriptSearchMode,
      apply(ClientIndexerSearchKeyFilter.from, keyLike.filter),
      keyLike.withData,
    );
  }
}

export type ClientFindCellsResponse = {
  lastCursor: string;
  cells: Cell[];
};

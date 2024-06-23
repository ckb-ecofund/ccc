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
  blockNumber: Num;
};

export type ClientIndexerSearchKeyLike = {
  script: ScriptLike;
  scriptType: "lock" | "type";
  scriptSearchMode?: "prefix" | "exact" | "partial";
  filter?: {
    script?: ScriptLike;
    scriptLenRange?: [NumLike, NumLike];
    outputData?: HexLike;
    outputDataSearchMode?: "prefix" | "exact" | "partial";
    outputDataLenRange?: [NumLike, NumLike];
    outputCapacityRange?: [NumLike, NumLike];
    blockRange?: [NumLike, NumLike];
  };
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
    public filter:
      | {
          script?: Script;
          scriptLenRange?: [Num, Num];
          outputData?: Hex;
          outputDataSearchMode?: "prefix" | "exact" | "partial";
          outputDataLenRange?: [Num, Num];
          outputCapacityRange?: [Num, Num];
          blockRange?: [Num, Num];
        }
      | undefined,
    public withData: boolean | undefined,
  ) {}

  static from(keyLike: ClientIndexerSearchKeyLike): ClientIndexerSearchKey {
    return new ClientIndexerSearchKey(
      Script.from(keyLike.script),
      keyLike.scriptType,
      keyLike.scriptSearchMode,
      apply(
        (filter: NonNullable<ClientIndexerSearchKeyLike["filter"]>) => ({
          script: apply(Script.from, filter.script),
          scriptLenRange: apply(rangeFrom, filter.scriptLenRange),
          outputData: apply(hexFrom, filter.outputData),
          outputDataSearchMode: filter.outputDataSearchMode,
          outputDataLenRange: apply(rangeFrom, filter.outputDataLenRange),
          outputCapacityRange: apply(rangeFrom, filter.outputCapacityRange),
          blockRange: apply(rangeFrom, filter.blockRange),
        }),
        keyLike.filter,
      ),
      keyLike.withData,
    );
  }
}

export type ClientFindCellsResponse = {
  lastCursor: string;
  cells: Cell[];
};

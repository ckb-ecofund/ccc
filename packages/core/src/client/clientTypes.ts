import { Cell, Script, Transaction } from "../ckb";
import { Hex, hexFrom } from "../hex";
import { Num, NumLike } from "../num";
import { apply } from "../utils";
import {
  ClientCollectableSearchKeyFilterLike,
  ClientCollectableSearchKeyLike,
  clientSearchKeyRangeFrom,
} from "./clientTypes.advanced";

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
};

export type ClientIndexerSearchKeyFilterLike =
  ClientCollectableSearchKeyFilterLike & {
    blockRange?: [NumLike, NumLike] | null;
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
      apply(clientSearchKeyRangeFrom, filterLike.scriptLenRange),
      apply(hexFrom, filterLike.outputData),
      filterLike.outputDataSearchMode ?? undefined,
      apply(clientSearchKeyRangeFrom, filterLike.outputDataLenRange),
      apply(clientSearchKeyRangeFrom, filterLike.outputCapacityRange),
      apply(clientSearchKeyRangeFrom, filterLike.blockRange),
    );
  }
}

export type ClientIndexerSearchKeyLike = ClientCollectableSearchKeyLike & {
  filter?: ClientIndexerSearchKeyFilterLike | null;
};

export class ClientIndexerSearchKey {
  constructor(
    public script: Script,
    public scriptType: "lock" | "type",
    public scriptSearchMode: "prefix" | "exact" | "partial",
    public filter: ClientIndexerSearchKeyFilter | undefined,
    public withData: boolean | undefined,
  ) {}

  static from(keyLike: ClientIndexerSearchKeyLike): ClientIndexerSearchKey {
    return new ClientIndexerSearchKey(
      Script.from(keyLike.script),
      keyLike.scriptType,
      keyLike.scriptSearchMode,
      apply(ClientIndexerSearchKeyFilter.from, keyLike.filter),
      keyLike.withData ?? undefined,
    );
  }
}

export type ClientFindCellsResponse = {
  lastCursor: string;
  cells: Cell[];
};

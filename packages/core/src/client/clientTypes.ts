import { Cell, Script, Transaction } from "../ckb/index.js";
import { Hex, hexFrom } from "../hex/index.js";
import { Num, NumLike } from "../num/index.js";
import { apply } from "../utils/index.js";
import {
  ClientCollectableSearchKeyFilterLike,
  ClientCollectableSearchKeyLike,
  clientSearchKeyRangeFrom,
} from "./clientTypes.advanced.js";

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

export type ClientIndexerSearchKeyTransactionLike = Omit<
  ClientCollectableSearchKeyLike,
  "withData"
> & {
  filter?: ClientIndexerSearchKeyFilterLike | null;
  groupByTransaction?: boolean | null;
};

export class ClientIndexerSearchKeyTransaction {
  constructor(
    public script: Script,
    public scriptType: "lock" | "type",
    public scriptSearchMode: "prefix" | "exact" | "partial",
    public filter: ClientIndexerSearchKeyFilter | undefined,
    public groupByTransaction: boolean | undefined,
  ) {}

  static from(
    keyLike: ClientIndexerSearchKeyTransactionLike,
  ): ClientIndexerSearchKeyTransaction {
    return new ClientIndexerSearchKeyTransaction(
      Script.from(keyLike.script),
      keyLike.scriptType,
      keyLike.scriptSearchMode,
      apply(ClientIndexerSearchKeyFilter.from, keyLike.filter),
      keyLike.groupByTransaction ?? undefined,
    );
  }
}

export type ClientFindTransactionsResponse = {
  lastCursor: string;
  transactions: {
    txHash: Hex;
    blockNumber: Num;
    txIndex: Num;
    isInput: boolean;
    cellIndex: Num;
  }[];
};

export type ClientFindTransactionsGroupedResponse = {
  lastCursor: string;
  transactions: {
    txHash: Hex;
    blockNumber: Num;
    txIndex: Num;
    cells: {
      isInput: boolean;
      cellIndex: Num;
    }[];
  }[];
};

export type ClientBlockHeader = {
  compactTarget: Num;
  dao: Hex;
  epoch: Num;
  extraHash: Hex;
  hash: Hex;
  nonce: Num;
  number: Num;
  parentHash: Hex;
  proposalsHash: Hex;
  timestamp: Num;
  transactionsRoot: Hex;
  version: Num;
};

export type ClientBlockUncle = {
  header: ClientBlockHeader;
  proposals: Hex[];
};

export type ClientBlock = {
  header: ClientBlockHeader;
  proposals: Hex[];
  transactions: Transaction[];
  uncles: ClientBlockUncle[];
};

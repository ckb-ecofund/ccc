import { List, Map as ImmutableMap, Record } from "immutable";

export type HexString = string;
export type Hexadecimal = string;
export type Hash = HexString;
export type HexNumber = Hexadecimal;
export type PackedSince = string;
export type PackedDao = string;

export type Address = string;

export type HexadecimalRange = [Hexadecimal, Hexadecimal];

export type HashType = "type" | "data" | "data1" | "data2";
export interface Script {
  codeHash: Hash;
  hashType: HashType;
  args: HexString;
}

export interface OutPoint {
  txHash: Hash;
  index: HexNumber;
}

export type DepType = "depGroup" | "code";
export interface CellDep {
  outPoint: OutPoint;
  depType: DepType;
}

export interface Cell {
  cellOutput: {
    capacity: HexNumber;
    lock: Script;
    type?: Script;
  };
  data: HexString;
  outPoint?: OutPoint;
  blockHash?: Hash;
  blockNumber?: HexNumber;
  txIndex?: HexNumber;
}

export type SearchMode = "exact" | "prefix";

export type DataWithSearchMode = {
  searchMode: SearchMode;
  data: HexString;
};

export interface ScriptWrapper {
  script: Script;
  searchMode?: SearchMode;
  ioType?: "input" | "output" | "both";
  argsLen?: number | "any";
}

export interface QueryOptions {
  lock?: Script | ScriptWrapper;
  type?: Script | ScriptWrapper | "empty";
  // data = any means any data content is ok
  data?: string | "any" | DataWithSearchMode;

  /** `lock` script args length */
  argsLen?: number | "any";
  /** `fromBlock` itself is included in range query. */
  fromBlock?: Hexadecimal;
  /** `toBlock` itself is included in range query. */
  toBlock?: Hexadecimal;
  skip?: number;
  order?: "asc" | "desc";
}

export interface CellCollectorResults {
  [Symbol.asyncIterator](): AsyncIterator<Cell>;
}

export interface CellCollector {
  collect(): CellCollectorResults;
}

export interface CellProvider {
  uri?: string;
  collector(queryOptions: QueryOptions): CellCollector;
}

export interface TransactionSkeletonInterface {
  cellProvider: CellProvider | null;
  cellDeps: List<CellDep>;
  headerDeps: List<Hash>;
  inputs: List<Cell>;
  outputs: List<Cell>;
  witnesses: List<HexString>;
  fixedEntries: List<{ field: string; index: number }>;
  signingEntries: List<{ type: string; index: number; message: string }>;
  inputSinces: ImmutableMap<number, PackedSince>;
}

export type TransactionSkeletonType = Record<TransactionSkeletonInterface> &
  Readonly<TransactionSkeletonInterface>;

import { OutPoint, ScriptLike } from "../ckb";
import { Hex } from "../hex";

export type ScriptType = "type" | "lock";
export type Order = "asc" | "desc";
export type ScriptSearchMode = "prefix" | "exact";
export type IOType = "input" | "output" | "both";
export type Bytes32 = string;
export type Hexadecimal = string;

export interface JsonRpcRequest {
  id: number;
  jsonrpc: string;
  method: string;
  params?: any;
}

export interface JsonRpcResponse<T> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface Tip {
  blockNumber: string;
  blockHash: string;
}

export type HexadecimalRange = [Hexadecimal, Hexadecimal];

export interface IndexerCell {
  blockNumber: Hexadecimal;
  outPoint: OutPoint;
  output: {
    capacity: Hex;
    lock: ScriptLike;
    type?: ScriptLike;
  };
  outputData: Hex;
  txIndex: Hexadecimal;
}

export type GroupedIndexerTransaction = {
  txHash: Bytes32;
  blockNumber: Hex;
  txIndex: Hex;
  cells: Array<[IOType, Hex]>;
};

export type UngroupedIndexerTransaction = {
  blockNumber: Hex;
  ioIndex: Hex;
  ioType: IOType;
  txHash: Bytes32;
  txIndex: Hex;
};

export type IndexerTransaction<Goruped extends boolean = false> =
  Goruped extends true
    ? GroupedIndexerTransaction
    : UngroupedIndexerTransaction;

export interface IndexerCellWithoutData
  extends Omit<IndexerCell, "outputData"> {
  outputData: null;
}

export interface SearchFilter {
  script?: ScriptLike;
  scriptLenRange?: HexadecimalRange;
  outputDataLenRange?: HexadecimalRange; //empty
  outputCapacityRange?: HexadecimalRange; //empty
  blockRange?: HexadecimalRange; //fromBlock-toBlock
}

export interface GetCellsSearchKey<WithData extends boolean = boolean>
  extends SearchKey {
  withData?: WithData;
}

export interface GetLiveCellsResult<WithData extends boolean = true> {
  lastCursor: string;
  objects: WithData extends true ? IndexerCell[] : IndexerCellWithoutData[];
}

export interface GetTransactionsSearchKey<Group extends boolean = boolean>
  extends SearchKey {
  groupByTransaction?: Group;
}

export interface IndexerTransactionList<Grouped extends boolean = false> {
  lastCursor: string | undefined;
  objects: IndexerTransaction<Grouped>[];
}

export interface SearchKey {
  script: ScriptLike;
  scriptType: ScriptType;
  scriptSearchMode?: ScriptSearchMode;
  filter?: SearchFilter;
}

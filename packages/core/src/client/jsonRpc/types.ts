import { Hex } from "../../hex/index.js";

export type JsonRpcHashType = "type" | "data" | "data1" | "data2";
export type JsonRpcDepType = "dep_group" | "code";

export type JsonRpcScript = {
  code_hash: Hex;
  hash_type: JsonRpcHashType;
  args: Hex;
};

export type JsonRpcOutPoint = {
  index: Hex;
  tx_hash: Hex;
};

export type JsonRpcCellInput = {
  previous_output: JsonRpcOutPoint;
  since: Hex;
};

export type JsonRpcCellOutput = {
  capacity: Hex;
  lock: JsonRpcScript;
  type?: JsonRpcScript;
};

export type JsonRpcCellDep = {
  out_point: JsonRpcOutPoint;
  dep_type: JsonRpcDepType;
};

export type JsonRpcTransaction = {
  version: Hex;
  cell_deps: JsonRpcCellDep[];
  header_deps: Hex[];
  inputs: JsonRpcCellInput[];
  outputs: JsonRpcCellOutput[];
  outputs_data: Hex[];
  witnesses: Hex[];
};

export type JsonRpcBlockHeader = {
  compact_target: Hex;
  dao: Hex;
  epoch: Hex;
  extra_hash: Hex;
  hash: Hex;
  nonce: Hex;
  number: Hex;
  parent_hash: Hex;
  proposals_hash: Hex;
  timestamp: Hex;
  transactions_root: Hex;
  version: Hex;
};

export type JsonRpcBlockUncle = {
  header: JsonRpcBlockHeader;
  proposals: Hex[];
};

export type JsonRpcBlock = {
  header: JsonRpcBlockHeader;
  proposals: Hex[];
  transactions: JsonRpcTransaction[];
  uncles: JsonRpcBlockUncle[];
};

export type JsonRpcIndexerSearchKeyFilter = {
  script?: JsonRpcScript;
  script_len_range?: [Hex, Hex];
  output_data?: Hex;
  output_data_filter_mode?: "prefix" | "exact" | "partial";
  output_data_len_range?: [Hex, Hex];
  output_capacity_range?: [Hex, Hex];
  block_range?: [Hex, Hex];
};

export type JsonRpcIndexerSearchKey = {
  script: JsonRpcScript;
  script_type: "lock" | "type";
  script_search_mode?: "prefix" | "exact" | "partial";
  filter?: JsonRpcIndexerSearchKeyFilter;
  with_data?: boolean;
};

export type JsonRpcIndexerSearchKeyTransaction = {
  script: JsonRpcScript;
  script_type: "lock" | "type";
  script_search_mode?: "prefix" | "exact" | "partial";
  filter?: JsonRpcIndexerSearchKeyFilter;
  group_by_transaction?: boolean;
};

export type JsonRpcIndexerFindTransactionsResponse = {
  last_cursor: string;
  objects: {
    tx_hash: Hex;
    block_number: Hex;
    tx_index: Hex;
    io_type: "input" | "output";
    io_index: Hex;
  }[];
};

export type JsonRpcIndexerFindTransactionsGroupedResponse = {
  last_cursor: string;
  objects: {
    tx_hash: Hex;
    block_number: Hex;
    tx_index: Hex;
    cells: ["input" | "output", Hex][];
  }[];
};

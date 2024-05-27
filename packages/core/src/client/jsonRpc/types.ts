import { Hex } from "../../hex";

export type JsonRpcPayload = {
  id: number;
  jsonrpc: "2.0";
  method: string;
  params: unknown[] | Record<string, unknown>;
};

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

import {
  CellDep,
  CellInput,
  CellOutput,
  DepType,
  OutPoint,
  Script,
  Transaction,
} from "../../ckb";
import { toHex } from "../../bytes";
import type { Client } from "../client";

export type JsonRpcPayload = {
  id: number;
  jsonrpc: "2.0";
  method: string;
  params: unknown[] | Record<string, unknown>;
};

export type JsonRpcMethod = {
  method: keyof Client;
  rpcMethod: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inTransformers: (((_: any) => unknown) | undefined)[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  outTransformer?: (_: any) => unknown;
};

export class JsonRpcTransformers {
  static toDepType(depType: DepType) {
    switch (depType) {
      case "code":
        return "code";
      case "depGroup":
        return "dep_group";
    }
  }
  static toScript(script?: Script) {
    if (!script) {
      return null;
    }
    return {
      code_hash: script.codeHash,
      hash_type: script.hashType,
      args: script.args,
    };
  }
  static toOutPoint(outPoint: OutPoint) {
    return {
      index: toHex(outPoint.index),
      tx_hash: outPoint.txHash,
    };
  }
  static toCellInput(cellInput: CellInput) {
    return {
      previous_output: JsonRpcTransformers.toOutPoint(cellInput.previousOutput),
      since: toHex(cellInput.since),
    };
  }
  static toCellOutput(cellOutput: CellOutput) {
    return {
      capacity: toHex(cellOutput.capacity),
      lock: JsonRpcTransformers.toScript(cellOutput.lock),
      type: JsonRpcTransformers.toScript(cellOutput.type),
    };
  }
  static toCellDep(cellDep: CellDep) {
    return {
      out_point: JsonRpcTransformers.toOutPoint(cellDep.outPoint),
      dep_type: JsonRpcTransformers.toDepType(cellDep.depType),
    };
  }
  static toTransaction(tx: Transaction) {
    return {
      version: toHex(tx.version),
      cell_deps: tx.cellDeps.map((c) => JsonRpcTransformers.toCellDep(c)),
      header_deps: tx.headerDeps,
      inputs: tx.inputs.map((i) => JsonRpcTransformers.toCellInput(i)),
      outputs: tx.outputs.map((o) => JsonRpcTransformers.toCellOutput(o)),
      outputs_data: tx.outputsData,
      witnesses: tx.witnesses,
    };
  }
}

export const CkbRpcMethods: JsonRpcMethod[] = [
  {
    method: "sendTransaction",
    rpcMethod: "send_transaction",
    inTransformers: [JsonRpcTransformers.toTransaction],
    outTransformer: toHex,
  },
];

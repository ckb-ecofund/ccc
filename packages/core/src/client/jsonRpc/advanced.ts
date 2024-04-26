import {
  CellDepLike,
  CellInputLike,
  CellOutputLike,
  DepTypeLike,
  OutPointLike,
  ScriptLike,
  TransactionLike,
  depTypeFrom,
} from "../../ckb";
import { hexFrom } from "../../hex";
import { numToHex } from "../../num";
import { apply } from "../../utils";
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
  static toDepType(depType: DepTypeLike) {
    switch (depTypeFrom(depType)) {
      case "code":
        return "code";
      case "depGroup":
        return "dep_group";
    }
  }
  static toScript(script: ScriptLike) {
    return {
      code_hash: script.codeHash,
      hash_type: script.hashType,
      args: script.args,
    };
  }
  static toOutPoint(outPoint: OutPointLike) {
    return {
      index: numToHex(outPoint.index),
      tx_hash: outPoint.txHash,
    };
  }
  static toCellInput(cellInput: CellInputLike) {
    return {
      previous_output: JsonRpcTransformers.toOutPoint(cellInput.previousOutput),
      since: numToHex(cellInput.since),
    };
  }
  static toCellOutput(cellOutput: CellOutputLike) {
    return {
      capacity: numToHex(cellOutput.capacity),
      lock: JsonRpcTransformers.toScript(cellOutput.lock),
      type: apply(JsonRpcTransformers.toScript, cellOutput.type),
    };
  }
  static toCellDep(cellDep: CellDepLike) {
    return {
      out_point: JsonRpcTransformers.toOutPoint(cellDep.outPoint),
      dep_type: JsonRpcTransformers.toDepType(cellDep.depType),
    };
  }
  static toTransaction(tx: TransactionLike) {
    return {
      version: numToHex(tx.version),
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
    outTransformer: hexFrom,
  },
];

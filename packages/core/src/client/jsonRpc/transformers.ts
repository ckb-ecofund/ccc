import {
  CellDep,
  CellDepLike,
  CellInput,
  CellInputLike,
  CellOutput,
  CellOutputLike,
  DepType,
  DepTypeLike,
  HashType,
  HashTypeLike,
  OutPoint,
  OutPointLike,
  Script,
  ScriptLike,
  Transaction,
  TransactionLike,
  depTypeFrom,
  hashTypeFrom,
} from "../../ckb";
import { numToHex } from "../../num";
import { apply } from "../../utils";
import { ClientTransactionResponse, TransactionStatus } from "../clientTypes";
import {
  JsonRpcCellDep,
  JsonRpcCellInput,
  JsonRpcCellOutput,
  JsonRpcDepType,
  JsonRpcHashType,
  JsonRpcOutPoint,
  JsonRpcScript,
  JsonRpcTransaction,
} from "./types";

export class JsonRpcTransformers {
  static toHashType(hashType: HashTypeLike): JsonRpcHashType {
    return hashTypeFrom(hashType);
  }
  static fromHashType(hashType: JsonRpcHashType): HashType {
    return hashType;
  }
  static toDepType(depType: DepTypeLike): JsonRpcDepType {
    switch (depTypeFrom(depType)) {
      case "code":
        return "code";
      case "depGroup":
        return "dep_group";
    }
  }
  static fromDepType(depType: JsonRpcDepType): DepType {
    switch (depType) {
      case "code":
        return "code";
      case "dep_group":
        return "depGroup";
    }
  }
  static toScript(scriptLike: ScriptLike): JsonRpcScript {
    const script = Script.from(scriptLike);
    return {
      code_hash: script.codeHash,
      hash_type: JsonRpcTransformers.toHashType(script.hashType),
      args: script.args,
    };
  }
  static fromScript(script: JsonRpcScript): Script {
    return Script.from({
      codeHash: script.code_hash,
      hashType: JsonRpcTransformers.fromHashType(script.hash_type),
      args: script.args,
    });
  }
  static toOutPoint(outPointLike: OutPointLike): JsonRpcOutPoint {
    const outPoint = OutPoint.from(outPointLike);
    return {
      index: numToHex(outPoint.index),
      tx_hash: outPoint.txHash,
    };
  }
  static fromOutPoint(outPoint: JsonRpcOutPoint): OutPoint {
    return OutPoint.from({
      index: outPoint.index,
      txHash: outPoint.tx_hash,
    });
  }
  static toCellInput(cellInput: CellInputLike): JsonRpcCellInput {
    return {
      previous_output: JsonRpcTransformers.toOutPoint(cellInput.previousOutput),
      since: numToHex(cellInput.since),
    };
  }
  static fromCellInput(cellInput: JsonRpcCellInput): CellInput {
    return CellInput.from({
      previousOutput: this.fromOutPoint(cellInput.previous_output),
      since: cellInput.since,
    });
  }
  static toCellOutput(cellOutput: CellOutputLike): JsonRpcCellOutput {
    return {
      capacity: numToHex(cellOutput.capacity),
      lock: JsonRpcTransformers.toScript(cellOutput.lock),
      type: apply(JsonRpcTransformers.toScript, cellOutput.type),
    };
  }
  static fromCellOutput(cellOutput: JsonRpcCellOutput): CellOutput {
    return CellOutput.from({
      capacity: cellOutput.capacity,
      lock: JsonRpcTransformers.fromScript(cellOutput.lock),
      type: apply(JsonRpcTransformers.fromScript, cellOutput.type),
    });
  }
  static toCellDep(cellDep: CellDepLike): JsonRpcCellDep {
    return {
      out_point: JsonRpcTransformers.toOutPoint(cellDep.outPoint),
      dep_type: JsonRpcTransformers.toDepType(cellDep.depType),
    };
  }
  static fromCellDep(cellDep: JsonRpcCellDep): CellDep {
    return CellDep.from({
      outPoint: JsonRpcTransformers.fromOutPoint(cellDep.out_point),
      depType: JsonRpcTransformers.fromDepType(cellDep.dep_type),
    });
  }
  static toTransaction(txLike: TransactionLike): JsonRpcTransaction {
    const tx = Transaction.from(txLike);
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
  static fromTransaction(tx: JsonRpcTransaction): Transaction {
    return Transaction.from({
      version: tx.version,
      cellDeps: tx.cell_deps.map((c) => JsonRpcTransformers.fromCellDep(c)),
      headerDeps: tx.header_deps,
      inputs: tx.inputs.map((i) => JsonRpcTransformers.fromCellInput(i)),
      outputs: tx.outputs.map((o) => JsonRpcTransformers.fromCellOutput(o)),
      outputsData: tx.outputs_data,
      witnesses: tx.witnesses,
    });
  }
  static fromTransactionResponse({
    tx_status: { status },
    transaction,
  }: {
    tx_status: { status: TransactionStatus };
    transaction: JsonRpcTransaction;
  }): ClientTransactionResponse {
    return {
      transaction: JsonRpcTransformers.fromTransaction(transaction),
      status,
    };
  }
}

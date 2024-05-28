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
  static hashTypeFrom(hashType: HashTypeLike): JsonRpcHashType {
    return hashTypeFrom(hashType);
  }
  static hashTypeTo(hashType: JsonRpcHashType): HashType {
    return hashType;
  }
  static depTypeFrom(depType: DepTypeLike): JsonRpcDepType {
    switch (depTypeFrom(depType)) {
      case "code":
        return "code";
      case "depGroup":
        return "dep_group";
    }
  }
  static depTypeTo(depType: JsonRpcDepType): DepType {
    switch (depType) {
      case "code":
        return "code";
      case "dep_group":
        return "depGroup";
    }
  }
  static scriptFrom(scriptLike: ScriptLike): JsonRpcScript {
    const script = Script.from(scriptLike);
    return {
      code_hash: script.codeHash,
      hash_type: JsonRpcTransformers.hashTypeFrom(script.hashType),
      args: script.args,
    };
  }
  static scriptTo(script: JsonRpcScript): Script {
    return Script.from({
      codeHash: script.code_hash,
      hashType: JsonRpcTransformers.hashTypeTo(script.hash_type),
      args: script.args,
    });
  }
  static outPointFrom(outPointLike: OutPointLike): JsonRpcOutPoint {
    const outPoint = OutPoint.from(outPointLike);
    return {
      index: numToHex(outPoint.index),
      tx_hash: outPoint.txHash,
    };
  }
  static outPointTo(outPoint: JsonRpcOutPoint): OutPoint {
    return OutPoint.from({
      index: outPoint.index,
      txHash: outPoint.tx_hash,
    });
  }
  static cellInputFrom(cellInput: CellInputLike): JsonRpcCellInput {
    return {
      previous_output: JsonRpcTransformers.outPointFrom(
        cellInput.previousOutput,
      ),
      since: numToHex(cellInput.since),
    };
  }
  static cellInputTo(cellInput: JsonRpcCellInput): CellInput {
    return CellInput.from({
      previousOutput: JsonRpcTransformers.outPointTo(cellInput.previous_output),
      since: cellInput.since,
    });
  }
  static cellOutputFrom(cellOutput: CellOutputLike): JsonRpcCellOutput {
    return {
      capacity: numToHex(cellOutput.capacity),
      lock: JsonRpcTransformers.scriptFrom(cellOutput.lock),
      type: apply(JsonRpcTransformers.scriptFrom, cellOutput.type),
    };
  }
  static cellOutputTo(cellOutput: JsonRpcCellOutput): CellOutput {
    return CellOutput.from({
      capacity: cellOutput.capacity,
      lock: JsonRpcTransformers.scriptTo(cellOutput.lock),
      type: apply(JsonRpcTransformers.scriptTo, cellOutput.type),
    });
  }
  static cellDepFrom(cellDep: CellDepLike): JsonRpcCellDep {
    return {
      out_point: JsonRpcTransformers.outPointFrom(cellDep.outPoint),
      dep_type: JsonRpcTransformers.depTypeFrom(cellDep.depType),
    };
  }
  static cellDepTo(cellDep: JsonRpcCellDep): CellDep {
    return CellDep.from({
      outPoint: JsonRpcTransformers.outPointTo(cellDep.out_point),
      depType: JsonRpcTransformers.depTypeTo(cellDep.dep_type),
    });
  }
  static transactionFrom(txLike: TransactionLike): JsonRpcTransaction {
    const tx = Transaction.from(txLike);
    return {
      version: numToHex(tx.version),
      cell_deps: tx.cellDeps.map((c) => JsonRpcTransformers.cellDepFrom(c)),
      header_deps: tx.headerDeps,
      inputs: tx.inputs.map((i) => JsonRpcTransformers.cellInputFrom(i)),
      outputs: tx.outputs.map((o) => JsonRpcTransformers.cellOutputFrom(o)),
      outputs_data: tx.outputsData,
      witnesses: tx.witnesses,
    };
  }
  static transactionTo(tx: JsonRpcTransaction): Transaction {
    return Transaction.from({
      version: tx.version,
      cellDeps: tx.cell_deps.map((c) => JsonRpcTransformers.cellDepTo(c)),
      headerDeps: tx.header_deps,
      inputs: tx.inputs.map((i) => JsonRpcTransformers.cellInputTo(i)),
      outputs: tx.outputs.map((o) => JsonRpcTransformers.cellOutputTo(o)),
      outputsData: tx.outputs_data,
      witnesses: tx.witnesses,
    });
  }
  static transactionResponseTo({
    tx_status: { status },
    transaction,
  }: {
    tx_status: { status: TransactionStatus };
    transaction: JsonRpcTransaction;
  }): ClientTransactionResponse {
    return {
      transaction: JsonRpcTransformers.transactionTo(transaction),
      status,
    };
  }
}

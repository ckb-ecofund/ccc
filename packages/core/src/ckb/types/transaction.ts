import { HashType, Script } from "./script";
import {
  toBytes,
  toBytesFromNumber,
  toHex,
  toHexFromHex,
  toNumber,
  toNumberFromBytes,
} from "../../bytes";
import { BytesLike, Hex, NumberLike } from "../../primitive";
import type { TransactionSkeletonType } from "@ckb-lumos/helpers";
import { DeepReadonly } from "ts-essentials";
import * as mol from "./molecule.advanced";
import { DEP_TYPE_TO_NUM, NUM_TO_DEP_TYPE } from "./transaction.advanced";
import { Hasher, ckbHash } from "../hasher";

export type DepType = "depGroup" | "code";

export function encodeDepType(depType: DepType): Uint8Array {
  return toBytes([DEP_TYPE_TO_NUM[depType]]);
}

export function decodeDepType(bytes: BytesLike): DepType {
  return NUM_TO_DEP_TYPE[toBytes(bytes)[0]];
}

export class OutPoint {
  constructor(
    public txHash: Hex,
    public index: string,
  ) {}

  static from({
    txHash,
    index,
  }: {
    txHash: BytesLike;
    index: NumberLike;
  }): OutPoint {
    return new OutPoint(toHex(txHash), toNumber(index));
  }

  static _toMolData(outPoint: DeepReadonly<OutPoint>) {
    return {
      txHash: toBytes(outPoint.txHash),
      index: toBytesFromNumber(outPoint.index, 4),
    };
  }

  static encode(outPoint: DeepReadonly<OutPoint>): Uint8Array {
    return toBytes(mol.SerializeOutPoint(OutPoint._toMolData(outPoint)));
  }

  static decode(bytes: BytesLike | mol.OutPoint): OutPoint {
    const view =
      bytes instanceof mol.OutPoint ? bytes : new mol.OutPoint(toBytes(bytes));
    return {
      txHash: toHex(view.getTxHash().raw()),
      index: toNumberFromBytes(view.getIndex().raw()),
    };
  }
}

export class CellOutput {
  constructor(
    public capacity: string,
    public lock: Script,
    public type?: Script,
  ) {}

  static from({
    capacity,
    lock,
    type,
  }: {
    capacity: NumberLike;
    lock: Parameters<typeof Script.from>[0];
    type?: Parameters<typeof Script.from>[0];
  }): CellOutput {
    return new CellOutput(
      toNumber(capacity),
      Script.from(lock),
      type ? Script.from(type) : undefined,
    );
  }

  static _toMolData(cellOutput: DeepReadonly<CellOutput>) {
    return {
      capacity: toBytesFromNumber(cellOutput.capacity, 8),
      lock: Script._toMolData(cellOutput.lock),
      type: cellOutput.type ? Script._toMolData(cellOutput.type) : undefined,
    };
  }

  static encode(cellOutput: DeepReadonly<CellOutput>): Uint8Array {
    return toBytes(mol.SerializeCellOutput(CellOutput._toMolData(cellOutput)));
  }

  static decode(bytes: BytesLike | mol.CellOutput): CellOutput {
    const view =
      bytes instanceof mol.CellOutput
        ? bytes
        : new mol.CellOutput(toBytes(bytes));
    const type = view.getType();
    return {
      capacity: toNumberFromBytes(view.getCapacity().raw()),
      lock: Script.decode(view.getLock()),
      type: type.hasValue() ? Script.decode(type.value()) : undefined,
    };
  }
}

export class CellInput {
  constructor(
    public previousOutput: OutPoint,
    public since: string,
    public cellOutput?: CellOutput,
    public outputData?: Hex,
  ) {}

  static from({
    previousOutput,
    since,
    cellOutput,
    outputData,
  }: {
    previousOutput: Parameters<typeof OutPoint.from>[0];
    since: NumberLike;
    cellOutput?: Parameters<typeof CellOutput.from>[0];
    outputData?: BytesLike;
  }): CellInput {
    return new CellInput(
      OutPoint.from(previousOutput),
      toNumber(since),
      cellOutput ? CellOutput.from(cellOutput) : undefined,
      outputData ? toHex(outputData) : undefined,
    );
  }

  static _toMolData(cellInput: DeepReadonly<CellInput>) {
    return {
      previousOutput: OutPoint._toMolData(cellInput.previousOutput),
      since: toBytesFromNumber(cellInput.since, 8),
    };
  }

  static encode(cellInput: DeepReadonly<CellInput>): Uint8Array {
    return toBytes(mol.SerializeCellInput(CellInput._toMolData(cellInput)));
  }

  static decode(bytes: BytesLike | mol.CellInput): CellInput {
    const view =
      bytes instanceof mol.CellInput
        ? bytes
        : new mol.CellInput(toBytes(bytes));
    return {
      previousOutput: OutPoint.decode(view.getPreviousOutput()),
      since: toNumberFromBytes(view.getSince().raw()),
    };
  }
}

export class CellDep {
  constructor(
    public outPoint: OutPoint,
    public depType: DepType,
  ) {}

  static from({
    outPoint,
    depType,
  }: {
    outPoint: Parameters<typeof OutPoint.from>[0];
    depType: DepType;
  }): CellDep {
    return new CellDep(OutPoint.from(outPoint), depType);
  }

  static _toMolData(cellDep: DeepReadonly<CellDep>) {
    return {
      outPoint: OutPoint._toMolData(cellDep.outPoint),
      depType: encodeDepType(cellDep.depType),
    };
  }

  static encode(cellDep: DeepReadonly<CellDep>): Uint8Array {
    return toBytes(mol.SerializeCellDep(CellDep._toMolData(cellDep)));
  }

  static decode(bytes: BytesLike | mol.CellDep): CellDep {
    const view =
      bytes instanceof mol.CellDep ? bytes : new mol.CellDep(toBytes(bytes));
    return {
      outPoint: OutPoint.decode(view.getOutPoint()),
      depType: decodeDepType([view.getDepType()]),
    };
  }
}

export class WitnessArgs {
  constructor(
    public lock?: Hex,
    public inputType?: Hex,
    public outputType?: Hex,
  ) {}

  static from({
    lock,
    inputType,
    outputType,
  }: {
    lock?: BytesLike;
    inputType?: BytesLike;
    outputType?: BytesLike;
  }): WitnessArgs {
    return new WitnessArgs(
      lock ? toHex(lock) : undefined,
      inputType ? toHex(inputType) : undefined,
      outputType ? toHex(outputType) : undefined,
    );
  }

  static _toMolData(witnessArgs: DeepReadonly<WitnessArgs>) {
    return {
      lock: witnessArgs.lock ? toBytes(witnessArgs.lock) : undefined,
      inputType: witnessArgs.inputType
        ? toBytes(witnessArgs.inputType)
        : undefined,
      outputType: witnessArgs.outputType
        ? toBytes(witnessArgs.outputType)
        : undefined,
    };
  }

  static encode(witnessArgs: DeepReadonly<WitnessArgs>): Uint8Array {
    return toBytes(
      mol.SerializeWitnessArgs(WitnessArgs._toMolData(witnessArgs)),
    );
  }

  static decode(bytes: BytesLike | mol.WitnessArgs): WitnessArgs {
    const view =
      bytes instanceof mol.WitnessArgs
        ? bytes
        : new mol.WitnessArgs(toBytes(bytes));
    const lock = view.getLock();
    const inputType = view.getInputType();
    const outputType = view.getOutputType();
    return {
      lock: lock.hasValue() ? toHex(lock.value().raw()) : undefined,
      inputType: inputType.hasValue()
        ? toHex(inputType.value().raw())
        : undefined,
      outputType: outputType.hasValue()
        ? toHex(outputType.value().raw())
        : undefined,
    };
  }
}

export class Transaction {
  constructor(
    public version: string,
    public cellDeps: CellDep[],
    public headerDeps: Hex[],
    public inputs: CellInput[],
    public outputs: CellOutput[],
    public outputsData: Hex[],
    public witnesses: Hex[],
  ) {}

  static default(): Transaction {
    return new Transaction("0", [], [], [], [], [], []);
  }

  private static fromLumosOutPoint(outPoint: {
    index: string;
    txHash: string;
  }) {
    return {
      ...outPoint,
      txHash: toHexFromHex(outPoint.txHash),
    };
  }

  private static fromLumosScript(script: {
    codeHash: string;
    hashType: HashType;
    args: string;
  }) {
    return {
      codeHash: toHexFromHex(script.codeHash),
      args: toHexFromHex(script.args),
      hashType: script.hashType,
    };
  }

  private static fromLumosOutput(output: {
    lock: Parameters<typeof Transaction.fromLumosScript>[0];
    type?: Parameters<typeof Transaction.fromLumosScript>[0];
    capacity: string;
  }) {
    return {
      lock: Transaction.fromLumosScript(output.lock),
      type: output.type ? Transaction.fromLumosScript(output.type) : undefined,
      capacity: toNumber(output.capacity),
    };
  }

  static fromLumosSkeleton(skeleton: TransactionSkeletonType): Transaction {
    return new Transaction(
      "0",
      skeleton.cellDeps.toArray().map((cellDep) =>
        CellDep.from({
          ...cellDep,
          outPoint: Transaction.fromLumosOutPoint(cellDep.outPoint),
        }),
      ),
      skeleton.headerDeps.toArray().map(toHex),
      skeleton.inputs.toArray().map((input, i) => {
        if (!input.outPoint) {
          throw new Error("outPoint is required in input");
        }

        return CellInput.from({
          previousOutput: Transaction.fromLumosOutPoint(input.outPoint),
          since: skeleton.inputSinces.get(i, "0x00"),
          cellOutput: Transaction.fromLumosOutput(input.cellOutput),
          outputData: toHexFromHex(input.data),
        });
      }),
      skeleton.outputs
        .toArray()
        .map((output) =>
          CellOutput.from(Transaction.fromLumosOutput(output.cellOutput)),
        ),
      skeleton.outputs.toArray().map((output) => toHex(output.data)),
      skeleton.witnesses.toArray().map(toHex),
    );
  }

  static encodeRaw(
    transaction: Readonly<Omit<Transaction, "witnesses">>,
  ): Uint8Array {
    return toBytes(
      mol.SerializeRawTransaction({
        version: toBytesFromNumber(transaction.version, 4),
        cellDeps: transaction.cellDeps.map(CellDep._toMolData),
        headerDeps: transaction.headerDeps.map(toBytes),
        inputs: transaction.inputs.map(CellInput._toMolData),
        outputs: transaction.outputs.map(CellOutput._toMolData),
        outputsData: transaction.outputsData.map(toBytes),
      }),
    );
  }

  static hashRaw(transaction: Omit<Transaction, "witnesses">) {
    return ckbHash(Transaction.encodeRaw(transaction));
  }

  static hashWitnessToHasher(witness: Hex, hasher: Hasher) {
    const raw = toBytes(witness);
    hasher.update(toBytesFromNumber(raw.length, 8))
    hasher.update(raw);
  }
}

import type { TransactionSkeletonType } from "@ckb-lumos/helpers";
import { Bytes, BytesLike, bytesFrom } from "../bytes";
import { Hasher, ckbHash } from "../hasher";
import { Hex, HexLike, hexFrom } from "../hex";
import { Num, NumLike, numFrom, numFromBytes, numToBytes } from "../num";
import { apply } from "../utils";
import * as mol from "./molecule.advanced";
import { Script, ScriptLike } from "./script";
import { DEP_TYPE_TO_NUM, NUM_TO_DEP_TYPE } from "./transaction.advanced";

export type DepTypeLike = string | number | bigint;
export type DepType = "depGroup" | "code";
export function depTypeFrom(val: DepTypeLike): DepType {
  const depType = (() => {
    if (typeof val === "number") {
      return NUM_TO_DEP_TYPE[val];
    }

    if (typeof val === "bigint") {
      return NUM_TO_DEP_TYPE[Number(val)];
    }

    return val as DepType;
  })();
  if (depType === undefined) {
    throw new Error(`Invalid dep type ${val}`);
  }
  return depType;
}
export function depTypeToBytes(depType: DepType): Bytes {
  return bytesFrom([DEP_TYPE_TO_NUM[depType]]);
}
export function depTypeFromBytes(bytes: BytesLike): DepType {
  return NUM_TO_DEP_TYPE[bytesFrom(bytes)[0]];
}

export type OutPointLike = {
  txHash: HexLike;
  index: NumLike;
};
export class OutPoint {
  constructor(
    public txHash: Hex,
    public index: Num,
  ) {}

  static from(outPoint: OutPointLike): OutPoint {
    if (outPoint instanceof OutPoint) {
      return outPoint;
    }
    return new OutPoint(hexFrom(outPoint.txHash), numFrom(outPoint.index));
  }

  _toMolData() {
    return {
      txHash: bytesFrom(this.txHash),
      index: numToBytes(this.index, 4),
    };
  }

  encode(): Bytes {
    return bytesFrom(mol.SerializeOutPoint(this._toMolData()));
  }

  static fromBytes(bytes: BytesLike | mol.OutPoint): OutPoint {
    const view =
      bytes instanceof mol.OutPoint
        ? bytes
        : new mol.OutPoint(bytesFrom(bytes));

    return new OutPoint(
      hexFrom(view.getTxHash().raw()),
      numFromBytes(view.getIndex().raw()),
    );
  }
}

export type CellOutputLike = {
  capacity: NumLike;
  lock: ScriptLike;
  type?: ScriptLike;
};
export class CellOutput {
  constructor(
    public capacity: Num,
    public lock: Script,
    public type?: Script,
  ) {}

  static from(cellOutput: CellOutputLike): CellOutput {
    if (cellOutput instanceof CellOutput) {
      return cellOutput;
    }

    return new CellOutput(
      numFrom(cellOutput.capacity),
      Script.from(cellOutput.lock),
      apply(Script.from, cellOutput.type),
    );
  }

  _toMolData() {
    return {
      capacity: numToBytes(this.capacity, 8),
      lock: this.lock._toMolData(),
      type: this.type?._toMolData(),
    };
  }

  toBytes(): Bytes {
    return bytesFrom(mol.SerializeCellOutput(this._toMolData()));
  }

  static fromBytes(bytes: BytesLike | mol.CellOutput): CellOutput {
    const view =
      bytes instanceof mol.CellOutput
        ? bytes
        : new mol.CellOutput(bytesFrom(bytes));

    return new CellOutput(
      numFromBytes(view.getCapacity().raw()),
      Script.fromBytes(view.getLock()),
      apply(Script.fromBytes, mol.molOptional(view.getType())),
    );
  }
}

export type CellInputLike = {
  previousOutput: OutPointLike;
  since: NumLike;
  cellOutput?: CellOutputLike;
  outputData?: HexLike;
};
export class CellInput {
  constructor(
    public previousOutput: OutPoint,
    public since: Num,
    public cellOutput?: CellOutput,
    public outputData?: Hex,
  ) {}

  static from(cellInput: CellInputLike): CellInput {
    if (cellInput instanceof CellInput) {
      return cellInput;
    }

    return new CellInput(
      OutPoint.from(cellInput.previousOutput),
      numFrom(cellInput.since),
      apply(CellOutput.from, cellInput.cellOutput),
      apply(hexFrom, cellInput.outputData),
    );
  }

  _toMolData() {
    return {
      previousOutput: this.previousOutput._toMolData(),
      since: numToBytes(this.since, 8),
    };
  }

  toBytes(): Bytes {
    return bytesFrom(mol.SerializeCellInput(this._toMolData()));
  }

  static fromBytes(bytes: BytesLike | mol.CellInput): CellInput {
    const view =
      bytes instanceof mol.CellInput
        ? bytes
        : new mol.CellInput(bytesFrom(bytes));

    return new CellInput(
      OutPoint.fromBytes(view.getPreviousOutput()),
      numFromBytes(view.getSince().raw()),
    );
  }
}

export type CellDepLike = {
  outPoint: OutPointLike;
  depType: DepTypeLike;
};
export class CellDep {
  constructor(
    public outPoint: OutPoint,
    public depType: DepType,
  ) {}

  static from(cellDep: CellDepLike): CellDep {
    if (cellDep instanceof CellDep) {
      return cellDep;
    }

    return new CellDep(
      OutPoint.from(cellDep.outPoint),
      depTypeFrom(cellDep.depType),
    );
  }

  _toMolData() {
    return {
      outPoint: this.outPoint._toMolData(),
      depType: depTypeToBytes(this.depType),
    };
  }

  toBytes(): Bytes {
    return bytesFrom(mol.SerializeCellDep(this._toMolData()));
  }

  fromBytes(bytes: BytesLike | mol.CellDep): CellDep {
    const view =
      bytes instanceof mol.CellDep ? bytes : new mol.CellDep(bytesFrom(bytes));

    return new CellDep(
      OutPoint.fromBytes(view.getOutPoint()),
      depTypeFromBytes([view.getDepType()]),
    );
  }
}

export type WitnessArgsLike = {
  lock?: HexLike;
  inputType?: HexLike;
  outputType?: HexLike;
};
export class WitnessArgs {
  constructor(
    public lock?: Hex,
    public inputType?: Hex,
    public outputType?: Hex,
  ) {}

  static from(witnessArgs: WitnessArgsLike): WitnessArgs {
    if (witnessArgs instanceof WitnessArgs) {
      return witnessArgs;
    }

    return new WitnessArgs(
      apply(hexFrom, witnessArgs.lock),
      apply(hexFrom, witnessArgs.inputType),
      apply(hexFrom, witnessArgs.outputType),
    );
  }

  _toMolData() {
    return {
      lock: apply(bytesFrom, this.lock),
      inputType: apply(bytesFrom, this.inputType),
      outputType: apply(bytesFrom, this.outputType),
    };
  }

  toBytes(): Bytes {
    return bytesFrom(mol.SerializeWitnessArgs(this._toMolData()));
  }

  static fromBytes(bytes: BytesLike | mol.WitnessArgs): WitnessArgs {
    const view =
      bytes instanceof mol.WitnessArgs
        ? bytes
        : new mol.WitnessArgs(bytesFrom(bytes));

    return new WitnessArgs(
      apply(hexFrom, mol.molOptional(view.getLock())?.raw()),
      apply(hexFrom, mol.molOptional(view.getInputType())?.raw()),
      apply(hexFrom, mol.molOptional(view.getOutputType())?.raw()),
    );
  }
}

export type TransactionLike = {
  version: NumLike;
  cellDeps: CellDepLike[];
  headerDeps: HexLike[];
  inputs: CellInputLike[];
  outputs: CellOutputLike[];
  outputsData: HexLike[];
  witnesses: HexLike[];
};
export class Transaction {
  constructor(
    public version: Num,
    public cellDeps: CellDep[],
    public headerDeps: Hex[],
    public inputs: CellInput[],
    public outputs: CellOutput[],
    public outputsData: Hex[],
    public witnesses: Hex[],
  ) {}

  static default(): Transaction {
    return new Transaction(0n, [], [], [], [], [], []);
  }

  static from(tx: TransactionLike): Transaction {
    if (tx instanceof Transaction) {
      return tx;
    }

    return new Transaction(
      numFrom(tx.version),
      tx.cellDeps.map((cellDep) => CellDep.from(cellDep)),
      tx.headerDeps.map(hexFrom),
      tx.inputs.map((input) => CellInput.from(input)),
      tx.outputs.map((output) => CellOutput.from(output)),
      tx.outputsData.map(hexFrom),
      tx.witnesses.map(hexFrom),
    );
  }

  static fromLumosSkeleton(skeleton: TransactionSkeletonType): Transaction {
    return Transaction.from({
      version: 0n,
      cellDeps: skeleton.cellDeps.toArray(),
      headerDeps: skeleton.headerDeps.toArray(),
      inputs: skeleton.inputs.toArray().map((input, i) => {
        if (!input.outPoint) {
          throw new Error("outPoint is required in input");
        }

        return CellInput.from({
          previousOutput: input.outPoint,
          since: skeleton.inputSinces.get(i, "0x0"),
          cellOutput: input.cellOutput,
          outputData: input.data,
        });
      }),
      outputs: skeleton.outputs.toArray().map((output) => output.cellOutput),
      outputsData: skeleton.outputs.toArray().map((output) => output.data),
      witnesses: skeleton.witnesses.toArray(),
    });
  }

  rawToBytes(): Bytes {
    return bytesFrom(
      mol.SerializeRawTransaction({
        version: numToBytes(this.version, 4),
        cellDeps: this.cellDeps.map((d) => d._toMolData()),
        headerDeps: this.headerDeps.map(bytesFrom),
        inputs: this.inputs.map((i) => i._toMolData()),
        outputs: this.outputs.map((o) => o._toMolData()),
        outputsData: this.outputsData.map(bytesFrom),
      }),
    );
  }

  hash() {
    return ckbHash(this.rawToBytes());
  }

  static hashWitnessToHasher(witness: HexLike, hasher: Hasher) {
    const raw = bytesFrom(hexFrom(witness));
    hasher.update(numToBytes(raw.length, 8));
    hasher.update(raw);
  }
}

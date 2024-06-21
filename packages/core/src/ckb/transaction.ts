import type { TransactionSkeletonType } from "@ckb-lumos/helpers";
import { Bytes, BytesLike, bytesFrom } from "../bytes";
import { Client } from "../client";
import { Hasher, ckbHash } from "../hasher";
import { Hex, HexLike, hexFrom } from "../hex";
import { Num, NumLike, numFrom, numFromBytes, numToBytes } from "../num";
import { apply } from "../utils";
import * as mol from "./molecule.advanced";
import { Script, ScriptLike } from "./script";
import { DEP_TYPE_TO_NUM, NUM_TO_DEP_TYPE } from "./transaction.advanced";
import { Transaction as LumosTransaction } from '@ckb-lumos/base';

export type DepTypeLike = string | number | bigint;
export type DepType = "depGroup" | "code";

/**
 * Converts a DepTypeLike value to a DepType.
 *
 * @param val - The value to convert, which can be a string, number, or bigint.
 * @returns The corresponding DepType.
 *
 * @throws Will throw an error if the input value is not a valid dep type.
 *
 * @example
 * ```typescript
 * const depType = depTypeFrom(1); // Outputs "code"
 * const depType = depTypeFrom("depGroup"); // Outputs "depGroup"
 * ```
 */

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

/**
 * Converts a DepTypeLike value to its corresponding byte representation.
 *
 * @param depType - The dep type value to convert.
 * @returns A Uint8Array containing the byte representation of the dep type.
 *
 * @example
 * ```typescript
 * const depTypeBytes = depTypeToBytes("code"); // Outputs Uint8Array [1]
 * ```
 */

export function depTypeToBytes(depType: DepTypeLike): Bytes {
  return bytesFrom([DEP_TYPE_TO_NUM[depTypeFrom(depType)]]);
}

/**
 * Converts a byte-like value to a DepType.
 *
 * @param bytes - The byte-like value to convert.
 * @returns The corresponding DepType.
 *
 * @throws Will throw an error if the input bytes do not correspond to a valid dep type.
 *
 * @example
 * ```typescript
 * const depType = depTypeFromBytes(new Uint8Array([1])); // Outputs "code"
 * ```
 */

export function depTypeFromBytes(bytes: BytesLike): DepType {
  return NUM_TO_DEP_TYPE[bytesFrom(bytes)[0]];
}

export type OutPointLike = {
  txHash: HexLike;
  index: NumLike;
};
export class OutPoint {
  /**
   * Creates an instance of OutPoint.
   *
   * @param txHash - The transaction hash.
   * @param index - The index of the output in the transaction.
   */

  constructor(
    public txHash: Hex,
    public index: Num,
  ) {}

  /**
   * Creates an OutPoint instance from an OutPointLike object.
   *
   * @param outPoint - An OutPointLike object or an instance of OutPoint.
   * @returns An OutPoint instance.
   *
   * @example
   * ```typescript
   * const outPoint = OutPoint.from({ txHash: "0x...", index: 0 });
   * ```
   */

  static from(outPoint: OutPointLike): OutPoint {
    if (outPoint instanceof OutPoint) {
      return outPoint;
    }
    return new OutPoint(hexFrom(outPoint.txHash), numFrom(outPoint.index));
  }

  /**
   * Converts the OutPoint instance to molecule data format.
   *
   * @returns An object representing the outpoint in molecule data format.
   */

  _toMolData() {
    return {
      txHash: bytesFrom(this.txHash),
      index: numToBytes(this.index, 4),
    };
  }

  /**
   * Converts the OutPoint instance to bytes.
   *
   * @returns A Uint8Array containing the outpoint bytes.
   *
   * @example
   * ```typescript
   * const outPointBytes = outPoint.encode();
   * ```
   */

  encode(): Bytes {
    return bytesFrom(mol.SerializeOutPoint(this._toMolData()));
  }

  /**
   * Creates an OutPoint instance from a byte-like value or molecule OutPoint.
   *
   * @param bytes - The byte-like value or molecule OutPoint to convert.
   * @returns An OutPoint instance.
   *
   * @example
   * ```typescript
   * const outPoint = OutPoint.fromBytes(new Uint8Array([/* outpoint bytes *\/]));
   * ```
   */

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
  /**
   * Creates an instance of CellOutput.
   *
   * @param capacity - The capacity of the cell.
   * @param lock - The lock script of the cell.
   * @param type - The optional type script of the cell.
   */

  constructor(
    public capacity: Num,
    public lock: Script,
    public type?: Script,
  ) {}

  /**
   * Creates a CellOutput instance from a CellOutputLike object.
   *
   * @param cellOutput - A CellOutputLike object or an instance of CellOutput.
   * @returns A CellOutput instance.
   *
   * @example
   * ```typescript
   * const cellOutput = CellOutput.from({
   *   capacity: 1000n,
   *   lock: { codeHash: "0x...", hashType: "type", args: "0x..." },
   *   type: { codeHash: "0x...", hashType: "type", args: "0x..." }
   * });
   * ```
   */

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

  /**
   * Converts the CellOutput instance to molecule data format.
   *
   * @returns An object representing the cell output in molecule data format.
   */

  _toMolData() {
    return {
      capacity: numToBytes(this.capacity, 8),
      lock: this.lock._toMolData(),
      type: this.type?._toMolData(),
    };
  }

  /**
   * Converts the CellOutput instance to bytes.
   *
   * @returns A Uint8Array containing the cell output bytes.
   *
   * @example
   * ```typescript
   * const cellOutputBytes = cellOutput.toBytes();
   * ```
   */

  toBytes(): Bytes {
    return bytesFrom(mol.SerializeCellOutput(this._toMolData()));
  }

  /**
   * Creates a CellOutput instance from a byte-like value or molecule CellOutput.
   *
   * @param bytes - The byte-like value or molecule CellOutput to convert.
   * @returns A CellOutput instance.
   *
   * @example
   * ```typescript
   * const cellOutput = CellOutput.fromBytes(new Uint8Array([/* cell output bytes *\/]));
   * ```
   */

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

export type CellLike = {
  cellOutput: CellOutputLike;
  outputData: HexLike;
};
export class Cell {
  /**
   * Creates an instance of Cell.
   *
   * @param cellOutput - The cell output of the cell.
   * @param outputData - The output data of the cell.
   */

  constructor(
    public cellOutput: CellOutput,
    public outputData: Hex,
  ) {}

  /**
   * Creates a Cell instance from a CellLike object.
   *
   * @param cell - A CellLike object or an instance of Cell.
   * @returns A Cell instance.
   */

  static from(cell: CellLike): Cell {
    if (cell instanceof Cell) {
      return cell;
    }

    return new Cell(CellOutput.from(cell.cellOutput), hexFrom(cell.outputData));
  }
}

export type CellInputLike = {
  previousOutput: OutPointLike;
  since: NumLike;
  cellOutput?: CellOutputLike;
  outputData?: HexLike;
};
export class CellInput {
  /**
   * Creates an instance of CellInput.
   *
   * @param previousOutput - The previous outpoint of the cell.
   * @param since - The since value of the cell input.
   * @param cellOutput - The optional cell output associated with the cell input.
   * @param outputData - The optional output data associated with the cell input.
   */

  constructor(
    public previousOutput: OutPoint,
    public since: Num,
    public cellOutput?: CellOutput,
    public outputData?: Hex,
  ) {}

  /**
   * Creates a CellInput instance from a CellInputLike object.
   *
   * @param cellInput - A CellInputLike object or an instance of CellInput.
   * @returns A CellInput instance.
   *
   * @example
   * ```typescript
   * const cellInput = CellInput.from({
   *   previousOutput: { txHash: "0x...", index: 0 },
   *   since: 0n
   * });
   * ```
   */

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

  /**
   * Complete extra infos in the input. Like the output of the out point.
   * The instance will be modified.
   *
   * @returns The completed instance.
   * @example
   * ```typescript
   * if (!cellInput.cellOutput) {
   *   await cellInput.completeExtraInfos();
   * }
   * ```
   */

  async completeExtraInfos(client: Client): Promise<CellInput> {
    if (this.cellOutput && this.outputData) {
      return this;
    }

    const cell = await client.getCell(this.previousOutput);
    if (cell) {
      this.cellOutput = cell.cellOutput;
      this.outputData = cell.outputData;
    }
    return this;
  }

  /**
   * Converts the CellInput instance to molecule data format.
   *
   * @returns An object representing the cell input in molecule data format.
   */

  _toMolData() {
    return {
      previousOutput: this.previousOutput._toMolData(),
      since: numToBytes(this.since, 8),
    };
  }

  /**
   * Converts the CellInput instance to bytes.
   *
   * @returns A Uint8Array containing the cell input bytes.
   *
   * @example
   * ```typescript
   * const cellInputBytes = cellInput.toBytes();
   * ```
   */

  toBytes(): Bytes {
    return bytesFrom(mol.SerializeCellInput(this._toMolData()));
  }

  /**
   * Creates a CellInput instance from a byte-like value or molecule CellInput.
   *
   * @param bytes - The byte-like value or molecule CellInput to convert.
   * @returns A CellInput instance.
   *
   * @example
   * ```typescript
   * const cellInput = CellInput.fromBytes(new Uint8Array([/* cell input bytes *\/]));
   * ```
   */

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
  /**
   * Creates an instance of CellDep.
   *
   * @param outPoint - The outpoint of the cell dependency.
   * @param depType - The dependency type.
   */

  constructor(
    public outPoint: OutPoint,
    public depType: DepType,
  ) {}

  /**
   * Creates a CellDep instance from a CellDepLike object.
   *
   * @param cellDep - A CellDepLike object or an instance of CellDep.
   * @returns A CellDep instance.
   *
   * @example
   * ```typescript
   * const cellDep = CellDep.from({
   *   outPoint: { txHash: "0x...", index: 0 },
   *   depType: "depGroup"
   * });
   * ```
   */

  static from(cellDep: CellDepLike): CellDep {
    if (cellDep instanceof CellDep) {
      return cellDep;
    }

    return new CellDep(
      OutPoint.from(cellDep.outPoint),
      depTypeFrom(cellDep.depType),
    );
  }

  /**
   * Converts the CellDep instance to molecule data format.
   *
   * @returns An object representing the cell dependency in molecule data format.
   */

  _toMolData() {
    return {
      outPoint: this.outPoint._toMolData(),
      depType: depTypeToBytes(this.depType),
    };
  }

  /**
   * Converts the CellDep instance to bytes.
   *
   * @returns A Uint8Array containing the cell dependency bytes.
   *
   * @example
   * ```typescript
   * const cellDepBytes = cellDep.toBytes();
   * ```
   */

  toBytes(): Bytes {
    return bytesFrom(mol.SerializeCellDep(this._toMolData()));
  }

  /**
   * Creates a CellDep instance from a byte-like value or molecule CellDep.
   *
   * @param bytes - The byte-like value or molecule CellDep to convert.
   * @returns A CellDep instance.
   *
   * @example
   * ```typescript
   * const cellDep = CellDep.fromBytes(new Uint8Array([/* cell dep bytes *\/]));
   * ```
   */

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
  /**
   * Creates an instance of WitnessArgs.
   *
   * @param lock - The optional lock field of the witness.
   * @param inputType - The optional input type field of the witness.
   * @param outputType - The optional output type field of the witness.
   */

  constructor(
    public lock?: Hex,
    public inputType?: Hex,
    public outputType?: Hex,
  ) {}

  /**
   * Creates a WitnessArgs instance from a WitnessArgsLike object.
   *
   * @param witnessArgs - A WitnessArgsLike object or an instance of WitnessArgs.
   * @returns A WitnessArgs instance.
   *
   * @example
   * ```typescript
   * const witnessArgs = WitnessArgs.from({
   *   lock: "0x...",
   *   inputType: "0x...",
   *   outputType: "0x..."
   * });
   * ```
   */

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

  /**
   * Converts the WitnessArgs instance to molecule data format.
   *
   * @returns An object representing the witness arguments in molecule data format.
   */

  _toMolData() {
    return {
      lock: apply(bytesFrom, this.lock),
      inputType: apply(bytesFrom, this.inputType),
      outputType: apply(bytesFrom, this.outputType),
    };
  }

  /**
   * Converts the WitnessArgs instance to bytes.
   *
   * @returns A Uint8Array containing the witness arguments bytes.
   *
   * @example
   * ```typescript
   * const witnessArgsBytes = witnessArgs.toBytes();
   * ```
   */

  toBytes(): Bytes {
    return bytesFrom(mol.SerializeWitnessArgs(this._toMolData()));
  }

  /**
   * Creates a WitnessArgs instance from a byte-like value or molecule WitnessArgs.
   *
   * @param bytes - The byte-like value or molecule WitnessArgs to convert.
   * @returns A WitnessArgs instance.
   *
   * @example
   * ```typescript
   * const witnessArgs = WitnessArgs.fromBytes(new Uint8Array([/* witness args bytes *\/]));
   * ```
   */

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
  /**
   * Creates an instance of Transaction.
   *
   * @param version - The version of the transaction.
   * @param cellDeps - The cell dependencies of the transaction.
   * @param headerDeps - The header dependencies of the transaction.
   * @param inputs - The inputs of the transaction.
   * @param outputs - The outputs of the transaction.
   * @param outputsData - The data associated with the outputs.
   * @param witnesses - The witnesses of the transaction.
   */

  constructor(
    public version: Num,
    public cellDeps: CellDep[],
    public headerDeps: Hex[],
    public inputs: CellInput[],
    public outputs: CellOutput[],
    public outputsData: Hex[],
    public witnesses: Hex[],
  ) {}

  /**
   * Creates a default Transaction instance with empty fields.
   *
   * @returns A default Transaction instance.
   *
   * @example
   * ```typescript
   * const defaultTx = Transaction.default();
   * ```
   */

  static default(): Transaction {
    return new Transaction(0n, [], [], [], [], [], []);
  }

  /**
   * Creates a Transaction instance from a TransactionLike object.
   *
   * @param tx - A TransactionLike object or an instance of Transaction.
   * @returns A Transaction instance.
   *
   * @example
   * ```typescript
   * const transaction = Transaction.from({
   *   version: 0,
   *   cellDeps: [],
   *   headerDeps: [],
   *   inputs: [],
   *   outputs: [],
   *   outputsData: [],
   *   witnesses: []
   * });
   * ```
   */

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

  /**
   * Creates a Transaction instance from a Lumos skeleton.
   *
   * @param skeleton - The Lumos transaction skeleton.
   * @returns A Transaction instance.
   *
   * @throws Will throw an error if an input's outPoint is missing.
   *
   * @example
   * ```typescript
   * const transaction = Transaction.fromLumosSkeleton(skeleton);
   * ```
   */

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

  /**
   * Converts the raw transaction data to bytes.
   *
   * @returns A Uint8Array containing the raw transaction bytes.
   *
   * @example
   * ```typescript
   * const rawTxBytes = transaction.rawToBytes();
   * ```
   */

  rawToBytes(): Bytes {
    return bytesFrom(
      mol.SerializeRawTransaction({
        version: numToBytes(this.version, 4),
        cellDeps: this.cellDeps.map((d) => d._toMolData()),
        headerDeps: this.headerDeps.map((header) => bytesFrom(header)),
        inputs: this.inputs.map((i) => i._toMolData()),
        outputs: this.outputs.map((o) => o._toMolData()),
        outputsData: this.outputsData.map((header) => bytesFrom(header)),
      }),
    );
  }

  /**
   * Calculates the hash of the transaction.
   *
   * @returns The hash of the transaction.
   *
   * @example
   * ```typescript
   * const txHash = transaction.hash();
   * ```
   */

  hash() {
    return ckbHash(this.rawToBytes());
  }

  /**
   * Hashes a witness and updates the hasher.
   *
   * @param witness - The witness to hash.
   * @param hasher - The hasher instance to update.
   *
   * @example
   * ```typescript
   * Transaction.hashWitnessToHasher("0x...", hasher);
   * ```
   */

  static hashWitnessToHasher(witness: HexLike, hasher: Hasher) {
    const raw = bytesFrom(hexFrom(witness));
    hasher.update(numToBytes(raw.length, 8));
    hasher.update(raw);
  }
}

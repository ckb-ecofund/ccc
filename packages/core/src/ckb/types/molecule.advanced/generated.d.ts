/* eslint-disable */

export interface CastToArrayBuffer {
  toArrayBuffer(): ArrayBuffer;
}

export type CanCastToArrayBuffer = ArrayBuffer | CastToArrayBuffer;

export interface CreateOptions {
  validate?: boolean;
}

export interface UnionType {
  type: string;
  value: any;
}

export type Uint32Type = CanCastToArrayBuffer;

export type Uint64Type = CanCastToArrayBuffer;

export type Uint128Type = CanCastToArrayBuffer;

export type Byte32Type = CanCastToArrayBuffer;

export type Uint256Type = CanCastToArrayBuffer;

export type BytesType = CanCastToArrayBuffer;

export type BytesOptType = BytesType | undefined;

export type BytesOptVecType = BytesOptType[];

export type BytesVecType = BytesType[];

export type Byte32VecType = Byte32Type[];

export type ScriptOptType = ScriptType | undefined;

export type ProposalShortIdType = CanCastToArrayBuffer;

export type UncleBlockVecType = UncleBlockType[];

export type TransactionVecType = TransactionType[];

export type ProposalShortIdVecType = ProposalShortIdType[];

export type CellDepVecType = CellDepType[];

export type CellInputVecType = CellInputType[];

export type CellOutputVecType = CellOutputType[];

export interface ScriptType {
  codeHash: Byte32Type;
  hashType: CanCastToArrayBuffer;
  args: BytesType;
}

export interface OutPointType {
  txHash: Byte32Type;
  index: Uint32Type;
}

export interface CellInputType {
  since: Uint64Type;
  previousOutput: OutPointType;
}

export interface CellOutputType {
  capacity: Uint64Type;
  lock: ScriptType;
  type?: ScriptType;
}

export interface CellDepType {
  outPoint: OutPointType;
  depType: CanCastToArrayBuffer;
}

export interface RawTransactionType {
  version: Uint32Type;
  cellDeps: CellDepVecType;
  headerDeps: Byte32VecType;
  inputs: CellInputVecType;
  outputs: CellOutputVecType;
  outputsData: BytesVecType;
}

export interface TransactionType {
  raw: RawTransactionType;
  witnesses: BytesVecType;
}

export interface RawHeaderType {
  version: Uint32Type;
  compactTarget: Uint32Type;
  timestamp: Uint64Type;
  number: Uint64Type;
  epoch: Uint64Type;
  parentHash: Byte32Type;
  transactionsRoot: Byte32Type;
  proposalsHash: Byte32Type;
  extraHash: Byte32Type;
  dao: Byte32Type;
}

export interface HeaderType {
  raw: RawHeaderType;
  nonce: Uint128Type;
}

export interface UncleBlockType {
  header: HeaderType;
  proposals: ProposalShortIdVecType;
}

export interface BlockType {
  header: HeaderType;
  uncles: UncleBlockVecType;
  transactions: TransactionVecType;
  proposals: ProposalShortIdVecType;
}

export interface BlockV1Type {
  header: HeaderType;
  uncles: UncleBlockVecType;
  transactions: TransactionVecType;
  proposals: ProposalShortIdVecType;
  extension: BytesType;
}

export interface CellbaseWitnessType {
  lock: ScriptType;
  message: BytesType;
}

export interface WitnessArgsType {
  lock?: BytesType;
  inputType?: BytesType;
  outputType?: BytesType;
}

export function SerializeUint32(value: CanCastToArrayBuffer): ArrayBuffer;
export class Uint32 {
  constructor(reader: CanCastToArrayBuffer, options?: CreateOptions);
  validate(compatible?: boolean): void;
  indexAt(i: number): number;
  raw(): ArrayBuffer;
  toBigEndianUint32(): number;
  toLittleEndianUint32(): number;
  static size(): Number;
}

export function SerializeUint64(value: CanCastToArrayBuffer): ArrayBuffer;
export class Uint64 {
  constructor(reader: CanCastToArrayBuffer, options?: CreateOptions);
  validate(compatible?: boolean): void;
  indexAt(i: number): number;
  raw(): ArrayBuffer;
  static size(): Number;
}

export function SerializeUint128(value: CanCastToArrayBuffer): ArrayBuffer;
export class Uint128 {
  constructor(reader: CanCastToArrayBuffer, options?: CreateOptions);
  validate(compatible?: boolean): void;
  indexAt(i: number): number;
  raw(): ArrayBuffer;
  static size(): Number;
}

export function SerializeByte32(value: CanCastToArrayBuffer): ArrayBuffer;
export class Byte32 {
  constructor(reader: CanCastToArrayBuffer, options?: CreateOptions);
  validate(compatible?: boolean): void;
  indexAt(i: number): number;
  raw(): ArrayBuffer;
  static size(): Number;
}

export function SerializeUint256(value: CanCastToArrayBuffer): ArrayBuffer;
export class Uint256 {
  constructor(reader: CanCastToArrayBuffer, options?: CreateOptions);
  validate(compatible?: boolean): void;
  indexAt(i: number): number;
  raw(): ArrayBuffer;
  static size(): Number;
}

export function SerializeBytes(value: CanCastToArrayBuffer): ArrayBuffer;
export class Bytes {
  constructor(reader: CanCastToArrayBuffer, options?: CreateOptions);
  validate(compatible?: boolean): void;
  indexAt(i: number): number;
  raw(): ArrayBuffer;
  length(): number;
}

export function SerializeBytesOpt(value: BytesType | null): ArrayBuffer;
export class BytesOpt {
  constructor(reader: CanCastToArrayBuffer, options?: CreateOptions);
  validate(compatible?: boolean): void;
  value(): Bytes;
  hasValue(): boolean;
}

export function SerializeBytesOptVec(value: Array<BytesOptType>): ArrayBuffer;
export class BytesOptVec {
  constructor(reader: CanCastToArrayBuffer, options?: CreateOptions);
  validate(compatible?: boolean): void;
  indexAt(i: number): BytesOpt;
  length(): number;
}

export function SerializeBytesVec(value: Array<BytesType>): ArrayBuffer;
export class BytesVec {
  constructor(reader: CanCastToArrayBuffer, options?: CreateOptions);
  validate(compatible?: boolean): void;
  indexAt(i: number): Bytes;
  length(): number;
}

export function SerializeByte32Vec(value: Array<Byte32Type>): ArrayBuffer;
export class Byte32Vec {
  constructor(reader: CanCastToArrayBuffer, options?: CreateOptions);
  validate(compatible?: boolean): void;
  indexAt(i: number): Byte32;
  length(): number;
}

export function SerializeScriptOpt(value: ScriptType | null): ArrayBuffer;
export class ScriptOpt {
  constructor(reader: CanCastToArrayBuffer, options?: CreateOptions);
  validate(compatible?: boolean): void;
  value(): Script;
  hasValue(): boolean;
}

export function SerializeProposalShortId(value: CanCastToArrayBuffer): ArrayBuffer;
export class ProposalShortId {
  constructor(reader: CanCastToArrayBuffer, options?: CreateOptions);
  validate(compatible?: boolean): void;
  indexAt(i: number): number;
  raw(): ArrayBuffer;
  static size(): Number;
}

export function SerializeUncleBlockVec(value: Array<UncleBlockType>): ArrayBuffer;
export class UncleBlockVec {
  constructor(reader: CanCastToArrayBuffer, options?: CreateOptions);
  validate(compatible?: boolean): void;
  indexAt(i: number): UncleBlock;
  length(): number;
}

export function SerializeTransactionVec(value: Array<TransactionType>): ArrayBuffer;
export class TransactionVec {
  constructor(reader: CanCastToArrayBuffer, options?: CreateOptions);
  validate(compatible?: boolean): void;
  indexAt(i: number): Transaction;
  length(): number;
}

export function SerializeProposalShortIdVec(value: Array<ProposalShortIdType>): ArrayBuffer;
export class ProposalShortIdVec {
  constructor(reader: CanCastToArrayBuffer, options?: CreateOptions);
  validate(compatible?: boolean): void;
  indexAt(i: number): ProposalShortId;
  length(): number;
}

export function SerializeCellDepVec(value: Array<CellDepType>): ArrayBuffer;
export class CellDepVec {
  constructor(reader: CanCastToArrayBuffer, options?: CreateOptions);
  validate(compatible?: boolean): void;
  indexAt(i: number): CellDep;
  length(): number;
}

export function SerializeCellInputVec(value: Array<CellInputType>): ArrayBuffer;
export class CellInputVec {
  constructor(reader: CanCastToArrayBuffer, options?: CreateOptions);
  validate(compatible?: boolean): void;
  indexAt(i: number): CellInput;
  length(): number;
}

export function SerializeCellOutputVec(value: Array<CellOutputType>): ArrayBuffer;
export class CellOutputVec {
  constructor(reader: CanCastToArrayBuffer, options?: CreateOptions);
  validate(compatible?: boolean): void;
  indexAt(i: number): CellOutput;
  length(): number;
}

export function SerializeScript(value: ScriptType): ArrayBuffer;
export class Script {
  constructor(reader: CanCastToArrayBuffer, options?: CreateOptions);
  validate(compatible?: boolean): void;
  getCodeHash(): Byte32;
  getHashType(): number;
  getArgs(): Bytes;
}

export function SerializeOutPoint(value: OutPointType): ArrayBuffer;
export class OutPoint {
  constructor(reader: CanCastToArrayBuffer, options?: CreateOptions);
  validate(compatible?: boolean): void;
  static size(): Number;
  getTxHash(): Byte32;
  getIndex(): Uint32;
}

export function SerializeCellInput(value: CellInputType): ArrayBuffer;
export class CellInput {
  constructor(reader: CanCastToArrayBuffer, options?: CreateOptions);
  validate(compatible?: boolean): void;
  static size(): Number;
  getSince(): Uint64;
  getPreviousOutput(): OutPoint;
}

export function SerializeCellOutput(value: CellOutputType): ArrayBuffer;
export class CellOutput {
  constructor(reader: CanCastToArrayBuffer, options?: CreateOptions);
  validate(compatible?: boolean): void;
  getCapacity(): Uint64;
  getLock(): Script;
  getType(): ScriptOpt;
}

export function SerializeCellDep(value: CellDepType): ArrayBuffer;
export class CellDep {
  constructor(reader: CanCastToArrayBuffer, options?: CreateOptions);
  validate(compatible?: boolean): void;
  static size(): Number;
  getOutPoint(): OutPoint;
  getDepType(): number;
}

export function SerializeRawTransaction(value: RawTransactionType): ArrayBuffer;
export class RawTransaction {
  constructor(reader: CanCastToArrayBuffer, options?: CreateOptions);
  validate(compatible?: boolean): void;
  getVersion(): Uint32;
  getCellDeps(): CellDepVec;
  getHeaderDeps(): Byte32Vec;
  getInputs(): CellInputVec;
  getOutputs(): CellOutputVec;
  getOutputsData(): BytesVec;
}

export function SerializeTransaction(value: TransactionType): ArrayBuffer;
export class Transaction {
  constructor(reader: CanCastToArrayBuffer, options?: CreateOptions);
  validate(compatible?: boolean): void;
  getRaw(): RawTransaction;
  getWitnesses(): BytesVec;
}

export function SerializeRawHeader(value: RawHeaderType): ArrayBuffer;
export class RawHeader {
  constructor(reader: CanCastToArrayBuffer, options?: CreateOptions);
  validate(compatible?: boolean): void;
  static size(): Number;
  getVersion(): Uint32;
  getCompactTarget(): Uint32;
  getTimestamp(): Uint64;
  getNumber(): Uint64;
  getEpoch(): Uint64;
  getParentHash(): Byte32;
  getTransactionsRoot(): Byte32;
  getProposalsHash(): Byte32;
  getExtraHash(): Byte32;
  getDao(): Byte32;
}

export function SerializeHeader(value: HeaderType): ArrayBuffer;
export class Header {
  constructor(reader: CanCastToArrayBuffer, options?: CreateOptions);
  validate(compatible?: boolean): void;
  static size(): Number;
  getRaw(): RawHeader;
  getNonce(): Uint128;
}

export function SerializeUncleBlock(value: UncleBlockType): ArrayBuffer;
export class UncleBlock {
  constructor(reader: CanCastToArrayBuffer, options?: CreateOptions);
  validate(compatible?: boolean): void;
  getHeader(): Header;
  getProposals(): ProposalShortIdVec;
}

export function SerializeBlock(value: BlockType): ArrayBuffer;
export class Block {
  constructor(reader: CanCastToArrayBuffer, options?: CreateOptions);
  validate(compatible?: boolean): void;
  getHeader(): Header;
  getUncles(): UncleBlockVec;
  getTransactions(): TransactionVec;
  getProposals(): ProposalShortIdVec;
}

export function SerializeBlockV1(value: BlockV1Type): ArrayBuffer;
export class BlockV1 {
  constructor(reader: CanCastToArrayBuffer, options?: CreateOptions);
  validate(compatible?: boolean): void;
  getHeader(): Header;
  getUncles(): UncleBlockVec;
  getTransactions(): TransactionVec;
  getProposals(): ProposalShortIdVec;
  getExtension(): Bytes;
}

export function SerializeCellbaseWitness(value: CellbaseWitnessType): ArrayBuffer;
export class CellbaseWitness {
  constructor(reader: CanCastToArrayBuffer, options?: CreateOptions);
  validate(compatible?: boolean): void;
  getLock(): Script;
  getMessage(): Bytes;
}

export function SerializeWitnessArgs(value: WitnessArgsType): ArrayBuffer;
export class WitnessArgs {
  constructor(reader: CanCastToArrayBuffer, options?: CreateOptions);
  validate(compatible?: boolean): void;
  getLock(): BytesOpt;
  getInputType(): BytesOpt;
  getOutputType(): BytesOpt;
}


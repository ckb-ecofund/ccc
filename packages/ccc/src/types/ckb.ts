import { toHex } from "../codec";
import { HASHTYPE_TO_NUM, NUM_TO_HASHTYPE } from "./ckb.advanced";
import { BytesLike, HexString } from "./primitive";

export type HashType = "type" | "data" | "data1" | "data2";
export function parseHashType(hashType: HashType) {
  const val = HASHTYPE_TO_NUM[hashType];

  if (val === undefined) {
    throw new Error(`Invalid hash type ${hashType}`);
  }

  return val;
}
export function formatHashType(hashType: number): HashType {
  const val = NUM_TO_HASHTYPE[hashType];

  if (val === undefined) {
    throw new Error(`Invalid hash type ${hashType}`);
  }

  return val;
}

export class Script {
  constructor(
    public readonly codeHash: HexString,
    public readonly hashType: HashType,
    public readonly args: HexString,
  ) {}

  static from({
    codeHash,
    hashType,
    args,
  }: {
    codeHash: BytesLike;
    hashType: string;
    args: BytesLike;
  }): Script {
    return {
      codeHash: toHex(codeHash),
      hashType: hashType as HashType,
      args: toHex(args),
    };
  }
}

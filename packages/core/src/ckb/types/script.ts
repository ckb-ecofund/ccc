import { DeepReadonly } from "ts-essentials";
import { toBytes, toHex } from "../../bytes";
import { BytesLike, Hex } from "../../primitive";
import { HASH_TYPE_TO_NUM, NUM_TO_HASH_TYPE } from "./script.advanced";
import * as mol from "./molecule.advanced";

export type HashType = "type" | "data" | "data1" | "data2";

export function encodeHashType(hashType: HashType): Uint8Array {
  return toBytes([HASH_TYPE_TO_NUM[hashType]]);
}

export function decodeHashType(bytes: BytesLike): HashType {
  return NUM_TO_HASH_TYPE[toBytes(bytes)[0]];
}

export class Script {
  constructor(
    public codeHash: Hex,
    public hashType: HashType,
    public args: Hex,
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

  static _toMolData(script: DeepReadonly<Script>) {
    return {
      codeHash: toBytes(script.codeHash),
      hashType: encodeHashType(script.hashType),
      args: toBytes(script.args),
    };
  }

  static encode(script: DeepReadonly<Script>): Uint8Array {
    return toBytes(mol.SerializeScript(Script._toMolData(script)));
  }

  static decode(bytes: BytesLike | mol.Script): Script {
    const view =
      bytes instanceof mol.Script ? bytes : new mol.Script(toBytes(bytes));

    return {
      codeHash: toHex(view.getCodeHash().raw()),
      hashType: decodeHashType([view.getHashType()]),
      args: toHex(view.getArgs().raw()),
    };
  }

  static eq(a: Script, b: Script): boolean {
    return (
      a.codeHash === b.codeHash &&
      a.args === b.args &&
      a.hashType === b.hashType
    );
  }
}

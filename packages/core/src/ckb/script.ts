import { Bytes, BytesLike, bytesFrom } from "../bytes";
import { Hex, hexFrom } from "../hex";
import * as mol from "./molecule.advanced";
import {
  HASH_TYPES,
  HASH_TYPE_TO_NUM,
  NUM_TO_HASH_TYPE,
} from "./script.advanced";

export type HashTypeLike = string | number | bigint;
export type HashType = "type" | "data" | "data1" | "data2";
export function hashTypeFrom(val: HashTypeLike): HashType {
  const hashType = (() => {
    if (typeof val === "number") {
      return NUM_TO_HASH_TYPE[val];
    }

    if (typeof val === "bigint") {
      return NUM_TO_HASH_TYPE[Number(val)];
    }

    if (!HASH_TYPES.includes(val)) {
      return;
    }
    return val as HashType;
  })();
  if (hashType === undefined) {
    throw new Error(`Invalid hash type ${val}`);
  }
  return hashType;
}
export function hashTypeToBytes(hashType: HashTypeLike): Bytes {
  return bytesFrom([HASH_TYPE_TO_NUM[hashTypeFrom(hashType)]]);
}
export function hashTypeFromBytes(bytes: BytesLike): HashType {
  return NUM_TO_HASH_TYPE[bytesFrom(bytes)[0]];
}

export type ScriptLike = {
  codeHash: BytesLike;
  hashType: HashTypeLike;
  args: BytesLike;
};
export class Script {
  constructor(
    public codeHash: Hex,
    public hashType: HashType,
    public args: Hex,
  ) {}

  static from(script: ScriptLike): Script {
    if (script instanceof Script) {
      return script;
    }

    return new Script(
      hexFrom(script.codeHash),
      hashTypeFrom(script.hashType),
      hexFrom(script.args),
    );
  }

  _toMolData() {
    return {
      codeHash: bytesFrom(this.codeHash),
      hashType: hashTypeToBytes(this.hashType),
      args: bytesFrom(this.args),
    };
  }

  toBytes(): Bytes {
    return bytesFrom(mol.SerializeScript(this._toMolData()));
  }

  static fromBytes(bytes: BytesLike | mol.Script): Script {
    const view =
      bytes instanceof mol.Script ? bytes : new mol.Script(bytesFrom(bytes));

    return new Script(
      hexFrom(view.getCodeHash().raw()),
      hashTypeFromBytes([view.getHashType()]),
      hexFrom(view.getArgs().raw()),
    );
  }

  eq(val: ScriptLike): boolean {
    const script = Script.from(val);
    return (
      this.codeHash === script.codeHash &&
      this.args === script.args &&
      this.hashType === script.hashType
    );
  }
}

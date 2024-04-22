import { BytesLike, Script } from "../types";
import { toBytes, toHex } from "./bytes";
import { decodeHashType, encodeHashType } from "./hashType";

export function encodeScript(script: Script): Uint8Array {
  return toBytes([
    ...toBytes(script.codeHash),
    ...encodeHashType(script.hashType),
    ...toBytes(script.args),
  ]);
}

export function decodeScript(bytes: BytesLike): Script {
  const formattedBytes = toBytes(bytes);

  return {
    codeHash: toHex(formattedBytes.slice(0, 32)),
    hashType: decodeHashType(formattedBytes.slice(32, 33)),
    args: toHex(formattedBytes.slice(33)),
  };
}

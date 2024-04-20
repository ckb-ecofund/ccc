import { BytesLike, HashType, formatHashType, parseHashType } from "../types";
import { toBytes } from "./bytes";

export function encodeHashType(hashType: HashType): Uint8Array {
  return toBytes([parseHashType(hashType)]);
}

export function decodeHashType(bytes: BytesLike): HashType {
  return formatHashType(toBytes(bytes)[0]);
}

import { BytesLike, HexString } from "../types";
import { Buffer } from "buffer";

export function toBytes(bytes: BytesLike | string): Uint8Array {
  if (bytes instanceof Uint8Array) {
    return bytes;
  }

  if (Array.isArray(bytes)) {
    if (bytes.some((v) => v < 0 || 0xff < v)) {
      throw new Error(`Invalid bytes ${bytes}`);
    }
    return new Uint8Array(bytes);
  }

  if (bytes.length % 2 !== 0) {
    throw new Error(`Invalid bytes with odd length ${bytes}`);
  }

  const strData = bytes.startsWith("0x") ? bytes.slice(2) : bytes;
  const data = Buffer.from(strData, "hex");
  if (data.length * 2 !== strData.length) {
    throw new Error(`Invalid bytes ${bytes}`);
  }
  return data;
}

export function toHex(bytes: BytesLike | string): HexString {
  return `0x${new Buffer(toBytes(bytes)).toString("hex")}`;
}

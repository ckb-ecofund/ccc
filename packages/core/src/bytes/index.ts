import { Buffer } from "buffer/";

export type Bytes = Uint8Array;
export type BytesLike = string | Uint8Array | ArrayBuffer | number[];

export function bytesConcat(...args: BytesLike[]): Bytes {
  return new Uint8Array(
    args.reduce((acc: number[], v) => {
      acc.push(...bytesFrom(v));
      return acc;
    }, []),
  );
}

export function bytesFromUtf8(val: string): Bytes {
  return Buffer.from(val, "utf-8");
}

export function bytesToUtf8(val: BytesLike): string {
  return Buffer.from(bytesFrom(val)).toString("utf-8");
}

export function bytesFrom(bytes: BytesLike): Bytes {
  if (bytes instanceof Uint8Array) {
    return bytes;
  }

  if (bytes instanceof ArrayBuffer) {
    return new Uint8Array(bytes);
  }

  if (Array.isArray(bytes)) {
    if (bytes.some((v) => v < 0 || 0xff < v)) {
      throw new Error(`Invalid bytes ${JSON.stringify(bytes)}`);
    }
    return new Uint8Array(bytes);
  }

  const str = bytes.startsWith("0x") ? bytes.slice(2) : bytes;
  const paddedStr = str.length % 2 === 0 ? str : `0${str}`;
  const data = Buffer.from(paddedStr, "hex");
  if (data.length * 2 !== paddedStr.length) {
    throw new Error(`Invalid bytes ${bytes}`);
  }
  return data;
}

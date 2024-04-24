import { BytesLike, Hex, HexLike, NumberLike } from "./primitive";
import { Buffer } from "buffer/";

export function concatBytes(...args: BytesLike[]): Uint8Array {
  return new Uint8Array(
    args.reduce((acc: number[], v) => {
      acc.push(...toBytes(v));
      return acc;
    }, []),
  );
}

export function encodeUtf8(val: string): Uint8Array {
  return Buffer.from(val, "utf-8");
}

export function decodeUtf8(val: BytesLike): string {
  return Buffer.from(toBytes(val)).toString("utf-8");
}

export function toBytes(bytes: BytesLike): Uint8Array {
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

  const str = bytes.length % 2 === 0 ? bytes.slice(2) : `0${bytes.slice(2)}`;
  const data = Buffer.from(str, "hex");
  if (data.length * 2 !== str.length) {
    throw new Error(`Invalid bytes ${bytes}`);
  }
  return data;
}

export function toHexFromHex(bytes: HexLike): Hex {
  if (typeof bytes === "string" && !bytes.startsWith("0x")) {
    return `0x${bytes}`;
  }

  return toHex(bytes);
}

export function toHex(bytes: HexLike): Hex {
  if (typeof bytes === "number") {
    return `0x${bytes.toString(16)}`;
  }

  if (typeof bytes === "string" && !bytes.startsWith("0x")) {
    return `0x${BigInt(bytes).toString(16)}`;
  }

  return `0x${Buffer.from(toBytes(bytes as BytesLike)).toString("hex")}`;
}

export function toNumber(val: NumberLike): string {
  return BigInt(val).toString();
}

export function toBytesFromNumber(val: NumberLike, bytes?: number): Uint8Array {
  return toBytesFromLENumber(val, bytes);
}

export function toBytesFromLENumber(
  val: NumberLike,
  bytes?: number,
): Uint8Array {
  return toBytesFromBENumber(val, bytes).reverse();
}

export function toBytesFromBENumber(
  val: NumberLike,
  bytes?: number,
): Uint8Array {
  let valStr = val;
  if (typeof valStr === "number" || typeof valStr === "bigint") {
    valStr = valStr.toString(16);
  } else if (typeof valStr === "string") {
    if (valStr.startsWith("0x")) {
      valStr = valStr.slice(2);
    } else {
      valStr = BigInt(valStr).toString(16);
    }
  }

  if (valStr.length % 2 !== 0) {
    valStr = `0${valStr}`;
  }

  const res = toBytes(`0x${valStr}`);
  if (bytes == null) {
    return res;
  }
  if (res.length > bytes) {
    return res.slice(res.length - bytes);
  }
  return new Uint8Array([
    ...Array.from(Array(bytes - res.length), () => 0),
    ...res,
  ]);
}

export function toNumberFromBytes(val: BytesLike): string {
  return toLENumberFromBytes(val);
}

export function toLENumberFromBytes(val: BytesLike): string {
  return toBENumberFromBytes(toBytes(val).reverse());
}

export function toBENumberFromBytes(val: BytesLike): string {
  const str = toHex(val).replace(/0x0*/, "0x");
  if (str.length === 2) {
    return "0";
  }

  return BigInt(str).toString();
}

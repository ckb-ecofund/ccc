import { Bytes, BytesLike, bytesConcat, bytesFrom } from "../bytes";
import { Hex, HexLike, hexFrom } from "../hex";

export type Num = bigint;
export type NumLike = string | number | bigint | HexLike;

export function numFrom(val: NumLike): Num {
  if (typeof val === "bigint") {
    return val;
  }

  if (typeof val === "string" || typeof val === "number") {
    return BigInt(val);
  }

  return BigInt(hexFrom(val));
}

export function numToHex(val: NumLike): Hex {
  return `0x${numFrom(val).toString(16)}`;
}

export function numToBytes(val: NumLike, bytes?: number): Bytes {
  return numLeToBytes(val, bytes);
}

export function numLeToBytes(val: NumLike, bytes?: number): Bytes {
  return numBeToBytes(val, bytes).reverse();
}

export function numBeToBytes(val: NumLike, bytes?: number): Bytes {
  const rawBytes = bytesFrom(numFrom(val).toString(16));
  if (bytes == null) {
    return rawBytes;
  }

  return bytesConcat(
    Array.from(Array(bytes - rawBytes.length), () => 0),
    rawBytes,
  );
}

export function numFromBytes(val: BytesLike): Num {
  return numLeFromBytes(val);
}

export function numLeFromBytes(val: BytesLike): Num {
  return numBeFromBytes(bytesFrom(val).reverse());
}

export function numBeFromBytes(val: BytesLike): Num {
  return numFrom(bytesFrom(val));
}

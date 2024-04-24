export type Hex = `0x${string}`;
export type BytesLike =
  | Hex
  | Uint8Array
  | ArrayBuffer
  | number[];
export type HexLike = BytesLike | number | string;
export type NumberLike = string | Hex | number | bigint;

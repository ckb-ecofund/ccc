import { bytesFrom, BytesLike, bytesTo } from "../bytes";

export type Hex = `0x${string}`;
export type HexLike = BytesLike;

export function hexFrom(hex: HexLike): Hex {
  return `0x${bytesTo(bytesFrom(hex), "hex")}`;
}

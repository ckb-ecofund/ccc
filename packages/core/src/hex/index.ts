import { Buffer } from "buffer/";
import { bytesFrom, BytesLike } from "../bytes";

export type Hex = `0x${string}`;
export type HexLike = BytesLike;

export function hexFrom(hex: HexLike): Hex {
  return `0x${Buffer.from(bytesFrom(hex)).toString("hex")}`;
}

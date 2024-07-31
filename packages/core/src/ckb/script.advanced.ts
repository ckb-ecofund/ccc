import { type HashType } from "./script.js";

export const HASH_TYPE_TO_NUM: Record<HashType, number> = {
  type: 0x01,
  data: 0x00,
  data1: 0x02,
  data2: 0x04,
};
export const NUM_TO_HASH_TYPE: Record<number, HashType> = {
  0x01: "type",
  0x00: "data",
  0x02: "data1",
  0x04: "data2",
};
export const HASH_TYPES: string[] = Object.keys(HASH_TYPE_TO_NUM);

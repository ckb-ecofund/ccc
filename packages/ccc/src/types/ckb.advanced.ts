import { HashType } from "./ckb";

export const HASHTYPE_TO_NUM: Record<HashType, number> = {
  type: 0x01,
  data: 0x00,
  data1: 0x02,
  data2: 0x04,
};
export const NUM_TO_HASHTYPE: Record<number, HashType> = {
  0x01: "type",
  0x00: "data",
  0x02: "data1",
  0x04: "data2",
};

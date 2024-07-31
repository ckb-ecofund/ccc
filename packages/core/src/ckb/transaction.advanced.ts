import { type DepType } from "./transaction.js";

export const DEP_TYPE_TO_NUM: Record<DepType, number> = {
  code: 0x00,
  depGroup: 0x01,
};
export const NUM_TO_DEP_TYPE: Record<number, DepType> = {
  0x00: "code",
  0x01: "depGroup",
};
export const DEP_TYPES: string[] = Object.keys(DEP_TYPE_TO_NUM);

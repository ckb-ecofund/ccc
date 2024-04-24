import { type DepType } from "./transaction";

export const DEP_TYPE_TO_NUM: Record<DepType, number> = {
  code: 0x00,
  depGroup: 0x01,
};
export const NUM_TO_DEP_TYPE: Record<number, DepType> = {
  0x00: "code",
  0x01: "depGroup",
};

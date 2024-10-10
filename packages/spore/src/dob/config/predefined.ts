import { ccc } from "@ckb-ccc/core";
import { Decoder } from "../helper/index.js";

export type DobType = "dob0" | "dob1";
export type DobScriptInfo = Record<DobType, Decoder>;

export const DOB_TESTNET_DECODERS: DobScriptInfo = Object.freeze({
  ["dob0"]: {
    type: "code_hash",
    hash: "0x13cac78ad8482202f18f9df4ea707611c35f994375fa03ae79121312dda9925c",
  },
  // another avaliable options:
  // {
  //   type: "type_id",
  //   hash: "0x784e32cef202b9d4759ea96e80d806f94051e8069fd34d761f452553700138d7",
  // }
  // or
  // {
  //   type: "type_script",
  //   script: {
  //     code_hash:
  //       "0x00000000000000000000000000000000000000000000000000545950455f4944",
  //     hash_type: "type",
  //     args: "0x784e32cef202b9d4759ea96e80d806f94051e8069fd34d761f452553700138d7",
  //   }
  // }
  ["dob1"]: {
    type: "code_hash",
    hash: "0xda3525549b72970b4c95f5b5749357f20d1293d335710b674f09c32f7d54b6dc",
  },
});

export const DOB_MAINNET_DECODERS: DobScriptInfo = Object.freeze({
  ["dob0"]: {
    type: "code_hash",
    hash: "0x13cac78ad8482202f18f9df4ea707611c35f994375fa03ae79121312dda9925c",
  },
  // another avaliable options:
  // {
  //   type: "type_id",
  //   hash: "0x8892bea4405a1f077921799bc0f4516e0ebaef7aea0dfc6614a8898fb47d5372",
  // },
  // or
  // {
  //   type: "type_script",
  //   script: {
  //     code_hash:
  //       "0x00000000000000000000000000000000000000000000000000545950455f4944",
  //     hash_type: "type",
  //     args: "0x8892bea4405a1f077921799bc0f4516e0ebaef7aea0dfc6614a8898fb47d5372",
  //   }
  // }
  ["dob1"]: {
    type: "code_hash",
    hash: "0xda3525549b72970b4c95f5b5749357f20d1293d335710b674f09c32f7d54b6dc",
  },
});

export function getDecoder(
  client: ccc.Client,
  dobType: DobType,
  dobScriptInfo?: DobScriptInfo,
): Decoder {
  if (dobScriptInfo) {
    return dobScriptInfo[dobType];
  }
  if (client.addressPrefix === "ckb") {
    return DOB_MAINNET_DECODERS[dobType];
  }
  return DOB_TESTNET_DECODERS[dobType];
}

export * from "./address";
import * as address from "./address";
export * from "./ckb";
import * as ckb from "./ckb";
export * from "./client";
import * as client from "./client";
export * from "./codec";
import * as codec from "./codec";
export * from "./types";
import * as types from "./types";
export * from "./signer";
import * as signer from "./signer";
export * from "./viewer";
import * as viewer from "./viewer";

export const ccc = {
  ...address,
  ...ckb,
  ...client,
  ...codec,
  ...types,
  ...signer,
  ...viewer,
};

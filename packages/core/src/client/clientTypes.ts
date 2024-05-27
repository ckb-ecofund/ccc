import { Transaction } from "../ckb";

export type OutputsValidator = "passthrough" | "well_known_scripts_only";

export type TransactionStatus =
  | "pending"
  | "proposed"
  | "committed"
  | "unknown"
  | "rejected";
export type ClientTransactionResponse = {
  transaction: Transaction;
  status: TransactionStatus;
};

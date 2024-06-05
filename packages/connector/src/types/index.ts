import { ccc } from "@ckb-ccc/ccc";

export type WalletWithSigners = ccc.Wallet & {
  signers: ccc.SignerInfo[];
};

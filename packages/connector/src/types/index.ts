import { ccc } from "@ckb-ccc/ccc";

export type WalletWithSigners = ccc.Wallet & {
  signers: ccc.SignerInfo[];
};

export interface WalletInfo {
  name: string;
  icon: string;
  downloadLink: string;
}


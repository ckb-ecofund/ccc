import { Nip07A } from "@ckb-ccc/nip07/advanced";

export interface BitcoinProvider {
  connect(): Promise<{
    address: string;
    publicKey: string;
    compressedPublicKey: string;
  }>;

  getSelectedAccount(): Promise<{
    address: string;
    publicKey: string;
    compressedPublicKey: string;
  } | null>;

  signMessage(msg: string, type: "ecdsa" | "bip322-simple"): Promise<string>;
}

export interface NostrProvider extends Nip07A.Provider {
  selectedAccount: { address: string; publicKey: string } | null;
}

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

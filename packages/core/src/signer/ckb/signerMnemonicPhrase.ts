import { Client } from "../../client";
import { SignerCkbPrivateKey } from "./signerCkbPrivateKey";
import { mnemonicToSeedSync, generateMnemonic as bip39GenerateMnemonic } from "@scure/bip39";
import * as english from '@scure/bip39/wordlists/english';
import { HDKey } from "@scure/bip32";
import { hexFrom } from "../../hex";
import { secp256k1 } from "@noble/curves/secp256k1";

export class SignerMnemonicphrase extends SignerCkbPrivateKey {
  private mnemonic: string;
  private hdPath: string;

  constructor(client: Client, options: {
    mnemonic?: string;
    hdPath?: string;
  } = {}) {
    const hdPath = options.hdPath || "m/44'/309'/0'/0/0";
    const mnemonic = options.mnemonic || SignerMnemonicphrase.generateMnemonic();
    const privateKey = SignerMnemonicphrase.derivePrivateKey(mnemonic, hdPath);

    super(client, privateKey);

    this.mnemonic = mnemonic;
    this.hdPath = hdPath;
  }

  public static generateMnemonic(strength: 128 | 160 | 192 | 224 | 256 = 128): string {
    return bip39GenerateMnemonic(english.wordlist, strength);
  }

  private static derivePrivateKey(mnemonic: string, hdPath: string): string {
    const seed = mnemonicToSeedSync(mnemonic);
    const hdKey = HDKey.fromMasterSeed(seed);
    const derivedKey = hdKey.derive(hdPath);
    
    if (!derivedKey.privateKey) {
      throw new Error("Failed to derive private key from mnemonic");
    }

    return hexFrom(derivedKey.privateKey);
  }

  public getMnemonic(): string {
    return this.mnemonic;
  }

  public getHDPath(): string {
    return this.hdPath;
  }

  public getSignerForPath(newPath: string): SignerMnemonicphrase {
    return new SignerMnemonicphrase(this.client, { mnemonic: this.mnemonic, hdPath: newPath });
  }

  public withNewMnemonic(mnemonic: string): SignerMnemonicphrase {
    return new SignerMnemonicphrase(this.client, { mnemonic, hdPath: this.hdPath });
  }

  public getSeed(mnemonic?: string): Uint8Array {
    return mnemonicToSeedSync(mnemonic || this.mnemonic);
  }

  public getSeedHex(mnemonic?: string): string {
    const seed = this.getSeed(mnemonic);
    return hexFrom(seed);
  }

  public expendPrivateKey(count: number, startIndex: number = 0, seed?: Uint8Array): Array<{ publicKey: string; privateKey: string; path: string }> {
    let hdKey: HDKey;

    if (seed) {
      hdKey = HDKey.fromMasterSeed(seed);
    } else {
      hdKey = HDKey.fromMasterSeed(this.getSeed());
    }
    
    return Array.from({ length: count }, (_, i) => {
      const index = startIndex + i;
      const path = `${this.hdPath.slice(0, -1)}${index}`;
      const expendedPrivatekey = hdKey.derive(path);
      
      if (!expendedPrivatekey.privateKey) {
        throw new Error(`Failed to derive private key for path: ${path}`);
      }

      const privateKey = hexFrom(expendedPrivatekey.privateKey);
      const publicKey = hexFrom(secp256k1.getPublicKey(expendedPrivatekey.privateKey, true));

      return { publicKey, privateKey, path };
    });
  }
}

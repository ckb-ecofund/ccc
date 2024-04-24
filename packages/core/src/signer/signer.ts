import { Viewer } from "../viewer";
import { BytesLike, Hex } from "../primitive";
import { Transaction } from "../ckb";

export abstract class Signer extends Viewer {
  abstract connect(): Promise<void>;

  abstract signMessage(message: string | BytesLike): Promise<Hex>;

  async sendTransaction(tx: Transaction): Promise<Hex> {
    return this.client.sendTransaction(await this.signTransaction(tx));
  }

  async signTransaction(tx: Transaction): Promise<Transaction> {
    return this.signOnlyTransaction(tx);
  }

  abstract signOnlyTransaction(tx: Transaction): Promise<Transaction>;
}

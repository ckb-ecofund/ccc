import { TransactionSkeletonType } from "./types/advanced";
import { Viewer } from "./viewer";
import { BytesLike, HexString } from "./types";

export abstract class Signer extends Viewer {
  abstract connect(): Promise<void>;

  abstract signMessage(message: string | BytesLike): Promise<HexString>;

  // Will be deprecated in the future
  async signLumosTransaction(
    tx: TransactionSkeletonType,
  ): Promise<TransactionSkeletonType> {
    const completedTx = await this.completeLumosTransaction(tx);
    return this.signOnlyLumosTransaction(completedTx);
  }

  // Will be deprecated in the future
  abstract signOnlyLumosTransaction(
    tx: TransactionSkeletonType,
  ): Promise<TransactionSkeletonType>;
}

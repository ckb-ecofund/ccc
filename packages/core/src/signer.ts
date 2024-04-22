import { TransactionSkeletonType } from "./types/lumos";
import { Viewer } from "./viewer";
import { BytesLike, HexString } from "./types";

export abstract class Signer extends Viewer {
  abstract signMessage(message: string | BytesLike): Promise<HexString>;

  // Will be deprecated in the future
  signLumosTransaction(
    tx: TransactionSkeletonType,
  ): Promise<TransactionSkeletonType> {
    const completedTx = this.completeLumosTransaction(tx);
    return this.signOnlyLumosTransaction(tx);
  }

  // Will be deprecated in the future
  abstract signOnlyLumosTransaction(
    tx: TransactionSkeletonType,
  ): Promise<TransactionSkeletonType>;
}
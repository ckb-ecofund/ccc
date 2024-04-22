import { TransactionSkeletonType } from "./types/advanced";
import { Client } from "./client";

export abstract class Viewer {
  abstract getClient(): Promise<Client>;

  abstract getRecommendedAddress(preference?: unknown): Promise<string>;
  abstract getAddresses(): Promise<string[]>;

  // Will be deprecated in the future
  abstract completeLumosTransaction(
    tx: TransactionSkeletonType,
  ): Promise<TransactionSkeletonType>;
}

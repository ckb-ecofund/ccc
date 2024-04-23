import { TransactionSkeletonType } from "./types/advanced";
import { Client } from "./client";
import { Address } from "./address";

export abstract class Viewer {
  abstract getClient(): Promise<Client>;

  abstract getInternalAddress(): Promise<string>;

  abstract getRecommendedAddressObj(preference?: unknown): Promise<Address>;
  abstract getAddressObjs(): Promise<Address[]>;

  async getRecommendedAddress(preference?: unknown): Promise<string> {
    return (await this.getRecommendedAddressObj(preference)).getAddress();
  }
  async getAddresses(): Promise<string[]> {
    return Promise.all(
      (await this.getAddressObjs()).map((address) => address.getAddress()),
    );
  }

  // Will be deprecated in the future
  abstract completeLumosTransaction(
    tx: TransactionSkeletonType,
  ): Promise<TransactionSkeletonType>;
}

import {
  Address,
  decodeAddressFromScript,
} from "../address";
import { Client } from "../client";
import { Script } from "../types";
import { Viewer } from "../viewer";
import { TransactionSkeletonType } from "../types/advanced";

export class ViewerCkbScript extends Viewer {
  constructor(
    private readonly script: Script,
    private readonly client: Client,
  ) {
    super();
  }

  async getClient(): Promise<Client> {
    return this.client;
  }

  async getInternalAddress(): Promise<string> {
    return this.getRecommendedAddress();
  }

  async getRecommendedAddressObj(): Promise<Address> {
    return (await this.getAddressObjs())[0];
  }
  async getAddressObjs(): Promise<Address[]> {
    return [decodeAddressFromScript(this.script, this.client)];
  }

  // Will be deprecated in the future
  async completeLumosTransaction(
    tx: TransactionSkeletonType,
  ): Promise<TransactionSkeletonType> {
    return tx;
  }
}

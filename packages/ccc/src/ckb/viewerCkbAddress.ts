import { encodeScriptToAddress } from "../address";
import { Client } from "../client";
import { Script } from "../types";
import { Viewer } from "../viewer";
import { TransactionSkeletonType } from "../types/lumos";

export class ViewerCkbAddress extends Viewer {
  constructor(
    private readonly script: Script,
    private readonly client: Client,
  ) {
    super();
  }

  async getClient(): Promise<Client> {
    return this.client;
  }

  async getRecommendedAddress(): Promise<string> {
    return (await this.getAddresses())[0];
  }
  async getAddresses(): Promise<string[]> {
    return [
      encodeScriptToAddress(await this.client.getAddressPrefix(), this.script),
    ];
  }

  // Will be deprecated in the future
  async completeLumosTransaction(
    tx: TransactionSkeletonType,
  ): Promise<TransactionSkeletonType> {
    return tx;
  }
}

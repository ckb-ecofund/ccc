import { Address } from "./address";
import { Client } from "./client";

export abstract class Viewer {
  constructor(public readonly client: Client) {}

  abstract getInternalAddress(): Promise<string>;

  abstract getAddressObjs(): Promise<Address[]>;
  async getRecommendedAddressObj(_preference?: unknown): Promise<Address> {
    return (await this.getAddressObjs())[0];
  }

  async getRecommendedAddress(preference?: unknown): Promise<string> {
    return Address.toString(await this.getRecommendedAddressObj(preference));
  }
  async getAddresses(): Promise<string[]> {
    return this.getAddressObjs().then((addresses) =>
      addresses.map((address) => Address.toString(address)),
    );
  }
}

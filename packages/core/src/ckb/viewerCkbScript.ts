import { Client } from "../client";
import { Script } from "./types";
import { Viewer } from "../viewer";
import { Address } from "../address";

export class ViewerCkbScript extends Viewer {
  constructor(
    private readonly script: Script,
    client: Client,
  ) {
    super(client);
  }

  async getInternalAddress(): Promise<string> {
    return this.getRecommendedAddress();
  }

  async getAddressObjs(): Promise<Address[]> {
    return [await Address.fromScript(this.script, this.client)];
  }
}

import { Client } from "../../client";
import { Hex, HexLike, hexFrom } from "../../hex";
import { SignerEvm } from "./signerEvm";

export abstract class SignerEvmAddressReadonly extends SignerEvm {
  private readonly address: Hex;

  constructor(client: Client, address: HexLike) {
    super(client);

    this.address = hexFrom(address);
  }

  async connect(): Promise<void> {}

  async getEvmAccount(): Promise<string> {
    return this.address;
  }
}
